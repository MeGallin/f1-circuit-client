import { afterEach, expect, test, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { readFileSync } from "node:fs";
import { ChampionshipGraphics } from "../src/features/season/ChampionshipGraphics";
const state = vi.hoisted(() => ({ data: null }));
vi.mock("../src/api/archiveApi", () => ({
  useGetHomeChampionshipGraphicsQuery: () => ({
    currentData: state.data,
    isSuccess: true,
  }),
}));
const rows = ["Mercedes", "Ferrari", "McLaren"].map((name) => ({
  entity: { id: name },
}));
function fixture() {
  return {
    meta: { snapshotId: "pin", coverage: "partial" },
    graphics: {
      snapshotId: "pin",
      year: 2026,
      round: 16,
      standingSnapshotId: "standing:2026:16",
      rounds: [1, 2, 16].map((round) => ({
        round,
        eventId: `e${round}`,
        name: `Race ${round}`,
      })),
      constructors: rows.map(({ entity }, index) => ({
        entityId: entity.id,
        name: entity.id,
        rounds: [
          {
            round: 1,
            points: ["43", "27", "10"][index],
            gap: ["0", "16", "33"][index],
            rank: index + 1,
            leaderId: "Mercedes",
            leaderName: "Mercedes",
            leaderPoints: "43",
            coverage: "partial",
          },
          {
            round: 2,
            points: null,
            gap: null,
            rank: null,
            leaderId: null,
            leaderName: null,
            leaderPoints: null,
            coverage: "unavailable",
          },
          {
            round: 16,
            points: ["556", "405", "316"][index],
            gap: ["0", "151", "240"][index],
            rank: index + 1,
            leaderId: "Mercedes",
            leaderName: "Mercedes",
            leaderPoints: "556",
            coverage: "partial",
          },
        ],
      })),
    },
  };
}
function View() {
  return (
    <ChampionshipGraphics
      kind="constructors"
      rows={rows}
      year={2026}
      round={16}
      standingSnapshotId="standing:2026:16"
      snapshotId="pin"
    />
  );
}
afterEach(cleanup);
test("shared series have matching non-colour line and legend patterns with token-owned partial markers", () => {
  const css = readFileSync("src/design-system/compact-charts.css", "utf8");
  expect(css).toContain("stroke-dasharray: var(--compact-series-dash, none)");
  expect(css).toContain(
    "border-top-style: var(--compact-series-key-style, solid)",
  );
  expect(css).toMatch(
    /\.compact-series--2\s*\{[^}]*--compact-series-key-style: dashed/s,
  );
  expect(css).toMatch(
    /\.compact-series--3\s*\{[^}]*--compact-series-key-style: dotted/s,
  );
  expect(css).toMatch(
    /circle\[data-coverage="partial"\]\s*\{[^}]*fill: var\(--apex-color-surface\)/s,
  );
});
test("constructors reuse compact chase, visible names and latest exact gaps without mosaic", async () => {
  state.data = fixture();
  render(<View />);
  const chart = screen.getByRole("region", {
    name: "Points gap to the leader",
  });
  expect(chart).toHaveTextContent("0 = leader");
  expect(chart).toHaveTextContent("points behind");
  expect(within(chart).getByRole("img")).toHaveAttribute(
    "viewBox",
    "0 0 280 84",
  );
  const legend = within(chart).getByRole("list");
  for (const [index, item] of within(legend)
    .getAllByRole("listitem")
    .entries()) {
    expect(item).toHaveTextContent(rows[index].entity.id);
    expect(item).toHaveTextContent(["0* pts", "151* pts", "240* pts"][index]);
    expect(item.className).toContain(`compact-series--${index + 1}`);
  }
  const series = within(chart).getAllByTestId("chase-series");
  expect(series).toHaveLength(3);
  for (const item of series) {
    expect(
      item.querySelector("path").getAttribute("d").match(/M/g),
    ).toHaveLength(2);
    expect(
      item.querySelectorAll("circle[data-coverage='partial']"),
    ).toHaveLength(2);
  }
  await userEvent.setup().click(within(chart).getByText("Exact round figures"));
  await userEvent
    .setup()
    .selectOptions(
      within(chart).getByRole("combobox", { name: "Inspect completed round" }),
      "1",
    );
  const inspector = chart.querySelector("details");
  expect(inspector).toHaveTextContent("championship points 27, deficit 16");
  expect(inspector).toHaveTextContent("Round leader Mercedes (43)");
  expect(inspector).toHaveTextContent("standings partial");
  expect(inspector).not.toHaveTextContent("Race entry points");
  expect(screen.queryByTestId("round-cell")).not.toBeInTheDocument();
});
test("latest missing gap stays missing without borrowing an earlier result", () => {
  state.data = fixture();
  Object.assign(state.data.graphics.constructors[2].rounds[2], {
    gap: null,
    points: null,
    coverage: "unavailable",
  });
  render(<View />);
  expect(screen.getByRole("list")).toHaveTextContent("McLaren— pts");
  expect(
    screen.getAllByTestId("chase-series")[2].querySelectorAll("circle"),
  ).toHaveLength(1);
});
test.each([
  "negative-gap",
  "malformed-points",
  "missing-leader",
  "unavailable-number",
  "duplicate-round",
  "foreign-ID",
])("constructor %s is rejected", (failure) => {
  state.data = fixture();
  const cell = state.data.graphics.constructors[0].rounds[0];
  if (failure === "negative-gap") cell.gap = "-1";
  if (failure === "malformed-points") cell.points = "NaN";
  if (failure === "missing-leader") cell.leaderId = null;
  if (failure === "unavailable-number") cell.coverage = "unavailable";
  if (failure === "duplicate-round")
    state.data.graphics.constructors[0].rounds[1].round = 1;
  if (failure === "foreign-ID")
    state.data.graphics.constructors[0].entityId = "foreign";
  render(<View />);
  expect(screen.getByText("Graphic context not available")).toBeInTheDocument();
  expect(screen.queryByTestId("chase-series")).not.toBeInTheDocument();
});
