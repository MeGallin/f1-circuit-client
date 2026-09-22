import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  useGetAnalyticsDashboardQuery,
  useGetDriverComparisonQuery,
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
import { runtimeYear } from "../features/season/selectors";
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

export function updateAnalyticsFilterParams(params, key, value) {
  const next = new URLSearchParams(params);
  if (key === "season") {
    ["driverIds", "constructorIds", "circuitIds", "fromRound", "toRound"].forEach(
      (dependentKey) => next.delete(dependentKey),
    );
  }
  if (value) next.set(key, value);
  else next.delete(key);
  return next;
}

function StatStrip({ stats }) {
  const items = [
    ["Points scored", stats.totalPoints],
    ["Drivers", stats.driverCount],
    ["Constructors", stats.constructorCount],
    ["Circuits", stats.circuitCount],
  ];
  return (
    <div className="analytics-stat-grid">
      {items.map(([label, value]) => (
        <div className="analytics-stat" key={label}>
          <span>{label}</span>
          <strong>{value ?? "—"}</strong>
        </div>
      ))}
    </div>
  );
}

function FilterBar({ dashboard, params, setParams }) {
  const filters = dashboard?.filters || {};
  const options = dashboard?.filterOptions || {};
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
        value={params.get("driverIds") || filters.driverIds?.[0] || ""}
        options={[
          { value: "", label: "All drivers" },
          ...(options.drivers || []).map((item) => ({
            value: item.id,
            label: item.name,
          })),
        ]}
        onChange={(event) => update("driverIds", event.target.value)}
      />
      <Select
        label="Constructor"
        value={
          params.get("constructorIds") || filters.constructorIds?.[0] || ""
        }
        options={[
          { value: "", label: "All constructors" },
          ...(options.constructors || []).map((item) => ({
            value: item.id,
            label: item.name,
          })),
        ]}
        onChange={(event) => update("constructorIds", event.target.value)}
      />
      <Select
        label="Circuit"
        value={params.get("circuitIds") || filters.circuitIds?.[0] || ""}
        options={[
          { value: "", label: "All circuits" },
          ...(options.circuits || []).map((item) => ({
            value: item.id,
            label: item.name,
          })),
        ]}
        onChange={(event) => update("circuitIds", event.target.value)}
      />
    </div>
  );
}

function Comparison({ data }) {
  const [metric, setMetric] = useState("points");
  const [showAll, setShowAll] = useState(false);
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
            { value: "races", label: "Starts" },
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
              ? `Showing all ${rows.length} drivers`
              : `Showing the leading ${Math.min(8, rows.length)} drivers`}
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
            { key: "races", label: "Starts", numeric: true },
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
  const [params, setParams] = useSearchParams();
  const request = buildAnalyticsRequest(params);
  const { season, driverIds } = request;
  const dashboardQuery = useGetAnalyticsDashboardQuery(request);
  const dashboard = dashboardQuery.currentData?.analyticsDashboard;
  const filterDashboard =
    dashboardQuery.currentData?.analyticsDashboard ||
    dashboardQuery.data?.analyticsDashboard;
  const comparisonQuery = useGetDriverComparisonQuery(
    buildDriverComparisonRequest(params),
    { skip: !dashboard || driverIds.length < 2 },
  );
  const comparison =
    comparisonQuery.currentData?.driverComparison ||
    dashboard?.defaultComparison;
  return (
    <div className="entity-stack analytics-page">
      <PageHeading
        eyebrow="PERFORMANCE ANALYTICS"
        title="Performance Analytics"
        description="Read the published archive as a season-wide performance story: points progression, qualifying pace, team contribution, and circuit patterns."
        actions={
          <ActionLink variant="quiet" to={`/explore?season=${season}`}>
            Explore the archive
          </ActionLink>
        }
      />
      <Panel title="Shape the view" eyebrow="ARCHIVE FILTERS">
        <FilterBar
          dashboard={filterDashboard}
          params={params}
          setParams={setParams}
        />
        <p className="analytics-filter-note">
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
            <AnalyticsIntelligence intelligence={dashboard.seasonIntelligence} />
            <Panel title="Archive totals" eyebrow="DATA SCOPE">
              <StatStrip stats={dashboard.quickStats} />
            </Panel>
            <div className="analytics-chart-grid">
              <Panel title="Points progression" eyebrow="CHAMPIONSHIP">
                <PointsProgressionChart data={dashboard.pointsProgression} />
              </Panel>
              <Panel title="Qualifying versus finish" eyebrow="RACE PACE">
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
                title="Constructor contribution"
                eyebrow="TEAM PERFORMANCE"
              >
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
              <Panel title="Circuit performance" eyebrow="TRACK PATTERNS">
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
            <Panel title="Driver comparison" eyebrow="COMPARATIVE VIEW">
              <Comparison data={comparison} />
            </Panel>
            <Panel title="Archive highlights" eyebrow="READOUT">
              <ul className="analytics-insights">
                {dashboard.insights.map((insight) => (
                  <li key={insight}>{insight}</li>
                ))}
              </ul>
            </Panel>
          </>
        )}
      </DataBoundary>
      <SourceNote
        meta={dashboardQuery.currentData?.meta || dashboardQuery.data?.meta}
      />
    </div>
  );
}
