import { afterEach, expect, test, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import Analytics, { buildAnalyticsPanelLinks } from "../src/pages/Analytics";
import {
  PointsProgressionChart,
  ConstructorContributionChart,
  DriverComparisonChart,
  getChartTheme,
} from "../src/features/analytics/components/AnalyticsCharts";
import AnalyticsChampionshipSnapshot, {
  buildChampionshipSnapshotModel,
} from "../src/features/analytics/components/AnalyticsChampionshipSnapshot";
import { readFileSync } from "node:fs";
import { buildAnalyticsFormInsightsModel } from "../src/features/analytics/components/AnalyticsFormInsights";
import { buildRaceBreakdownModel } from "../src/features/analytics/components/AnalyticsRaceBreakdown";
import { championshipContextValid } from "../src/features/analytics/championship";

const state = vi.hoisted(() => ({
  dashboard: null,
  previous: null,
  pending: false,
  chart: null,
}));

test("review: absent championship/year with a supplied publication safely remains unavailable", () => {
  expect(championshipContextValid(undefined, undefined, "fixture")).toBe(false);
});
vi.mock("../src/api/archiveApi", () => ({
  useGetAnalyticsDashboardQuery: () => ({
    isFetching: state.pending,
    data: state.previous ? { analyticsDashboard: state.previous } : undefined,
    currentData: state.pending
      ? undefined
      : {
          analyticsDashboard: state.dashboard,
          meta: { snapshotId: "fixture" },
        },
  }),
  useGetDriverComparisonQuery: () => ({}),
  useGetProfileQuery: () => ({}),
  useGetLayoutsQuery: () => ({}),
}));
vi.mock("../src/features/analytics/components/EChart", () => ({
  default: ({ description, option }) => {
    state.chart = option;
    return <div>{description}</div>;
  },
}));
afterEach(() => {
  cleanup();
  state.pending = false;
  state.previous = null;
});

test("review: source names cannot inject HTML through chart tooltip formatters", () => {
  render(
    <PointsProgressionChart
      data={{
        events: [{ round: 1, name: "<img src=x onerror=alert(1)>" }],
        series: [{ driverName: "Driver <script>bad</script>", points: [25] }],
      }}
    />,
  );
  const html = state.chart.tooltip.formatter([
    {
      dataIndex: 0,
      seriesName: "D. <script>bad</script>",
      value: 25,
      marker: "",
    },
  ]);
  expect(html).not.toContain("<img");
  expect(html).not.toContain("<script>");
  expect(html).toContain("&lt;img");
});

test("review: constructor records without published points show unavailable, not a populated zero-series chart", () => {
  render(
    <ConstructorContributionChart
      rows={[{ constructorName: "Missing Points", totalPoints: null }]}
    />,
  );
  expect(
    screen.getByText("No constructor points available"),
  ).toBeInTheDocument();
  expect(screen.queryByText(/^0 constructors ranked/)).not.toBeInTheDocument();
});

test("review: chart fallback palette follows active Apex theme and brand without duplicate hex values", () => {
  const tokens = JSON.parse(
    readFileSync("src/design-system/apex.tokens.json", "utf8"),
  );
  const original = document.documentElement.dataset.theme;
  document.documentElement.dataset.theme = "light";
  try {
    expect(getChartTheme().colors.line).toBe(tokens.themes.light.line);
    expect(getChartTheme().colors.accent).toBe(tokens.brands.red.light.accent);
  } finally {
    if (original == null) delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = original;
  }
});

test("review: pending new season retains known seasons, not old eligible entities", () => {
  state.previous = {
    filters: { season: 2023, sessionType: "race" },
    filterOptions: {
      seasons: [
        { year: 2023, name: "2023" },
        { year: 2024, name: "2024" },
      ],
      drivers: [{ id: "driver:old", name: "Previous season only" }],
    },
  };
  state.pending = true;
  render(
    <MemoryRouter initialEntries={["/analytics?season=2024"]}>
      <Analytics />
    </MemoryRouter>,
  );
  expect(screen.getByRole("combobox", { name: "Season" })).not.toBeDisabled();
  expect(screen.getByRole("combobox", { name: "Driver" })).toBeDisabled();
  expect(
    screen.queryByRole("option", { name: "Previous season only" }),
  ).not.toBeInTheDocument();
});

test.each(["driverCoverage", "snapshotId", "season", "standingSnapshotId"])(
  "review: expanded championship rejects invalid %s context",
  (invalid) => {
    const row = {
      rank: 1,
      points: "33.50",
      entity: { id: "driver:one", displayName: "Wrong context" },
      standingSnapshotId: "standing:2024:1",
    };
    const championship = {
      season: 2024,
      round: 1,
      snapshotId: "fixture",
      driverCoverage: "complete",
      drivers: [row],
    };
    if (invalid === "driverCoverage")
      championship.driverCoverage = "unavailable";
    if (invalid === "snapshotId") championship.snapshotId = "other";
    if (invalid === "season") championship.season = 2023;
    if (invalid === "standingSnapshotId")
      row.standingSnapshotId = "standing:2024:2";
    const model = buildChampionshipSnapshotModel({
      championship,
      year: 2024,
      snapshotId: "fixture",
    });
    expect(model.drivers).toEqual([]);
  },
);

test("standings action pins the displayed publication and standings round", () => {
  expect(
    buildAnalyticsPanelLinks({
      season: 2024,
      snapshotId: "fixture",
      standingRound: 1,
    }).standings,
  ).toBe("/standings?season=2024&snapshot=fixture&round=1");
});

function Location() {
  return <output aria-label="Current URL">{useLocation().search}</output>;
}
function renderPage(query = "season=2024&driverIds=driver:archive-only") {
  state.dashboard = {
    filters: {
      season: 2024,
      sessionType: "race",
      driverIds: ["driver:archive-only"],
    },
    filterOptions: {
      seasons: [{ year: 2024, name: "2024" }],
      drivers: [{ id: "driver:one", name: "Eligible Driver" }],
    },
    analysisScope: { empty: true, matchingEntries: 0, coverage: "partial" },
    championship: {
      season: 2024,
      round: 1,
      drivers: [],
      constructors: [],
      snapshotId: "fixture",
    },
    quickStats: { totalPoints: null, raceWinnerCount: null },
    seasonIntelligence: {},
    pointsProgression: { events: [{ round: 1 }], series: [] },
    qualifyingVsFinish: [],
    constructorContribution: [],
    circuitPerformance: { cells: [] },
    defaultComparison: { drivers: [] },
  };
  return render(
    <MemoryRouter initialEntries={[`/analytics?${query}`]}>
      <Analytics />
      <Location />
    </MemoryRouter>,
  );
}

test("UX-01 championship rows preserve published rank/points and ignore derived result sums", () => {
  const model = buildChampionshipSnapshotModel({
    championship: {
      season: 2024,
      round: 1,
      snapshotId: "fixture",
      driverCoverage: "partial",
      constructorCoverage: "partial",
      drivers: [
        {
          standingSnapshotId: "standing:2024:1",
          rank: 1,
          entity: { id: "driver:one", displayName: "Published Leader" },
          points: "33",
          number: "7",
          wins: 1,
        },
      ],
      constructors: [
        {
          standingSnapshotId: "standing:2024:1",
          rank: 1,
          entity: { id: "constructor:one", displayName: "Published Team" },
          points: "40",
        },
      ],
    },
    comparison: {
      drivers: [
        { id: "driver:other", name: "Derived Leader", metrics: { points: 25 } },
      ],
    },
    constructors: [{ constructorId: "constructor:other", totalPoints: 25 }],
  });
  expect(model.drivers[0]).toMatchObject({
    rank: 1,
    name: "Published Leader",
    value: 33,
    number: "7",
  });
  expect(model.teams[0].value).toBe(40);
});

test("championship explanation spans the standings grid instead of consuming a column", () => {
  const { container } = render(
    <AnalyticsChampionshipSnapshot
      year={2024}
      championship={{ round: 1, season: 2024, drivers: [], constructors: [] }}
    />,
  );
  const note = container.querySelector(".analytics-championship-note");
  expect(note).toBeInTheDocument();
  const css = readFileSync("src/design-system/analytics-scope.css", "utf8");
  expect(css).toMatch(
    /\.analytics-championship-note\s*\{[^}]*grid-column:\s*1\s*\/\s*-1/s,
  );
  expect(
    container.querySelectorAll(
      ".analytics-championship-snapshot > .analytics-championship-group",
    ),
  ).toHaveLength(2);
});

test("UX-01 missing championship publication never displays a derived standings fallback", () => {
  const model = buildChampionshipSnapshotModel({
    comparison: { drivers: [{ id: "one", metrics: { points: 25 } }] },
  });
  expect(model.drivers).toEqual([]);
});

test("UX-02 retirement labels and known-outcome denominator agree", () => {
  const model = buildAnalyticsFormInsightsModel({
    leader: { driverId: "one" },
    comparison: { drivers: [{ id: "one", metrics: { retirementRate: 0.5 } }] },
  });
  expect(model.retirementRate).toMatchObject({
    value: "50%",
    detail: "Of known finished/retired starts in selected results",
  });
  const breakdown = buildRaceBreakdownModel({
    entries: 7,
    starts: 4,
    classified: 2,
    retirements: 1,
    retirementEligibleStarts: 2,
    unknownStatus: 1,
    nonStarts: 2,
    disqualified: 1,
    otherStatus: 1,
    classificationUnknown: 2,
  });
  expect(breakdown.at(-1).detail).toContain("1 retired");
  expect(breakdown.at(-1).detail).toContain("2 classification unknown");
});

test("UX-02 zero eligible retirement denominator stays unavailable", () => {
  expect(
    buildAnalyticsFormInsightsModel({
      leader: { driverId: "one" },
      comparison: {
        drivers: [{ id: "one", metrics: { retirementRate: null } }],
      },
    }).retirementRate.value,
  ).toBeNull();
  expect(buildRaceBreakdownModel({ entries: 0 }).at(-1).percentage).toBeNull();
});

test("UX-08 all-null series cannot claim leading drivers are shown", () => {
  render(
    <PointsProgressionChart
      data={{
        events: [{ round: 1 }],
        series: [{ driverId: "one", driverName: "No Points", points: [null] }],
      }}
    />,
  );
  expect(
    screen.getByText("No points progression available"),
  ).toBeInTheDocument();
  expect(screen.queryByText(/leading drivers shown/)).not.toBeInTheDocument();
});

test("single record chart captions and standing win counts use singular grammar", () => {
  render(
    <PointsProgressionChart
      data={{
        events: [{ round: 1 }],
        series: [{ driverId: "one", driverName: "Zero Points", points: [0] }],
      }}
    />,
  );
  expect(
    screen.getByText(/^1 driver shown across 1 event/),
  ).toBeInTheDocument();
  cleanup();
  render(
    <ConstructorContributionChart
      rows={[{ constructorName: "One Team", totalPoints: 0, drivers: [] }]}
    />,
  );
  expect(screen.getByText(/^1 constructor /)).toBeInTheDocument();
  cleanup();
  render(<DriverComparisonChart rows={[{ name: "One Driver", points: 0 }]} />);
  expect(screen.getByText(/^1 driver ranked/)).toBeInTheDocument();
  const model = buildChampionshipSnapshotModel({
    championship: {
      season: 2024,
      round: 1,
      snapshotId: "fixture",
      driverCoverage: "partial",
      drivers: [
        {
          rank: 1,
          entity: { id: "one" },
          points: "0",
          wins: 1,
          standingSnapshotId: "standing:2024:1",
        },
      ],
    },
  });
  expect(model.drivers[0].detail).toBe("1 published win");
});

test("qualifying comparison labels its published entry count rather than race starts", () => {
  render(
    <DriverComparisonChart
      rows={[{ name: "One Driver", races: 1, qualifyingEntries: 1 }]}
      metric="races"
    />,
  );
  expect(screen.getByText(/ranked by qualifying entries/)).toBeInTheDocument();
});

test("UX-08 invalid URL selection is explained, remains visible, and resets explicitly", () => {
  renderPage();
  expect(
    screen.getByText("No published entries for this selection"),
  ).toBeInTheDocument();
  expect(screen.getByRole("combobox", { name: "Driver" })).toHaveValue(
    "driver:archive-only",
  );
  expect(
    screen.getByText(/Season context.*unaffected by analysis filters/),
  ).toBeInTheDocument();
  expect(screen.queryByText(/leading drivers shown/)).not.toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("button", { name: "Reset analysis filters" }),
  );
  expect(screen.getByLabelText("Current URL").textContent).toBe("?season=2024");
});

test("selected-result scope body has a shared token inset separate from the panel header", async () => {
  const { container } = renderPage();
  expect(container.querySelector(".analytics-scope-body")).toBeInTheDocument();
  const css = readFileSync("src/design-system/analytics-scope.css", "utf8");
  expect(css).toMatch(
    /\.analytics-scope-body,\s*\.analytics-panel-scope-note\s*\{[^}]*padding:\s*var\(--apex-space-7\)/s,
  );
  fireEvent.click(
    screen.getByText("Season context and published championship", {
      selector: "summary",
    }),
  );
  await waitFor(() =>
    expect(
      screen.getByRole("heading", { name: "Race readout" }),
    ).toBeInTheDocument(),
  );
  const notes = [
    ...container.querySelectorAll(".analytics-page .panel > p.muted"),
  ].filter((note) =>
    /^(Filtered circuit finishes|Selected result scope|race results only|Points from selected|Selected result totals|Season race context)/.test(
      note.textContent,
    ),
  );
  expect(notes).toHaveLength(9);
  notes.forEach((note) =>
    expect(note).toHaveClass("analytics-panel-scope-note"),
  );
});
