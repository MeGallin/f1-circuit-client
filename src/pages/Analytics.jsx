import { APEX_ICONS } from "../design-system/apex.tokens";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CalendarBlankIcon,
  ChartLineUpIcon,
  DatabaseIcon,
  FlagCheckeredIcon,
  GaugeIcon,
  MapTrifoldIcon,
  MedalIcon,
  RankingIcon,
  SlidersHorizontalIcon,
  TrophyIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import {
  useGetAnalyticsDashboardQuery,
  useGetDriverComparisonQuery,
  useGetLayoutsQuery,
  useGetProfileQuery,
} from "../api/archiveApi";
import {
  ActionLink,
  Button,
  DataBoundary,
  DataTable,
  EmptyState,
  PageHeading,
  Panel,
  Select,
  SourceNote,
} from "../components/ui";
import {
  CircuitPerformanceChart,
  ConstructorContributionChart,
  DriverComparisonChart,
  PointsProgressionChart,
  QualifyingVsFinishChart,
} from "../features/analytics/components/AnalyticsCharts";
import AnalyticsIntelligence from "../features/analytics/components/AnalyticsIntelligence";
import AnalyticsPerformanceSnapshot from "../features/analytics/components/AnalyticsPerformanceSnapshot";
import AnalyticsChampionshipSnapshot from "../features/analytics/components/AnalyticsChampionshipSnapshot";
import AnalyticsScopeSummary from "../features/analytics/components/AnalyticsScopeSummary";
import AnalyticsRecentResults from "../features/analytics/components/AnalyticsRecentResults";
import AnalyticsSessionReadout from "../features/analytics/components/AnalyticsSessionReadout";
import AnalyticsWeekendTimeline from "../features/analytics/components/AnalyticsWeekendTimeline";
import AnalyticsCircuitInsight from "../features/analytics/components/AnalyticsCircuitInsight";
import AnalyticsFormInsights from "../features/analytics/components/AnalyticsFormInsights";
import { selectLayout } from "../components/visuals";
import { runtimeYear } from "../features/season/selectors";
import { analyticsCount } from "../features/analytics/labels";
import "../styles/analytics.css";

const values = (params, key) =>
  (params.get(key) || "").split(",").filter(Boolean);

export function buildAnalyticsRequest(params) {
  return {
    season: Number(params.get("season") || runtimeYear()),
    fromRound: params.get("fromRound") || undefined,
    toRound: params.get("toRound") || undefined,
    driverIds: values(params, "driverIds"),
    constructorIds: values(params, "constructorIds"),
    circuitIds: values(params, "circuitIds"),
    sessionType: params.get("sessionType") || "race",
    snapshotId: params.get("snapshotId") || undefined,
  };
}

export function buildDriverComparisonRequest(params) {
  const request = buildAnalyticsRequest(params);
  return {
    season: request.season,
    fromRound: request.fromRound,
    toRound: request.toRound,
    drivers: request.driverIds,
    constructorIds: request.constructorIds,
    circuitIds: request.circuitIds,
    sessionType: request.sessionType,
    snapshotId: request.snapshotId,
  };
}

export function buildAnalyticsPanelLinks({
  season,
  latestRaceId,
  latestCircuitId,
  leaderId,
  snapshotId,
  standingRound,
} = {}) {
  const standingsParams = new URLSearchParams({ season: String(season) });
  if (snapshotId) standingsParams.set("snapshot", snapshotId);
  if (standingRound) standingsParams.set("round", String(standingRound));
  return {
    calendar: `/calendar?season=${season}`,
    standings: `/standings?${standingsParams}`,
    latestRace: latestRaceId
      ? `/events/${encodeURIComponent(latestRaceId)}?season=${season}`
      : `/calendar?season=${season}`,
    latestCircuit: latestCircuitId
      ? `/circuits/${encodeURIComponent(latestCircuitId)}?season=${season}`
      : `/calendar?season=${season}`,
    leader: leaderId
      ? `/drivers/${encodeURIComponent(leaderId)}?season=${season}`
      : `/standings?season=${season}`,
  };
}

export function updateAnalyticsFilterParams(params, key, value) {
  const next = new URLSearchParams(params);
  if (key === "season") {
    [
      "driverIds",
      "constructorIds",
      "circuitIds",
      "fromRound",
      "toRound",
    ].forEach((dependentKey) => next.delete(dependentKey));
  }
  if (key === "sessionType") {
    ["driverIds", "constructorIds", "circuitIds"].forEach((dependentKey) =>
      next.delete(dependentKey),
    );
  }
  if (value) next.set(key, value);
  else next.delete(key);
  return next;
}

export function resetAnalyticsFilterParams(params) {
  const next = new URLSearchParams(params);
  [
    "driverIds",
    "constructorIds",
    "circuitIds",
    "fromRound",
    "toRound",
    "sessionType",
  ].forEach((key) => next.delete(key));
  return next;
}

export function buildAnalyticsQuickStatsModel(stats = {}) {
  return [
    [
      TrophyIcon,
      "Session P1 drivers",
      stats.raceWinnerCount ?? "Not available",
    ],
    [
      MedalIcon,
      "Top-three drivers",
      stats.podiumDriverCount ?? "Not available",
    ],
    [
      FlagCheckeredIcon,
      "Published starts",
      stats.publishedStarts ?? "Not available",
    ],
    [ChartLineUpIcon, "Fastest laps", stats.fastestLapCount ?? "Not available"],
  ];
}

export function buildAnalyticsStats({
  stats = {},
  comparison = {},
  raceBreakdown = {},
} = {}) {
  const drivers = comparison?.drivers || [];
  const publishedStarts = stats.publishedStarts ?? raceBreakdown.starts;
  const fastestLapCount = stats.fastestLapCount ?? raceBreakdown.fastestLaps;
  const podiums = raceBreakdown.podiums;
  const retirementEligibleStarts = raceBreakdown.retirementEligibleStarts;
  return {
    ...stats,
    raceWinnerCount: Object.hasOwn(stats, "raceWinnerCount")
      ? stats.raceWinnerCount
      : drivers.length
        ? drivers.filter((driver) => Number(driver.metrics?.wins) > 0).length
        : undefined,
    podiumDriverCount: Object.hasOwn(stats, "podiumDriverCount")
      ? stats.podiumDriverCount
      : drivers.length
        ? drivers.filter((driver) => Number(driver.metrics?.podiums) > 0).length
        : undefined,
    publishedStarts: Object.hasOwn(stats, "publishedStarts")
      ? stats.publishedStarts
      : publishedStarts,
    fastestLapCount: Object.hasOwn(stats, "fastestLapCount")
      ? stats.fastestLapCount
      : fastestLapCount,
    podiumRate: Object.hasOwn(stats, "podiumRate")
      ? stats.podiumRate
      : publishedStarts
        ? Math.round((Number(podiums || 0) / publishedStarts) * 1000) / 10
        : undefined,
    retirementRate: Object.hasOwn(stats, "retirementRate")
      ? stats.retirementRate
      : retirementEligibleStarts
        ? Math.round(
            (Number(raceBreakdown.retirements || 0) /
              retirementEligibleStarts) *
              1000,
          ) / 10
        : null,
  };
}

function StatStrip({ stats }) {
  const items = buildAnalyticsQuickStatsModel(stats);
  return (
    <div className="analytics-stat-grid">
      {items.map(([Icon, label, value]) => (
        <div className="analytics-stat" key={label}>
          <div className="analytics-stat-heading">
            <Icon size={APEX_ICONS.action} aria-hidden />
            <span>{label}</span>
          </div>
          <strong>{value ?? "—"}</strong>
        </div>
      ))}
    </div>
  );
}

function FilterBar({ dashboard, params, setParams, pending = false }) {
  const filters = dashboard?.filters || {};
  const options = dashboard?.filterOptions || {};
  const selectionOptions = (key, entities, allLabel) => {
    const selected = params.get(key) || "";
    return [
      { value: "", label: allLabel },
      ...(entities || []).map((item) => ({ value: item.id, label: item.name })),
      ...(selected && !(entities || []).some((item) => item.id === selected)
        ? [{ value: selected, label: `No published entries: ${selected}` }]
        : []),
    ];
  };
  const update = (key, value) => {
    setParams(updateAnalyticsFilterParams(params, key, value));
  };
  return (
    <div className="analytics-filters">
      <Select
        label="Season"
        value={params.get("season") || String(filters.season || "")}
        options={(options.seasons || []).map((item) => ({
          value: String(item.year),
          label: item.name,
        }))}
        onChange={(event) => update("season", event.target.value)}
      />
      <Select
        label="Session"
        value={params.get("sessionType") || filters.sessionType || "race"}
        options={(options.sessionTypes || ["race"]).map((item) => ({
          value: item,
          label: item[0].toUpperCase() + item.slice(1),
        }))}
        onChange={(event) => update("sessionType", event.target.value)}
      />
      <Select
        label="Driver"
        disabled={pending}
        value={params.get("driverIds") || filters.driverIds?.[0] || ""}
        options={selectionOptions("driverIds", options.drivers, "All drivers")}
        onChange={(event) => update("driverIds", event.target.value)}
      />
      <Select
        label="Constructor"
        disabled={pending}
        value={
          params.get("constructorIds") || filters.constructorIds?.[0] || ""
        }
        options={selectionOptions(
          "constructorIds",
          options.constructors,
          "All constructors",
        )}
        onChange={(event) => update("constructorIds", event.target.value)}
      />
      <Select
        label="Circuit"
        disabled={pending}
        value={params.get("circuitIds") || filters.circuitIds?.[0] || ""}
        options={selectionOptions(
          "circuitIds",
          options.circuits,
          "All circuits",
        )}
        onChange={(event) => update("circuitIds", event.target.value)}
      />
    </div>
  );
}

function Comparison({ data }) {
  const [metric, setMetric] = useState("points");
  const [showAll, setShowAll] = useState(false);
  const countLabel =
    data?.filters?.sessionType === "qualifying"
      ? "Qualifying entries"
      : "Starts";
  const rows = (data?.drivers || []).map((driver) => ({
    id: driver.id,
    name: driver.name,
    ...driver.metrics,
  }));
  if (!rows.length)
    return (
      <EmptyState
        title="No driver comparison available"
        description="Choose a published season and filter to a driver with race results."
      />
    );
  return (
    <>
      <div className="analytics-comparison-toolbar">
        <Select
          label="Rank by"
          value={metric}
          options={[
            { value: "points", label: "Points" },
            { value: "wins", label: "Wins" },
            { value: "podiums", label: "Podiums" },
            { value: "races", label: countLabel },
            { value: "averageFinish", label: "Average finish" },
          ]}
          onChange={(event) => setMetric(event.target.value)}
        />
        <div className="analytics-comparison-actions">
          <Button variant="quiet" onClick={() => setShowAll((value) => !value)}>
            {showAll ? "Show top 8 drivers" : "Show all drivers"}
          </Button>
          <p className="analytics-comparison-note">
            {showAll
              ? `Showing all ${analyticsCount(rows.length, "driver")}`
              : `Showing ${analyticsCount(Math.min(8, rows.length), "driver")}`}
          </p>
        </div>
      </div>
      <DriverComparisonChart rows={rows} metric={metric} showAll={showAll} />
      <details className="analytics-comparison-details">
        <summary>View exact figures</summary>
        <DataTable
          caption="Exact driver comparison figures"
          rows={rows}
          rowKey={(row) => row.id}
          columns={[
            { key: "name", label: "Driver" },
            { key: "races", label: countLabel, numeric: true },
            { key: "wins", label: "Wins", numeric: true },
            { key: "podiums", label: "Podiums", numeric: true },
            { key: "points", label: "Points", numeric: true },
            {
              key: "averageFinish",
              label: "Avg finish",
              numeric: true,
              render: (row) =>
                row.averageFinish == null ? "—" : row.averageFinish.toFixed(1),
            },
          ]}
        />
      </details>
    </>
  );
}

export default function Analytics() {
  const [contextOpen, setContextOpen] = useState(false);
  const [params, setParams] = useSearchParams();
  const request = buildAnalyticsRequest(params);
  const { season, driverIds } = request;
  const dashboardQuery = useGetAnalyticsDashboardQuery(request);
  const dashboard = dashboardQuery.currentData?.analyticsDashboard;
  const filterDashboard = dashboard || {
    filters: { season, sessionType: request.sessionType },
    filterOptions: {
      seasons: dashboardQuery.data?.analyticsDashboard?.filterOptions?.seasons,
      sessionTypes: ["race", "qualifying", "sprint"],
    },
  };
  const comparisonQuery = useGetDriverComparisonQuery(
    {
      ...buildDriverComparisonRequest(params),
      snapshotId:
        dashboardQuery.currentData?.meta?.snapshotId || request.snapshotId,
    },
    { skip: !dashboard || driverIds.length < 2 },
  );
  const comparison =
    comparisonQuery.currentData?.driverComparison ||
    dashboard?.defaultComparison;
  const responseMeta =
    dashboardQuery.currentData?.meta || dashboardQuery.data?.meta;
  const latestCircuit = dashboard?.seasonIntelligence?.latestRace?.circuit;
  const latestCircuitId = latestCircuit?.id;
  const latestCircuitProfileQuery = useGetProfileQuery(
    {
      kind: "circuit",
      id: latestCircuitId,
      snapshotId: responseMeta?.snapshotId,
    },
    { skip: !latestCircuitId },
  );
  const latestCircuitLayoutsQuery = useGetLayoutsQuery(
    { id: latestCircuitId, snapshotId: responseMeta?.snapshotId },
    { skip: !latestCircuitId },
  );
  const latestCircuitProfile = latestCircuitProfileQuery.currentData?.profile;
  const latestCircuitLayout = selectLayout(
    latestCircuitLayoutsQuery.currentData?.items,
    season,
  );
  const panelLinks = buildAnalyticsPanelLinks({
    season,
    latestRaceId: dashboard?.seasonIntelligence?.latestRace?.id,
    latestCircuitId,
    leaderId: dashboard?.seasonIntelligence?.championshipLeader?.driverId,
    snapshotId: dashboard?.championship?.snapshotId,
    standingRound: dashboard?.championship?.round,
  });
  const raceBreakdown = dashboard?.seasonIntelligence?.raceBreakdown || {};
  const selectedLeader = [...(comparison?.drivers || [])].sort(
    (a, b) => (b.metrics.points ?? 0) - (a.metrics.points ?? 0),
  )[0];
  const analysisDescription = `${season} · ${request.sessionType} · rounds ${request.fromRound || "first"}–${request.toRound || "latest"} · driver ${request.driverIds.join(", ") || "all"} · constructor ${request.constructorIds.join(", ") || "all"} · circuit ${request.circuitIds.join(", ") || "all"}`;
  const analyticsStats = buildAnalyticsStats({
    stats: dashboard?.quickStats,
    comparison,
    raceBreakdown,
  });
  const weekendTimeline = dashboard?.weekendTimeline?.length
    ? dashboard.weekendTimeline
    : [
        dashboard?.seasonIntelligence?.latestRace && {
          ...dashboard.seasonIntelligence.latestRace,
          completed: true,
        },
        dashboard?.seasonIntelligence?.nextRace && {
          ...dashboard.seasonIntelligence.nextRace,
          completed: false,
        },
      ].filter(Boolean);
  return (
    <div className="entity-stack analytics-page">
      <PageHeading
        eyebrow="PERFORMANCE ANALYTICS"
        title="Performance Analytics"
        description="Read the published archive as a season-wide performance story: points progression, qualifying pace, team contribution, and circuit patterns."
        icon={ChartLineUpIcon}
        actions={
          <ActionLink variant="quiet" to={`/explore?season=${season}`}>
            Explore the archive
          </ActionLink>
        }
      />
      <Panel
        title="Shape the view"
        eyebrow="ARCHIVE FILTERS"
        icon={SlidersHorizontalIcon}
      >
        <FilterBar
          dashboard={filterDashboard}
          params={params}
          setParams={setParams}
          pending={!dashboard}
        />
        <p className="analytics-filter-note">
          {!dashboard &&
            "Entity options are unavailable until the selected season and session finish loading. "}
          Every chart is calculated from the selected publication snapshot.
          Empty values mean the archive does not publish that record, not that
          it is zero.
        </p>
      </Panel>
      <DataBoundary
        query={dashboardQuery}
        onRetry={dashboardQuery.refetch}
        loadingLabel="Reading published performance data"
      >
        {dashboard && (
          <>
            <div className="analytics-content">
              <AnalyticsScopeSummary
                year={season}
                championship={dashboard.championship}
                snapshotId={responseMeta?.snapshotId}
                scope={dashboard.analysisScope}
                stats={analyticsStats}
                sessionType={request.sessionType}
                description={analysisDescription}
                onReset={() => setParams(resetAnalyticsFilterParams(params))}
              >
                <p className="muted">
                  Retirement rate counts explicit retired statuses, including
                  classified retirements, divided by known finished/retired
                  starts. DNS and withdrawn entries are non-starts.
                  Disqualified, not-classified and unknown statuses are excluded
                  from that rate; laps greater than zero can establish a start
                  without establishing a finishing outcome. Qualifying has no
                  retirement rate. A zero eligible denominator is unavailable.
                  Classification uses the explicit published boolean; a position
                  alone does not prove classification. These measures describe
                  published entries, not an official season DNF statistic.
                </p>
                <p className="muted">
                  Selected entries: {raceBreakdown.retirements ?? "unknown"}{" "}
                  retired; {raceBreakdown.retirementEligibleStarts ?? "unknown"}{" "}
                  known finished/retired starts;{" "}
                  {raceBreakdown.nonStarts ?? "unknown"} non-starts;{" "}
                  {raceBreakdown.disqualified ?? "unknown"} disqualified;{" "}
                  {raceBreakdown.unknownStatus ?? "unknown"} unknown status;{" "}
                  {raceBreakdown.otherStatus ?? "unknown"} other status;{" "}
                  {raceBreakdown.classificationUnknown ?? "unknown"}{" "}
                  classification unknown. Missing or partial coverage cannot
                  establish absence across the full season.
                </p>
              </AnalyticsScopeSummary>
              <div className="analytics-chart-grid">
                <Panel
                  className="analytics-primary-chart"
                  title="Selected-result points progression"
                  eyebrow="FILTERED RESULTS"
                  icon={ChartLineUpIcon}
                >
                  <p className="muted analytics-panel-scope-note">
                    {request.sessionType} results only; not championship
                    standings. Missing session/points records remain
                    unavailable.
                  </p>
                  <PointsProgressionChart data={dashboard.pointsProgression} />
                </Panel>
                <Panel
                  title="Qualifying versus finish"
                  eyebrow="FILTERED SESSION POSITIONS"
                  icon={GaugeIcon}
                >
                  <p className="muted analytics-panel-scope-note">
                    Selected result scope
                  </p>
                  {dashboard.qualifyingVsFinish.length ? (
                    <QualifyingVsFinishChart
                      rows={dashboard.qualifyingVsFinish}
                    />
                  ) : (
                    <EmptyState
                      title="No paired qualifying data"
                      description="The selected publication does not contain both qualifying and race positions for this slice."
                    />
                  )}
                </Panel>
                <Panel
                  title="Selected-result constructor contribution"
                  eyebrow="TEAM PERFORMANCE"
                  icon={UsersThreeIcon}
                >
                  <p className="muted analytics-panel-scope-note">
                    Points from selected {request.sessionType} results only; not
                    constructor championship standings.
                  </p>
                  {dashboard.constructorContribution.length ? (
                    <ConstructorContributionChart
                      rows={dashboard.constructorContribution}
                    />
                  ) : (
                    <EmptyState
                      title="No constructor points"
                      description="No published constructor contribution is available for this filter."
                    />
                  )}
                </Panel>
                <Panel
                  title="Circuit performance"
                  eyebrow="TRACK PATTERNS"
                  icon={FlagCheckeredIcon}
                >
                  <p className="muted analytics-panel-scope-note">
                    Selected result scope
                  </p>
                  {dashboard.circuitPerformance.cells.length ? (
                    <CircuitPerformanceChart
                      data={dashboard.circuitPerformance}
                    />
                  ) : (
                    <EmptyState
                      title="No circuit pattern"
                      description="No published driver finishes are available for this circuit selection."
                    />
                  )}
                </Panel>
              </div>
              <Panel
                title="Driver comparison"
                eyebrow="COMPARATIVE VIEW"
                icon={RankingIcon}
              >
                <p className="muted analytics-panel-scope-note">
                  Selected result totals and outcomes; not championship
                  standings.
                </p>
                <Comparison data={comparison} />
              </Panel>
              <div className="analytics-dashboard-grid analytics-dashboard-grid--three">
                <Panel
                  title="Circuit insight"
                  eyebrow="TRACK CONTEXT"
                  icon={MapTrifoldIcon}
                  action={
                    <ActionLink variant="quiet" to={panelLinks.latestCircuit}>
                      View circuit
                    </ActionLink>
                  }
                >
                  <p className="muted analytics-panel-scope-note">
                    Filtered circuit finishes; circuit identity is season
                    context.
                  </p>
                  <AnalyticsCircuitInsight
                    circuit={latestCircuit}
                    profile={latestCircuitProfile}
                    layout={latestCircuitLayout}
                    performance={dashboard.circuitPerformance}
                  />
                </Panel>
                <Panel
                  title="Form & insights"
                  eyebrow="PERFORMANCE READOUT"
                  icon={ChartLineUpIcon}
                >
                  <p className="muted analytics-panel-scope-note">
                    Selected result scope
                  </p>
                  <AnalyticsFormInsights
                    leader={
                      selectedLeader
                        ? {
                            driverId: selectedLeader.id,
                            driverName: selectedLeader.name,
                            recentForm: selectedLeader.metrics.recentForm,
                          }
                        : null
                    }
                    comparison={comparison}
                    constructors={dashboard.constructorContribution}
                  />
                </Panel>
                <Panel
                  title="Quick stats"
                  eyebrow="DATA SCOPE"
                  icon={DatabaseIcon}
                >
                  <p className="muted analytics-panel-scope-note">
                    Selected result scope; unavailable values mean no matching
                    published entries.
                  </p>
                  <StatStrip stats={analyticsStats} />
                </Panel>
              </div>
              <details
                className="analytics-context-disclosure"
                onToggle={(event) => setContextOpen(event.currentTarget.open)}
              >
                <summary>Season context and published championship</summary>
                {contextOpen && (
                  <div className="analytics-context-body">
                    <AnalyticsIntelligence
                      year={dashboard.filters?.season}
                      intelligence={dashboard.seasonIntelligence}
                    />
                    <Panel
                      title="Weekend timeline"
                      eyebrow="SEASON FLOW"
                      icon={CalendarBlankIcon}
                      action={
                        <ActionLink variant="quiet" to={panelLinks.calendar}>
                          View calendar
                        </ActionLink>
                      }
                    >
                      <AnalyticsWeekendTimeline events={weekendTimeline} />
                    </Panel>
                    <Panel
                      title="Performance snapshot"
                      eyebrow="RACE INTELLIGENCE"
                      icon={TrophyIcon}
                      action={
                        <ActionLink variant="quiet" to={panelLinks.leader}>
                          View driver
                        </ActionLink>
                      }
                    >
                      <AnalyticsPerformanceSnapshot
                        sessionType={request.sessionType}
                        year={dashboard.filters?.season}
                        intelligence={dashboard.seasonIntelligence}
                      />
                    </Panel>
                    <div className="analytics-dashboard-grid analytics-dashboard-grid--two">
                      <Panel
                        title="Championship snapshot"
                        eyebrow="CURRENT ORDER"
                        icon={TrophyIcon}
                        action={
                          <ActionLink variant="quiet" to={panelLinks.standings}>
                            View standings
                          </ActionLink>
                        }
                      >
                        <AnalyticsChampionshipSnapshot
                          year={dashboard.filters?.season}
                          championship={dashboard.championship}
                          snapshotId={responseMeta?.snapshotId}
                        />
                      </Panel>
                      <Panel
                        title="Latest race results"
                        eyebrow="RACE SUMMARY"
                        icon={FlagCheckeredIcon}
                        action={
                          <ActionLink
                            variant="quiet"
                            to={panelLinks.latestRace}
                          >
                            View race
                          </ActionLink>
                        }
                      >
                        <AnalyticsRecentResults
                          race={dashboard.seasonIntelligence?.latestRace}
                        />
                      </Panel>
                    </div>
                    <Panel
                      title="Race readout"
                      eyebrow="SESSION CONTEXT"
                      icon={ChartLineUpIcon}
                    >
                      <p className="muted analytics-panel-scope-note">
                        Season race context; unaffected by analysis filters.
                      </p>
                      <AnalyticsSessionReadout
                        race={dashboard.seasonIntelligence?.latestRace}
                        insights={dashboard.insights}
                        latestSessionHighlights={
                          dashboard.latestSessionHighlights
                        }
                      />
                    </Panel>
                  </div>
                )}
              </details>
            </div>
          </>
        )}
      </DataBoundary>
      <SourceNote meta={responseMeta} />
    </div>
  );
}
