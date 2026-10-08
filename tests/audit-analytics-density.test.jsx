import { afterEach, expect, test, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import Analytics from "../src/pages/Analytics";
import { analyticsCount } from "../src/features/analytics/labels";

const state = vi.hoisted(() => ({ dashboard: null }));
vi.mock("../src/api/archiveApi", () => ({
  useGetAnalyticsDashboardQuery: () => ({
    currentData: {
      analyticsDashboard: state.dashboard,
      meta: { snapshotId: "density-publication" },
    },
  }),
  useGetDriverComparisonQuery: () => ({}),
  useGetProfileQuery: () => ({}),
  useGetLayoutsQuery: () => ({}),
}));
vi.mock("../src/features/analytics/components/EChart", () => ({
  default: ({ description }) => (
    <figure aria-label={description}>{description}</figure>
  ),
}));
afterEach(cleanup);
test.each([
  [352, "352 published entries"],
  [1, "1 published entry"],
])(
  "UX-11 published entry count %i has grammatical coverage copy",
  (count, expected) => {
    expect(analyticsCount(count, "published entry", "published entries")).toBe(
      expected,
    );
  },
);

test.each([
  [
    "driver unavailable",
    { driverCoverage: "unavailable" },
    "standing:2024:1",
    false,
    true,
  ],
  [
    "constructor unavailable",
    { constructorCoverage: "unavailable" },
    "standing:2024:1",
    true,
    false,
  ],
  ["wrong season", { season: 2023 }, "standing:2024:1", false, false],
  [
    "wrong publication",
    { snapshotId: "other-publication" },
    "standing:2024:1",
    false,
    false,
  ],
  ["wrong standing round", {}, "standing:2024:2", false, false],
  ["wrong standing season", {}, "standing:2023:1", false, false],
  ["missing standing context", {}, null, false, false],
])(
  "UX-11 summary rejects %s without replacing championship with filtered points",
  (_, championshipPatch, standingId, driverVisible, teamVisible) => {
    mount({ championshipPatch, standingId });
    const summary = screen.getByRole("region", {
      name: "Analysis scope and summary",
    });
    expect(Boolean(within(summary).queryByText(/33\.50/))).toBe(driverVisible);
    expect(Boolean(within(summary).queryByText(/40\.125/))).toBe(teamVisible);
    expect(
      within(summary).getByText(/Selected result points: 25/),
    ).toBeInTheDocument();
  },
);

function Location() {
  return (
    <output aria-label="Current density URL">{useLocation().search}</output>
  );
}
function mount({
  empty = false,
  championshipPatch = {},
  standingId = "standing:2024:1",
} = {}) {
  state.dashboard = {
    filters: { season: 2024, sessionType: "race" },
    filterOptions: {
      seasons: [{ year: 2024 }],
      drivers: [{ id: "driver:one", name: "Independent Driver" }],
    },
    analysisScope: {
      empty,
      matchingEntries: empty ? 0 : 1,
      publishedSessions: 1,
      coverage: "partial",
    },
    championship: {
      season: 2024,
      round: 1,
      snapshotId: "density-publication",
      driverCoverage: "partial",
      constructorCoverage: "partial",
      drivers: [
        {
          rank: 1,
          standingSnapshotId: standingId,
          entity: { id: "driver:one", displayName: "Published Leader" },
          points: "33.50",
        },
      ],
      constructors: [
        {
          rank: 1,
          standingSnapshotId: standingId,
          entity: { id: "constructor:one", displayName: "Published Team" },
          points: "40.125",
        },
      ],
    },
    quickStats: { totalPoints: empty ? null : 25, retirementRate: null },
    seasonIntelligence: {},
    pointsProgression: {
      events: [{ round: 1 }],
      series: empty
        ? []
        : [
            {
              driverId: "driver:one",
              driverName: "Independent Driver",
              points: [25],
            },
          ],
    },
    qualifyingVsFinish: [],
    constructorContribution: [],
    circuitPerformance: { cells: [] },
    defaultComparison: { drivers: [] },
  };
  Object.assign(state.dashboard.championship, championshipPatch);
  return render(
    <MemoryRouter
      initialEntries={[
        `/analytics?season=2024${empty ? "&driverIds=archive-only" : ""}`,
      ]}
    >
      <Analytics />
      <Location />
    </MemoryRouter>,
  );
}

test("UX-11 one compact summary immediately precedes the first points panel after filters", () => {
  mount();
  const summary = screen.getByRole("region", {
    name: "Analysis scope and summary",
  });
  expect(
    screen.getAllByRole("region", { name: "Analysis scope and summary" }),
  ).toHaveLength(1);
  const points = screen.getByRole("region", {
    name: "Selected-result points progression",
  });
  expect(
    summary.compareDocumentPosition(points) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
  expect(summary.nextElementSibling.firstElementChild).toBe(points);
  expect(points).toHaveClass("analytics-primary-chart");
  expect(
    screen.queryByRole("list", { name: "Season summary" }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("region", { name: "Selected result scope" }),
  ).not.toBeInTheDocument();
  expect(
    within(summary).getByRole("link", { name: "Overview" }),
  ).toHaveAttribute("href", "/?season=2024");
  expect(
    within(summary).getByRole("link", { name: "Overview" }).parentElement,
  ).toHaveClass("analytics-scope-summary-links");
  expect(
    summary.querySelector(".analytics-scope-summary-heading"),
  ).not.toContainElement(
    within(summary).getByRole("link", { name: "Overview" }),
  );
  expect(within(summary).getByText(/33\.50/)).toBeInTheDocument();
  expect(within(summary).getByText(/40\.125/)).toBeInTheDocument();
  expect(
    within(summary).getByText(/25.*selected|selected.*25/i),
  ).toBeInTheDocument();
});

test("UX-11 native closed context unmounts repeated panels but restores analyses and pinned standings on activation", async () => {
  const { container } = mount();
  const summary = screen.getByText(
    "Season context and published championship",
    { selector: "summary" },
  );
  const details = summary.closest("details");
  expect(details).not.toHaveAttribute("open");
  expect(
    container.querySelector(".analytics-championship-snapshot"),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("heading", { name: "Season intelligence" }),
  ).not.toBeInTheDocument();
  summary.focus();
  expect(summary).toHaveFocus();
  // Native summary click activation; real Enter/Space default behaviour is a browser gate.
  await userEvent.click(summary);
  expect(
    await screen.findByRole("heading", { name: "Championship snapshot" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "View standings" })).toHaveAttribute(
    "href",
    "/standings?season=2024&snapshot=density-publication&round=1",
  );
  expect(
    screen.getByRole("heading", { name: "Weekend timeline" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "Race readout" }),
  ).toBeInTheDocument();
  await userEvent.click(summary);
  expect(
    container.querySelector(".analytics-championship-snapshot"),
  ).not.toBeInTheDocument();
  for (const name of [
    "Qualifying versus finish",
    "Selected-result constructor contribution",
    "Circuit performance",
    "Driver comparison",
    "Form & insights",
  ])
    expect(screen.getByRole("heading", { name })).toBeInTheDocument();
});

test("UX-11 empty filtered scope stays explicit with null points and reset while championship remains distinct", () => {
  mount({ empty: true });
  const summary = screen.getByRole("region", {
    name: "Analysis scope and summary",
  });
  expect(
    within(summary).getByText("No published entries for this selection"),
  ).toBeInTheDocument();
  expect(within(summary).getByText(/33\.50/)).toBeInTheDocument();
  expect(
    within(summary).getByText(/Selected result points: Not available/),
  ).toBeInTheDocument();
  expect(screen.queryByText(/leading drivers shown/)).not.toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("button", { name: "Reset analysis filters" }),
  );
  expect(screen.getByLabelText("Current density URL")).toHaveTextContent(
    "?season=2024",
  );
});
