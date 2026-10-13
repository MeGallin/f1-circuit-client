import { afterEach, expect, test, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import { archiveApi, standingsResponse } from "../src/api/archiveApi";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import {
  StandingRows,
  StandingTitleOutlook,
  StandingCalculationDetails,
} from "../src/pages/Standings";
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
const outlook = {
  snapshotId: "pin",
  standingSnapshotId: "standing:2026:17",
  leaderId: "driver:fixture",
  ruleVersion: "test-rule",
  reasonCode: null,
  rivalCeiling: "388",
  coverage: "conditional",
  year: 2026,
  round: 17,
  leaderName: "Fixture leader",
  remainingMaximum: "150",
  sufficientAdditional: "49",
  remainingRaces: 6,
  remainingSprints: 0,
  targetWithinAvailablePoints: true,
  assumptions: [
    "Full points, no additional events or penalties.",
    "Published ranks bound rivals despite partial coverage.",
    "Minimum winning requirement and countback are not calculated.",
  ],
  sourceUrls: [
    "https://www.fia.com/news/fia-and-formula-1-announce-2026-sprint-calendar",
  ],
};
test("standings transform accepts legacy omission but rejects malformed or foreign outlook", () => {
  const envelope = {
    data: { items: [], page: { hasMore: false, nextCursor: null, total: 0 } },
    meta: { snapshotId: "pin" },
  };
  expect(standingsResponse(envelope).titleOutlook).toBeNull();
  for (const changes of [
    { snapshotId: "foreign" },
    { remainingMaximum: "NaN" },
    { remainingRaces: -1 },
    { sufficientAdditional: null },
    { standingSnapshotId: "standing:2000:17" },
  ]) {
    expect(() =>
      standingsResponse({
        ...envelope,
        data: { ...envelope.data, titleOutlook: { ...outlook, ...changes } },
      }),
    ).toThrow("Unexpected standings outlook");
  }
});

test("transport permits a signed rival ceiling while remaining budget and sufficient addition stay nonnegative", () => {
  const envelope = {
    data: {
      items: [],
      page: { hasMore: false, nextCursor: null, total: 0 },
      titleOutlook: {
        ...outlook,
        remainingMaximum: "0",
        sufficientAdditional: "0",
        rivalCeiling: "-5",
        remainingRaces: 0,
        remainingSprints: 0,
      },
    },
    meta: { snapshotId: "pin" },
  };
  expect(standingsResponse(envelope).titleOutlook.rivalCeiling).toBe("-5");
  for (const field of ["remainingMaximum", "sufficientAdditional"])
    expect(() =>
      standingsResponse({
        ...envelope,
        data: {
          ...envelope.data,
          titleOutlook: { ...envelope.data.titleOutlook, [field]: "-1" },
        },
      }),
    ).toThrow("Unexpected standings outlook");
});
test("actual standings transport retains outlook without spreading it to other collection endpoints", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            data: {
              items: [],
              page: { total: 0, hasMore: false, nextCursor: null },
              titleOutlook: outlook,
              unknownField: "do not spread",
            },
            meta: { snapshotId: "pin", coverage: "partial", sources: [] },
          }),
          { headers: { "Content-Type": "application/json" } },
        ),
    ),
  );
  const store = configureStore({
    reducer: { [archiveApi.reducerPath]: archiveApi.reducer },
    middleware: (g) => g().concat(archiveApi.middleware),
  });
  const query = store.dispatch(
    archiveApi.endpoints.getStandings.initiate({ year: 2026, kind: "drivers" }),
  );
  const data = await query.unwrap();
  expect(fetch.mock.calls[0][0].cache).toBe("no-cache");
  expect(data.titleOutlook).toEqual(outlook);
  expect(data).not.toHaveProperty("unknownField");
  const other = store.dispatch(archiveApi.endpoints.getSeasons.initiate());
  expect(await other.unwrap()).not.toHaveProperty("titleOutlook");
  query.unsubscribe();
  other.unsubscribe();
  store.dispatch(archiveApi.util.resetApiState());
});
test("row gaps show exact zero, fractional difference and unavailable without inventing zeros", () => {
  render(
    <MemoryRouter>
      <StandingRows
        kind="drivers"
        year={2000}
        rows={[
          {
            id: "a",
            entity: { displayName: "A" },
            constructors: [],
            gapToLeader: "0",
          },
          {
            id: "b",
            entity: { displayName: "B" },
            constructors: [],
            gapToLeader: "102.05",
          },
          {
            id: "c",
            entity: { displayName: "C" },
            constructors: [],
            gapToLeader: null,
          },
        ]}
      />
    </MemoryRouter>,
  );
  const gapLabels = screen.getAllByText(
    (_content, node) =>
      node.tagName === "DT" && node.textContent === "Gap to leader",
  );
  expect(gapLabels).toHaveLength(3);
  const gaps = gapLabels.map((label) => label.nextElementSibling.textContent);
  expect(gaps).toEqual(["0", "102.05", "Not supplied"]);
});

test("mobile gap label stays visibly short while retaining its full accessible meaning", () => {
  render(
    <MemoryRouter>
      <StandingRows
        kind="drivers"
        rows={[
          {
            id: "gap-label",
            entity: { displayName: "Fixture" },
            constructors: [],
            gapToLeader: "102",
          },
        ]}
      />
    </MemoryRouter>,
  );
  const label = screen.getByText("Gap", { exact: true });
  expect(label).toHaveAttribute("title", "Gap to leader");
  expect(label).toHaveTextContent("Gap to leader");
  expect(label.querySelector(".sr-only")).toHaveTextContent("to leader");
});
test("leader-only title summary exposes metrics with only the essential safe-not-minimum qualifier", () => {
  render(<StandingTitleOutlook outlook={outlook} kind="drivers" />);
  const region = screen.getByRole("region", { name: "Title outlook" });
  expect(region).toHaveTextContent("Fixture leader");
  expect(region).toHaveTextContent("150");
  expect(region).toHaveTextContent("49");
  expect(region).toHaveTextContent("Safe target (not minimum)");
  expect(region.querySelector("details")).toBeNull();
  expect(region).not.toHaveTextContent("Published ranks bound rivals");
});
test("oversized conservative target does not imply elimination or inability to secure", () => {
  render(
    <StandingCalculationDetails
      data={{
        titleOutlook: {
          ...outlook,
          sufficientAdditional: "151",
          targetWithinAvailablePoints: false,
        },
      }}
      kind="drivers"
    />,
  );
  const region = screen
    .getByText("Calculation and source details")
    .closest("details");
  expect(region).toHaveTextContent(
    "Conservative target exceeds points available",
  );
  expect(region).toHaveTextContent(
    "Minimum winning requirement not calculated",
  );
  expect(region).not.toHaveTextContent(
    /eliminated|cannot.*guarantee|cannot.*secure/i,
  );
});
test("zero sufficient addition remains zero, not a missing field", () => {
  render(
    <StandingTitleOutlook
      outlook={{ ...outlook, sufficientAdditional: "0" }}
      kind="constructors"
    />,
  );
  expect(
    screen.getByText("Safe target (not minimum)").nextElementSibling,
  ).toHaveTextContent(/^0$/);
});
test("older unsupported scoring remains explicit even when remaining maximum is known zero", () => {
  render(
    <StandingTitleOutlook
      outlook={{
        ...outlook,
        year: 2000,
        coverage: "unavailable",
        reasonCode: "SCORING_PROFILE_UNAVAILABLE",
        remainingMaximum: "0",
        sufficientAdditional: null,
      }}
      kind="drivers"
    />,
  );
  expect(
    screen.getByRole("region", { name: "Title outlook" }),
  ).toHaveTextContent("Verified scoring profile not available for this season");
  expect(
    screen.getByText("Maximum points remaining").nextElementSibling,
  ).toHaveTextContent(/^0$/);
  expect(
    screen.getByText("Safe target (not minimum)").nextElementSibling,
  ).toHaveTextContent("Not available");
});
