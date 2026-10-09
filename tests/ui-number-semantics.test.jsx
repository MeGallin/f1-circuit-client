import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import { DriverNumber } from "../src/components/ui";
import { LeaderList, RacePodium } from "../src/features/season/RaceSummary";
import { SeasonEventStrip } from "../src/features/season/SeasonEventStrip";
import AnalyticsChampionshipSnapshot, {
  buildChampionshipSnapshotModel,
} from "../src/features/analytics/components/AnalyticsChampionshipSnapshot";
afterEach(cleanup);

test("analytics championship model and shared identity retain published driver number zero", () => {
  const championship = {
    season: 2000,
    round: 1,
    snapshotId: "fixture",
    driverCoverage: "partial",
    constructorCoverage: "unavailable",
    constructors: [],
    drivers: [
      {
        rank: 1,
        number: 0,
        points: "0",
        standingSnapshotId: "standing:2000:1",
        entity: { id: "driver:zero", displayName: "Zero-number fixture" },
      },
    ],
  };
  expect(
    buildChampionshipSnapshotModel({ championship }).drivers[0].number,
  ).toBe(0);
  render(
    <AnalyticsChampionshipSnapshot
      championship={championship}
      year={2000}
      snapshotId="fixture"
    />,
  );
  expect(screen.getByText("Driver number 0")).toBeInTheDocument();
});

test("missing standing rank has real screen-reader text, not prohibited generic-span naming", () => {
  const { container } = render(
    <LeaderList
      kind="drivers"
      entries={[
        {
          id: "missing-rank",
          rank: null,
          entity: { displayName: "Fixture" },
          points: "0",
        },
      ]}
    />,
  );
  expect(container.querySelector(".leader-rank")).not.toHaveAttribute(
    "aria-label",
  );
  expect(screen.getByText("Rank not supplied")).toHaveClass("sr-only");
});

test("source driver number zero is retained rather than replaced by a fallback number", () => {
  render(
    <>
      <LeaderList
        kind="drivers"
        entries={[
          {
            id: "zero-number",
            rank: 1,
            number: 0,
            entity: { displayName: "Fixture", number: 42 },
            points: "0",
          },
        ]}
      />
      <RacePodium
        detail={{
          podium: [
            {
              id: "podium",
              position: 1,
              entry: {
                number: 0,
                driverNumber: 42,
                drivers: [{ displayName: "Fixture" }],
              },
              points: "0",
            },
          ],
        }}
      />
    </>,
  );
  expect(screen.getAllByText("Driver number 0")).toHaveLength(2);
  expect(screen.queryByText("Driver number 42")).not.toBeInTheDocument();
});
test("number badges expose meaningful text without prohibited generic-span naming", () => {
  const { container } = render(<DriverNumber number={18} />);
  expect(container.querySelector(".driver-number")).not.toHaveAttribute(
    "aria-label",
  );
  expect(screen.getByText("Driver number 18")).toHaveClass("sr-only");
  expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent(
    "18",
  );
});
test("podium position and ribbon count have real text equivalents, not generic aria-labels", () => {
  const { container } = render(
    <>
      <RacePodium
        detail={{
          podium: [
            {
              position: 1,
              points: 25,
              driver: { displayName: "Published driver" },
            },
          ],
        }}
      />
      <SeasonEventStrip events={[]} />
    </>,
  );
  expect(container.querySelector(".race-podium-position")).not.toHaveAttribute(
    "aria-label",
  );
  expect(screen.getByText("Position 1")).toHaveClass("sr-only");
  expect(container.querySelector(".season-races-count")).not.toHaveAttribute(
    "aria-label",
  );
  expect(screen.getByText("0 of 0 races have published results")).toHaveClass(
    "sr-only",
  );
});
