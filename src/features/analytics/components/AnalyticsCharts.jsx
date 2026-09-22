import EChart from "./EChart";
import { APEX_CHART, APEX_SIZES } from "../../../design-system/apex.tokens";

function readColor(token, fallback) {
  if (typeof document === "undefined") return fallback;
  return (
    getComputedStyle(document.documentElement)
      .getPropertyValue(`--apex-color-${token}`)
      .trim() || fallback
  );
}

export function getChartTheme() {
  const colors = {
    line: readColor("line", "#333d47"),
    muted: readColor("muted", "#a6afb8"),
    text: readColor("text", "#f0f2f3"),
    surface: readColor("surface", "#15191e"),
    accent: readColor("accent", "#f0524d"),
    warning: readColor("warning", "#e7bd6d"),
    info: readColor("info", "#87b8de"),
  };
  return {
    colors,
    axis: {
      axisLine: { lineStyle: { color: colors.line } },
      axisLabel: { color: colors.muted },
    },
    grid: { ...APEX_CHART.grid, containLabel: true },
    tooltip: {
      trigger: "axis",
      backgroundColor: colors.surface,
      borderColor: colors.line,
      textStyle: { color: colors.text },
    },
  };
}

export function compactDriverName(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return parts[0] || "Unknown driver";
  return `${parts[0][0]}. ${parts.at(-1)}`;
}

export function lastKnownSeriesValue(points) {
  return [...(points || [])]
    .reverse()
    .find((value) => value !== null && value !== undefined && Number.isFinite(Number(value))) ??
    null;
}

export function compactCircuitName(name) {
  return String(name || "Unknown circuit")
    .replace(/\s+International Circuit$/i, "")
    .replace(/\s+Grand Prix Circuit$/i, "")
    .replace(/\s+Street Circuit$/i, "")
    .replace(/\s+Circuit$/i, "");
}

export function sortConstructorContributionRows(rows) {
  return [...(rows || [])].sort(
    (a, b) => Number(b.totalPoints || 0) - Number(a.totalPoints || 0),
  );
}

export function PointsProgressionChart({ data }) {
  const theme = getChartTheme();
  const events = data?.events || [];
  const allSeries = [...(data?.series || [])].sort(
    (a, b) =>
      (lastKnownSeriesValue(b.points) || 0) -
      (lastKnownSeriesValue(a.points) || 0),
  );
  const visibleCount = Math.min(5, allSeries.length);
  const visibleSeries = allSeries.slice(0, visibleCount);
  const series = visibleSeries.map((item) => ({
    name: compactDriverName(item.driverName),
    type: "line",
    smooth: false,
    symbol: "circle",
    symbolSize: APEX_CHART.lineSymbolSize,
    data: item.points,
  }));
  const fullNameByLabel = new Map(
    visibleSeries.map((item) => [
      compactDriverName(item.driverName),
      item.driverName,
    ]),
  );
  const labelInterval = events.length > 12 ? Math.ceil(events.length / 8) - 1 : 0;
  if (!events.length || !series.length) {
    return (
      <div className="state">
        <h3>No points progression available</h3>
        <p>The selected publication does not contain cumulative points for this slice.</p>
      </div>
    );
  }
  return (
    <EChart
      label="Points progression by event"
      description={`${visibleSeries.length} leading drivers shown across ${events.length} events by cumulative points. Full driver names are available in the chart tooltip.`}
      option={{
        animation: false,
        grid: { ...theme.grid, bottom: APEX_CHART.pointsLegendBottom },
        tooltip: {
          ...theme.tooltip,
          formatter: (params) => {
            const point = params[0];
            const event = events[point?.dataIndex];
            const heading = event
              ? `Round ${event.round} · ${event.name}`
              : "Points progression";
            const rows = params
              .filter((item) => item.value != null)
              .map(
                (item) =>
                  `${item.marker} ${fullNameByLabel.get(item.seriesName) || item.seriesName}: ${item.value} pts`,
              );
            return [heading, ...rows].join("<br />");
          },
        },
        legend: {
          bottom: 0,
          itemWidth: APEX_CHART.legendItemWidth,
          itemGap: APEX_CHART.legendItemGap,
          type: "scroll",
          textStyle: { color: theme.colors.muted },
        },
        xAxis: {
          type: "category",
          data: events.map((event) => `R${event.round}`),
          ...theme.axis,
          axisLabel: {
            ...theme.axis.axisLabel,
            interval: labelInterval,
            hideOverlap: true,
          },
        },
        yAxis: { type: "value", ...theme.axis },
        series,
      }}
    />
  );
}

export function QualifyingVsFinishChart({ rows }) {
  const theme = getChartTheme();
  return (
    <EChart
      label="Qualifying position compared with race finish"
      description={`${rows.length} qualifying and race-position comparisons are plotted. Points closer to the upper-left represent stronger starting and finishing positions.`}
      option={{
        animation: false,
        grid: theme.grid,
        tooltip: { ...theme.tooltip, trigger: "item" },
        xAxis: {
          name: "Qualifying",
          type: "value",
          inverse: true,
          minInterval: 1,
          ...theme.axis,
        },
        yAxis: {
          name: "Finish",
          type: "value",
          inverse: true,
          minInterval: 1,
          ...theme.axis,
        },
        series: [
          {
            type: "scatter",
            symbolSize: APEX_CHART.scatterSymbolSize,
            data: rows.map((row) => ({
              value: [row.qualifyingPosition, row.finishPosition],
              name: `${row.driverName} · ${row.eventName}`,
            })),
          },
        ],
      }}
    />
  );
}

export function ConstructorContributionChart({ rows }) {
  const theme = getChartTheme();
  const sortedRows = sortConstructorContributionRows(rows);
  const height = Math.max(
    APEX_SIZES.chartMinHeight,
    Math.min(
      APEX_SIZES.chartMaxHeight,
      sortedRows.length * APEX_SIZES.chartRowHeight +
        APEX_SIZES.chartVerticalPadding,
    ),
  );
  return (
    <EChart
      label="Constructor points contribution"
      height={height}
      description={`${sortedRows.length} constructors ranked by their published race-points contribution.`}
      option={{
        animation: false,
        grid: { ...APEX_CHART.constructorGrid, containLabel: true },
        tooltip: {
          ...theme.tooltip,
          trigger: "item",
          formatter: (params) => `${params.name}<br />Points: ${params.value}`,
        },
        xAxis: {
          type: "value",
          min: 0,
          ...theme.axis,
          axisLabel: {
            color: theme.colors.muted,
            formatter: (value) => String(value),
          },
        },
        yAxis: {
          type: "category",
          inverse: true,
          data: sortedRows.map((row) => row.constructorName),
          ...theme.axis,
          axisLabel: {
            color: theme.colors.muted,
            width: APEX_CHART.constructorLabelWidth,
            overflow: "truncate",
            margin: APEX_CHART.constructorLabelMargin,
          },
        },
        series: [
          {
            type: "bar",
            barMaxWidth: APEX_CHART.barMaxWidth,
            label: {
              show: true,
              position: "right",
              color: theme.colors.text,
            },
            data: sortedRows.map((row) => ({
              name: row.constructorName,
              value: row.totalPoints,
            })),
            itemStyle: { color: theme.colors.accent },
          },
        ],
      }}
    />
  );
}

export function CircuitPerformanceChart({ data }) {
  const theme = getChartTheme();
  const circuits = data?.circuits || [];
  const drivers = data?.drivers || [];
  const cells = data?.cells || [];
  const visibleDrivers = drivers.length > 5 ? drivers.slice(0, 5) : drivers;
  const visibleDriverIndex = new Map(
    visibleDrivers.map((driver, index) => [driver.id, index]),
  );
  const values = cells
    .filter((cell) => visibleDriverIndex.has(cell.driverId))
    .map((cell) => [
      visibleDriverIndex.get(cell.driverId),
      circuits.findIndex((circuit) => circuit.id === cell.circuitId),
      cell.value,
    ])
    .filter(([, circuitIndex, value]) => circuitIndex >= 0 && value != null);
  const maxFinish = Math.max(3, ...values.map(([, , value]) => Number(value)));
  const height = Math.max(
    APEX_SIZES.heatmapMinHeight,
    Math.min(
      APEX_SIZES.heatmapMaxHeight,
      circuits.length * APEX_SIZES.heatmapRowHeight +
        APEX_SIZES.chartVerticalPadding,
    ),
  );
  return (
    <EChart
      label="Leading driver finish positions by circuit"
      height={height}
      description={`${circuits.length} circuits and ${visibleDrivers.length} drivers are shown as finish-position cells. Full names are available in the chart tooltip.`}
      option={{
        animation: false,
        grid: { ...APEX_CHART.circuitGrid, containLabel: true },
        tooltip: {
          ...theme.tooltip,
          trigger: "item",
          formatter: (params) => {
            const [driverIndex, circuitIndex, value] = params.value;
            return `${circuits[circuitIndex]?.name || "Circuit"}<br />${visibleDrivers[driverIndex]?.name || "Driver"}: finish ${value}`;
          },
        },
        xAxis: {
          type: "category",
          data: visibleDrivers.map((driver) => compactDriverName(driver.name)),
          ...theme.axis,
          axisLabel: {
            color: theme.colors.muted,
            rotate: APEX_CHART.circuitLabelRotation,
            width: APEX_CHART.circuitDriverLabelWidth,
            overflow: "truncate",
          },
        },
        yAxis: {
          type: "category",
          data: circuits.map((circuit) => compactCircuitName(circuit.name)),
          ...theme.axis,
          axisLabel: {
            color: theme.colors.muted,
            width: APEX_CHART.circuitLabelWidth,
            overflow: "truncate",
            align: "right",
            margin: APEX_CHART.circuitLabelMargin,
          },
        },
        visualMap: {
          min: 1,
          max: maxFinish,
          calculable: false,
          orient: "horizontal",
          left: "center",
          bottom: APEX_CHART.heatmapLegendBottom,
          text: ["Later finish", "Winner"],
          textStyle: { color: theme.colors.muted },
          inRange: {
            color: [theme.colors.accent, theme.colors.warning, theme.colors.info],
          },
        },
        series: [{ type: "heatmap", data: values }],
      }}
    />
  );
}

export const comparisonMetricConfig = {
  points: { label: "Points", direction: "desc", decimals: 0 },
  wins: { label: "Wins", direction: "desc", decimals: 0 },
  podiums: { label: "Podiums", direction: "desc", decimals: 0 },
  races: { label: "Starts", direction: "desc", decimals: 0 },
  averageFinish: {
    label: "Average finish",
    direction: "asc",
    decimals: 1,
  },
};

const comparisonValue = (row, metric) => {
  const value = row[metric];
  return value === null || value === undefined ? null : Number(value);
};

export function rankComparisonRows(rows, metric = "points") {
  const config =
    comparisonMetricConfig[metric] || comparisonMetricConfig.points;
  return (rows || [])
    .map((row) => ({ ...row, chartValue: comparisonValue(row, metric) }))
    .filter((row) => Number.isFinite(row.chartValue))
    .sort((a, b) =>
      config.direction === "asc"
        ? a.chartValue - b.chartValue
        : b.chartValue - a.chartValue,
    );
}

export function DriverComparisonChart({
  rows,
  metric = "points",
  showAll = false,
}) {
  const theme = getChartTheme();
  const config =
    comparisonMetricConfig[metric] || comparisonMetricConfig.points;
  const rankedRows = rankComparisonRows(rows, metric);
  const visibleRows = showAll ? rankedRows : rankedRows.slice(0, 8);
  if (!visibleRows.length) {
    return (
      <div className="state">
        <h3>No {config.label.toLowerCase()} comparison available</h3>
        <p>The selected publication does not contain this metric.</p>
      </div>
    );
  }
  const formatValue = (value) =>
    config.decimals ? value.toFixed(config.decimals) : String(value);
  const height = Math.max(
    APEX_SIZES.comparisonMinHeight,
    Math.min(
      APEX_SIZES.comparisonMaxHeight,
      visibleRows.length * APEX_SIZES.chartRowHeight +
        APEX_SIZES.chartVerticalPadding,
    ),
  );
  return (
    <EChart
      label={`Driver comparison ranked by ${config.label.toLowerCase()}`}
      height={height}
      description={`${visibleRows.length} drivers ranked by ${config.label.toLowerCase()}. Exact figures are available in the expandable table below the chart.`}
      option={{
        animation: false,
        grid: { ...APEX_CHART.comparisonGrid, containLabel: true },
        tooltip: {
          ...theme.tooltip,
          trigger: "item",
          formatter: (params) => {
            const row = visibleRows[params.dataIndex];
            return `${row.name}<br />${config.label}: ${formatValue(row.chartValue)}`;
          },
        },
        xAxis: {
          type: "value",
          min: 0,
          ...theme.axis,
          axisLabel: {
            color: theme.colors.muted,
            formatter: (value) => formatValue(value),
          },
        },
        yAxis: {
          type: "category",
          inverse: true,
          data: visibleRows.map(
            (row, index) => `${index + 1}. ${compactDriverName(row.name)}`,
          ),
          ...theme.axis,
          axisLabel: {
            color: theme.colors.muted,
            width: APEX_CHART.constructorLabelWidth,
            overflow: "truncate",
          },
        },
        series: [
          {
            type: "bar",
            barMaxWidth: APEX_CHART.comparisonBarMaxWidth,
            data: visibleRows.map((row) => ({
              name: row.name,
              value: row.chartValue,
            })),
            label: {
              show: true,
              position: "right",
              color: theme.colors.text,
              formatter: (params) => formatValue(params.value),
            },
            itemStyle: { color: theme.colors.accent },
          },
        ],
      }}
    />
  );
}
