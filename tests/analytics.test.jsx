import { expect, test } from "vitest";
import {
  buildAnalyticsRequest,
  buildDriverComparisonRequest,
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
  expect(formatAnalyticsDate("2026-09-26T11:00:00Z")).toBe(
    "Sat, 26 Sept 2026",
  );
});
