import { afterEach, expect, test, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChampionshipGraphics } from "../src/features/season/ChampionshipGraphics";
const state = vi.hoisted(() => ({
  data: null,
  error: null,
  calls: [],
  fetching: false,
}));
vi.mock("../src/api/archiveApi", () => ({
  useGetHomeChampionshipGraphicsQuery: (args, options) => {
    state.calls.push({ args, options });
    return {
      currentData: state.data,
      error: state.error,
      isError: !!state.error,
      isFetching: state.fetching,
      isSuccess: !!state.data,
      refetch: vi.fn(),
    };
  },
}));
const rows = (kind) =>
  ["A", "B", "C"].map((entityId, index) => ({
    entity: { id: `${kind}:${entityId}`, displayName: `${kind} ${entityId}` },
    rank: index + 1,
  }));
function data() {
  return {
    meta: { snapshotId: "pinned", coverage: "partial" },
    graphics: {
      snapshotId: "pinned",
      year: 2000,
      round: 2,
      standingSnapshotId: "standing:2000:2",
      rounds: [
        { round: 1, name: "Earlier race", eventId: "e1" },
        { round: 2, name: "Latest race", eventId: "e2" },
      ],
      drivers: rows("driver").map((row) => ({
        entityId: row.entity.id,
        name: row.entity.displayName,
        rounds: [
          {
            round: 1,
            gap: "9.9",
            points: "10.2",
            rank: 2,
            leaderId: "driver:outside",
            leaderName: "Outside leader",
            leaderPoints: "20.1",
            racePoints: "0.1",
            coverage: "partial",
            raceCoverage: "complete",
          },
          {
            round: 2,
            gap: "0",
            points: "25",
            rank: 1,
            leaderId: "driver:A",
            leaderName: "driver A",
            leaderPoints: "25",
            racePoints: "0",
            coverage: "complete",
            raceCoverage: "complete",
          },
        ],
      })),
      constructors: rows("constructor").map((row) => ({
        entityId: row.entity.id,
        name: row.entity.displayName,
        rounds: [1, 2].map((round) => ({
          round,
          points: "10.2",
          gap: "9.9",
          rank: 2,
          leaderId: "constructor:outside",
          leaderName: "Outside team",
          leaderPoints: "20.1",
          coverage: "partial",
        })),
      })),
    },
  };
}
function View({
  kind = "drivers",
  suppliedRows = rows(kind === "drivers" ? "driver" : "constructor"),
  onSnapshotReset = vi.fn(),
}) {
  return (
    <ChampionshipGraphics
      kind={kind}
      rows={suppliedRows}
      year={2000}
      round={2}
      standingSnapshotId="standing:2000:2"
      snapshotId="pinned"
      onSnapshotReset={onSnapshotReset}
    />
  );
}
afterEach(() => {
  cleanup();
  state.data = null;
  state.error = null;
  state.calls = [];
  state.fetching = false;
});
test("driver chase uses exactly the three displayed IDs, zero baseline and historical leader with exact keyboard-inspectable figures", async () => {
  state.data = data();
  render(<View />);
  const chart = screen.getByRole("region", { name: "Championship chase" });
  expect(within(chart).getByText(/0 = leader/)).toBeInTheDocument();
  expect(within(chart).getAllByTestId("chase-series")).toHaveLength(3);
  await userEvent.setup().click(within(chart).getByText("Exact round figures"));
  const select = within(chart).getByRole("combobox", {
    name: "Inspect completed round",
  });
  expect(select.closest("details")).not.toBeNull();
  await userEvent.setup().selectOptions(select, "1");
  expect(chart).toHaveTextContent("Outside leader");
  expect(chart).toHaveTextContent("9.9");
  expect(chart).toHaveTextContent("0.1");
  expect(state.calls[0].args).toEqual({
    year: 2000,
    standingSnapshotId: "standing:2000:2",
    snapshotId: "pinned",
  });
});
test.each(["publication", "standing", "IDs", "future", "duplicate-round"])(
  "rejects %s context rather than blending old chart data",
  (failure) => {
    state.data = data();
    if (failure === "publication") state.data.meta.snapshotId = "old";
    if (failure === "standing")
      state.data.graphics.standingSnapshotId = "standing:1999:2";
    if (failure === "IDs") state.data.graphics.drivers[0].entityId = "foreign";
    if (failure === "future")
      state.data.graphics.rounds.push({
        round: 3,
        name: "Future",
        eventId: "e3",
      });
    if (failure === "duplicate-round") state.data.graphics.rounds[1].round = 1;
    render(<View />);
    expect(
      screen.getByText("Graphic context not available"),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("chase-series")).not.toBeInTheDocument();
  },
);

test.each([
  "unavailable-meta",
  "null-driver-cell",
  "null-constructor-cell",
  "bad-constructor-gap",
])("malformed %s is unavailable without crashing Home", (failure) => {
  state.data = data();
  let kind = "drivers";
  if (failure === "unavailable-meta") state.data.meta.coverage = "unavailable";
  if (failure === "null-driver-cell")
    state.data.graphics.drivers[0].rounds[0] = null;
  if (failure === "null-constructor-cell") {
    kind = "constructors";
    state.data.graphics.constructors[0].rounds[0] = null;
  }
  if (failure === "bad-constructor-gap") {
    kind = "constructors";
    state.data.graphics.constructors[0].rounds[0].gap = "-1";
  }
  expect(() => render(<View kind={kind} />)).not.toThrow();
  expect(screen.getByText("Graphic context not available")).toBeInTheDocument();
});
test("latest deficits stay quantitative and disclose missing/partial without borrowing an earlier gap", () => {
  state.data = data();
  state.data.graphics.drivers[1].rounds[1].gap = "10.25";
  state.data.graphics.drivers[1].rounds[1].coverage = "partial";
  state.data.graphics.drivers[2].rounds[1].gap = null;
  state.data.graphics.drivers[2].rounds[1].coverage = "unavailable";
  render(<View />);
  const legend = screen.getByRole("list");
  expect(legend).toHaveTextContent("0 pts");
  expect(legend).toHaveTextContent("10.25* pts");
  expect(legend).toHaveTextContent("— pts");
  expect(legend).not.toHaveTextContent("9.9 pts");
  expect(screen.getByText(/Latest R2 gaps/)).toHaveTextContent(
    "partial standings",
  );
});

test("both compact plots preserve the 84px Apex geometry and native round inspection", () => {
  state.data = data();
  const { rerender } = render(<View />);
  expect(screen.getByRole("img", { name: /Points deficit/ })).toHaveAttribute(
    "viewBox",
    "0 0 280 84",
  );
  rerender(<View kind="constructors" />);
  expect(screen.getByRole("img", { name: /Points deficit/ })).toHaveAttribute(
    "viewBox",
    "0 0 280 84",
  );
  expect(
    screen.getByText("Exact round figures").closest("details"),
  ).not.toBeNull();
  expect(screen.getByText(/Hollow dots/).closest("details")).not.toBeNull();
});
test("no supplied standings skips graphics, and stale-publication recovery uses the parent reset", async () => {
  const reset = vi.fn();
  state.error = { status: 409 };
  const { rerender } = render(
    <View suppliedRows={[]} onSnapshotReset={reset} />,
  );
  expect(state.calls.at(-1).options.skip).toBe(true);
  rerender(<View onSnapshotReset={reset} />);
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: /Try again/ }));
  expect(reset).toHaveBeenCalledOnce();
  expect(screen.queryByTestId("chase-series")).not.toBeInTheDocument();
});
