import { expect, test } from "vitest";
import {
  buildAnalyticsRequest,
  buildDriverComparisonRequest,
  buildAnalyticsPanelLinks,
  updateAnalyticsFilterParams,
} from "../src/pages/Analytics";
import {
  compactDriverName,
  compactCircuitName,
  lastKnownSeriesValue,
  rankComparisonRows,
  sortConstructorContributionRows,
} from "../src/features/analytics/components/AnalyticsCharts";
import {
  buildSeasonIntelligenceModel,
  formatAnalyticsDate,
} from "../src/features/analytics/seasonIntelligence";
import { buildChampionshipSnapshotModel } from "../src/features/analytics/components/AnalyticsChampionshipSnapshot";
import {
  buildRecentResultsModel,
  formatResultGap,
} from "../src/features/analytics/components/AnalyticsRecentResults";
import { buildAnalyticsSessionReadoutModel } from "../src/features/analytics/components/AnalyticsSessionReadout";
import {
  formatAnalyticsFreshness,
  buildAnalyticsOverviewModel,
} from "../src/features/analytics/components/AnalyticsOverviewStrip";
import { buildRaceBreakdownModel } from "../src/features/analytics/components/AnalyticsRaceBreakdown";
import { buildDriverSpotlightModel } from "../src/features/analytics/components/AnalyticsPerformanceSnapshot";
import { buildAnalyticsWeekendTimelineModel } from "../src/features/analytics/components/AnalyticsWeekendTimeline";
import { buildAnalyticsCircuitInsightModel } from "../src/features/analytics/components/AnalyticsCircuitInsight";
import { buildAnalyticsFormInsightsModel } from "../src/features/analytics/components/AnalyticsFormInsights";
import { buildAnalyticsQuickStatsModel } from "../src/pages/Analytics";

test("driver comparison request keeps the complete analytics scope", () => {
  const params = new URLSearchParams(
    "season=2024&fromRound=3&toRound=8&driverIds=driver:one,driver:two&constructorIds=constructor:ferrari&circuitIds=circuit:monza&sessionType=qualifying",
  );

  expect(buildDriverComparisonRequest(params)).toEqual({
    season: 2024,
    fromRound: "3",
    toRound: "8",
    drivers: ["driver:one", "driver:two"],
    constructorIds: ["constructor:ferrari"],
    circuitIds: ["circuit:monza"],
    sessionType: "qualifying",
    snapshotId: undefined,
  });
});

test("analytics panel links preserve the selected season and published entities", () => {
  expect(
    buildAnalyticsPanelLinks({
      season: 2026,
      latestRaceId: "event:2026:spanish-grand-prix",
      latestCircuitId: "circuit:madring",
      leaderId: "driver:antonelli",
    }),
  ).toEqual({
    calendar: "/calendar?season=2026",
    standings: "/standings?season=2026",
    latestRace: "/events/event%3A2026%3Aspanish-grand-prix?season=2026",
    latestCircuit: "/circuits/circuit%3Amadring?season=2026",
    leader: "/drivers/driver%3Aantonelli?season=2026",
  });
});

test("analytics dashboard request normalizes the URL filter scope", () => {
  const params = new URLSearchParams(
    "season=2025&driverIds=driver:one&constructorIds=constructor:one&sessionType=sprint",
  );

  expect(buildAnalyticsRequest(params)).toEqual({
    season: 2025,
    fromRound: undefined,
    toRound: undefined,
    driverIds: ["driver:one"],
    constructorIds: ["constructor:one"],
    circuitIds: [],
    sessionType: "sprint",
    snapshotId: undefined,
  });
});

test("changing season clears entity filters from the previous season", () => {
  const params = new URLSearchParams(
    "season=2026&driverIds=driver:one&constructorIds=constructor:one&circuitIds=circuit:one&fromRound=2&toRound=10&sessionType=race",
  );

  const next = updateAnalyticsFilterParams(params, "season", "2024");

  expect(next.toString()).toBe("season=2024&sessionType=race");
});

test("progression labels stay compact while the tooltip can retain full names", () => {
  expect(compactDriverName("Max Verstappen")).toBe("M. Verstappen");
  expect(compactDriverName("Senna")).toBe("Senna");
  expect(lastKnownSeriesValue([12, 18, null, null])).toBe(18);
});

test("analytics chart labels use compact circuit names and ranked constructors", () => {
  expect(compactCircuitName("Bahrain International Circuit")).toBe("Bahrain");
  expect(compactCircuitName("Circuit of the Americas")).toBe(
    "Circuit of the Americas",
  );
  expect(
    sortConstructorContributionRows([
      { constructorName: "Ferrari", totalPoints: 120 },
      { constructorName: "Mercedes", totalPoints: 240 },
    ]).map((row) => row.constructorName),
  ).toEqual(["Mercedes", "Ferrari"]);
});

test("recent results preserve race order and readable gaps", () => {
  const results = buildRecentResultsModel({
    name: "Synthetic Grand Prix",
    results: [
      {
        position: 1,
        driverName: "Example One",
        constructorName: "Example Team",
        points: 25,
        gap: { kind: "leader" },
      },
      {
        position: 2,
        driverName: "Example Two",
        constructorName: "Example Team",
        points: 18,
        gap: { kind: "time", milliseconds: 12345 },
      },
    ],
  });

  expect(results.map((result) => result.position)).toEqual([1, 2]);
  expect(formatResultGap(results[0].gap)).toBe("Winner");
  expect(formatResultGap(results[1].gap)).toBe("+12.345s");
});

test("recent results can render a published podium-only payload", () => {
  const results = buildRecentResultsModel({
    podium: [
      { position: 1, driverName: "Example One" },
      { position: 2, driverName: "Example Two" },
    ],
  });

  expect(results.map((result) => result.driverName)).toEqual([
    "Example One",
    "Example Two",
  ]);
});

test("session readout stays grounded in the published race evidence", () => {
  const model = buildAnalyticsSessionReadoutModel({
    race: {
      name: "Synthetic Grand Prix",
      round: 8,
      circuit: { displayName: "Example Circuit" },
      results: [
        { position: 1, driverName: "Example One", constructorName: "Example Team" },
        { position: 2, driverName: "Example Two" },
      ],
      fastestLap: { driverName: "Example Two", lapNumber: 41 },
    },
    insights: ["The latest event is published.", "Example Team leads the selection."],
  });

  expect(model.race.title).toBe("Synthetic Grand Prix");
  expect(model.race.winner).toBe("Example One");
  expect(model.race.resultCount).toBe(2);
  expect(model.race.fastestLap).toBe("Example Two · Lap 41");
  expect(model.insights).toHaveLength(2);
});

test("analytics overview model exposes rates and snapshot freshness", () => {
  const model = buildAnalyticsOverviewModel({
    quickStats: {
      completedEvents: 14,
      totalEvents: 23,
      podiumRate: 28.6,
      dnfRate: 4.8,
    },
    seasonIntelligence: {
      progress: { percentage: 61 },
      championshipLeader: { driverName: "Example One", points: 169 },
      constructorLeader: { constructorName: "Example Team", points: 276 },
    },
    meta: {
      freshness: "fresh",
      lastSuccessfulRetrieval: "2026-09-21T15:00:00Z",
    },
  });

  expect(model.podiumRate.value).toBe("28.6%");
  expect(model.dnfRate.value).toBe("4.8%");
  expect(model.leader.value).toBe("Example One");
  expect(model.constructorLeader.value).toBe("Example Team");
  expect(formatAnalyticsFreshness(null)).toBe("Not available");
  expect(formatAnalyticsFreshness("2026-09-21T15:00:00Z")).toBe("21 Sept 2026");
});

test("race breakdown turns published totals into comparable ring metrics", () => {
  const model = buildRaceBreakdownModel({
    starts: 180,
    classified: 171,
    dnfs: 9,
    wins: 18,
    podiums: 54,
    fastestLaps: 18,
  });

  expect(model.map((metric) => metric.label)).toEqual([
    "Race wins",
    "Podiums",
    "Fastest laps",
    "Finishing status",
  ]);
  expect(model[0].value).toBe(18);
  expect(model[0].percentage).toBe(10);
  expect(model[3].detail).toBe("171 classified · 9 DNF");
});

test("driver spotlight exposes the published recent form sequence", () => {
  const model = buildDriverSpotlightModel({
    driverName: "Example One",
    constructor: { displayName: "Example Team" },
    recentForm: [null, 4, 2, 1, 3, 2],
    positionsGained: 5,
  });

  expect(model.form).toEqual([4, 2, 1, 3, 2]);
  expect(model.positionsGained).toBe(5);
});

test("weekend timeline centres the display on the next published event", () => {
  const model = buildAnalyticsWeekendTimelineModel([
    { id: "r1", round: 1, name: "One", completed: true },
    { id: "r2", round: 2, name: "Two", completed: true },
    { id: "r3", round: 3, name: "Three", completed: true },
    { id: "r4", round: 4, name: "Four", completed: false },
    { id: "r5", round: 5, name: "Five", completed: false },
    { id: "r6", round: 6, name: "Six", completed: false },
  ]);

  expect(model.map((event) => event.round)).toEqual([2, 3, 4, 5, 6]);
  expect(model.find((event) => event.id === "r4").statusLabel).toBe("Next up");
  expect(model.find((event) => event.id === "r5").statusLabel).toBe("Upcoming");
});

test("circuit insight derives coverage and best finish from published cells", () => {
  const model = buildAnalyticsCircuitInsightModel({
    circuit: { id: "circuit:example", displayName: "Example Circuit", country: "Exampleland" },
    profile: { country: "Exampleland" },
    performance: {
      drivers: [
        { id: "driver:one", name: "Example One" },
        { id: "driver:two", name: "Example Two" },
      ],
      cells: [
        { circuitId: "circuit:example", driverId: "driver:one", value: 1 },
        { circuitId: "circuit:example", driverId: "driver:two", value: 4 },
      ],
    },
  });

  expect(model.name).toBe("Example Circuit");
  expect(model.country).toBe("Exampleland");
  expect(model.publishedFinishes).toBe(2);
  expect(model.driverCount).toBe(2);
  expect(model.bestFinish).toEqual({ position: 1, driverName: "Example One" });
});

test("form insights derive rates and constructor gap from published metrics", () => {
  const model = buildAnalyticsFormInsightsModel({
    leader: {
      driverId: "driver:one",
      driverName: "Example One",
      recentForm: [3, 1, 2],
    },
    comparison: {
      drivers: [
        {
          id: "driver:one",
          metrics: { races: 10, podiums: 6, dnfRate: 0.1 },
        },
      ],
    },
    constructors: [
      { constructorName: "Example Team", totalPoints: 300 },
      { constructorName: "Second Team", totalPoints: 240 },
    ],
  });

  expect(model.form).toEqual([3, 1, 2]);
  expect(model.podiumRate.value).toBe("60%");
  expect(model.dnfRate.value).toBe("10%");
  expect(model.constructorGap.value).toBe("+60 pts");
});

test("quick stats expose complementary archive-backed measures", () => {
  const model = buildAnalyticsQuickStatsModel({
    raceWinnerCount: 5,
    podiumDriverCount: 8,
    publishedStarts: 301,
    fastestLapCount: 14,
  });

  expect(model.map(([, label]) => label)).toEqual([
    "Race winners",
    "Drivers on podium",
    "Published starts",
    "Fastest laps",
  ]);
  expect(model.map(([, , value]) => value)).toEqual([5, 8, 301, 14]);
});

test("driver comparison ranking follows the selected metric direction", () => {
  const rows = [
    { name: "Driver One", points: 80, averageFinish: 4.2 },
    { name: "Driver Two", points: 120, averageFinish: 6.1 },
    { name: "Driver Three", points: 40, averageFinish: 2.8 },
  ];

  expect(rankComparisonRows(rows, "points").map((row) => row.name)).toEqual([
    "Driver Two",
    "Driver One",
    "Driver Three",
  ]);
  expect(
    rankComparisonRows(rows, "averageFinish").map((row) => row.name),
  ).toEqual(["Driver Three", "Driver One", "Driver Two"]);
});

test("championship snapshot ranks published drivers and constructors independently", () => {
  const model = buildChampionshipSnapshotModel({
    comparison: {
      drivers: [
        {
          id: "driver:two",
          name: "Driver Two",
          metrics: { points: 180, wins: 3, podiums: 7 },
        },
        {
          id: "driver:one",
          name: "Driver One",
          metrics: { points: 220, wins: 5, podiums: 9 },
        },
      ],
    },
    constructors: [
      {
        constructorId: "constructor:one",
        constructorName: "Team One",
        totalPoints: 310,
        drivers: [],
      },
      {
        constructorId: "constructor:two",
        constructorName: "Team Two",
        totalPoints: 340,
        drivers: [{ id: "driver:two" }],
      },
    ],
    driverSeries: [{ driverId: "driver:one", number: 7 }],
  });

  expect(model.drivers.map((row) => row.name)).toEqual([
    "Driver One",
    "Driver Two",
  ]);
  expect(model.drivers[0].number).toBe(7);
  expect(model.teams.map((row) => row.name)).toEqual(["Team Two", "Team One"]);
});

test("season intelligence keeps the published overview relationships intact", () => {
  const model = buildSeasonIntelligenceModel({
    progress: { completedEvents: 14, totalEvents: 23, percentage: 61 },
    championshipLeader: { driverName: "Andrea Kimi Antonelli", points: 266 },
    constructorLeader: { constructorName: "Mercedes", points: 454 },
    latestRace: {
      name: "Spanish Grand Prix",
      podium: [
        { position: 2, driverName: "Max Verstappen" },
        { position: 1, driverName: "Andrea Kimi Antonelli" },
      ],
    },
    nextRace: { name: "Azerbaijan Grand Prix" },
  });

  expect(model.progressLabel).toBe("14 / 23");
  expect(model.progressPercentage).toBe("61%");
  expect(model.latestWinner.driverName).toBe("Andrea Kimi Antonelli");
  expect(model.podium.map((entry) => entry.position)).toEqual([1, 2]);
  expect(formatAnalyticsDate("2026-09-26T11:00:00Z")).toBe("Sat, 26 Sept 2026");
});
