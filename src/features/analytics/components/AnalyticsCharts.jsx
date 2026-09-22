import EChart from "./EChart";

const axis = {
  axisLine: { lineStyle: { color: "#48515c" } },
  axisLabel: { color: "#aab4bf" },
};
const grid = { left: 48, right: 24, top: 28, bottom: 56, containLabel: true };
const tooltip = {
  trigger: "axis",
  backgroundColor: "#171b20",
  borderColor: "#48515c",
  textStyle: { color: "#f3f5f7" },
};

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
    symbolSize: 7,
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
        grid: { ...grid, bottom: 76 },
        tooltip: {
          ...tooltip,
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
          itemWidth: 16,
          itemGap: 12,
          type: "scroll",
          textStyle: { color: "#aab4bf" },
        },
        xAxis: {
          type: "category",
          data: events.map((event) => `R${event.round}`),
          ...axis,
          axisLabel: {
            ...axis.axisLabel,
            interval: labelInterval,
            hideOverlap: true,
          },
        },
        yAxis: { type: "value", ...axis },
        series,
      }}
    />
  );
}

export function QualifyingVsFinishChart({ rows }) {
  return (
    <EChart
      label="Qualifying position compared with race finish"
      description={`${rows.length} qualifying and race-position comparisons are plotted. Points closer to the upper-left represent stronger starting and finishing positions.`}
      option={{
        animation: false,
        grid,
        tooltip: { ...tooltip, trigger: "item" },
        xAxis: {
          name: "Qualifying",
          type: "value",
          inverse: true,
          minInterval: 1,
          ...axis,
        },
        yAxis: {
          name: "Finish",
          type: "value",
          inverse: true,
          minInterval: 1,
          ...axis,
        },
        series: [
          {
            type: "scatter",
            symbolSize: 12,
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
  const sortedRows = sortConstructorContributionRows(rows);
  const height = Math.max(300, Math.min(520, sortedRows.length * 36 + 96));
  return (
    <EChart
      label="Constructor points contribution"
      height={height}
      description={`${sortedRows.length} constructors ranked by their published race-points contribution.`}
      option={{
        animation: false,
        grid: { ...grid, left: 8, right: 44, top: 20, bottom: 28 },
        tooltip: {
          ...tooltip,
          trigger: "item",
          formatter: (params) => `${params.name}<br />Points: ${params.value}`,
        },
        xAxis: {
          type: "value",
          min: 0,
          ...axis,
          axisLabel: {
            color: "#aab4bf",
            formatter: (value) => String(value),
          },
        },
        yAxis: {
          type: "category",
          inverse: true,
          data: sortedRows.map((row) => row.constructorName),
          ...axis,
          axisLabel: {
            color: "#aab4bf",
            width: 124,
            overflow: "truncate",
            margin: 6,
          },
        },
        series: [
          {
            type: "bar",
            barMaxWidth: 24,
            label: {
              show: true,
              position: "right",
              color: "#f3f5f7",
            },
            data: sortedRows.map((row) => ({
              name: row.constructorName,
              value: row.totalPoints,
            })),
            itemStyle: { color: "#f04f4f" },
          },
        ],
      }}
    />
  );
}

export function CircuitPerformanceChart({ data }) {
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
  const height = Math.max(320, Math.min(560, circuits.length * 18 + 96));
  return (
    <EChart
      label="Leading driver finish positions by circuit"
      height={height}
      description={`${circuits.length} circuits and ${visibleDrivers.length} drivers are shown as finish-position cells. Full names are available in the chart tooltip.`}
      option={{
        animation: false,
        grid: { ...grid, left: 4, right: 8, top: 40, bottom: 76 },
        tooltip: {
          ...tooltip,
          trigger: "item",
          formatter: (params) => {
            const [driverIndex, circuitIndex, value] = params.value;
            return `${circuits[circuitIndex]?.name || "Circuit"}<br />${visibleDrivers[driverIndex]?.name || "Driver"}: finish ${value}`;
          },
        },
        xAxis: {
          type: "category",
          data: visibleDrivers.map((driver) => compactDriverName(driver.name)),
          ...axis,
          axisLabel: {
            color: "#aab4bf",
            rotate: 25,
            width: 72,
            overflow: "truncate",
          },
        },
        yAxis: {
          type: "category",
          data: circuits.map((circuit) => compactCircuitName(circuit.name)),
          ...axis,
          axisLabel: {
            color: "#aab4bf",
            width: 108,
            overflow: "truncate",
            align: "right",
            margin: 4,
          },
        },
        visualMap: {
          min: 1,
          max: maxFinish,
          calculable: false,
          orient: "horizontal",
          left: "center",
          bottom: 4,
          text: ["Later finish", "Winner"],
          textStyle: { color: "#aab4bf" },
          inRange: { color: ["#f04f4f", "#ef9c4a", "#4b6372"] },
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
  const height = Math.max(320, Math.min(960, visibleRows.length * 36 + 96));
  return (
    <EChart
      label={`Driver comparison ranked by ${config.label.toLowerCase()}`}
      height={height}
      description={`${visibleRows.length} drivers ranked by ${config.label.toLowerCase()}. Exact figures are available in the expandable table below the chart.`}
      option={{
        animation: false,
        grid: { left: 8, right: 56, top: 20, bottom: 36, containLabel: true },
        tooltip: {
          ...tooltip,
          trigger: "item",
          formatter: (params) => {
            const row = visibleRows[params.dataIndex];
            return `${row.name}<br />${config.label}: ${formatValue(row.chartValue)}`;
          },
        },
        xAxis: {
          type: "value",
          min: 0,
          ...axis,
          axisLabel: {
            color: "#aab4bf",
            formatter: (value) => formatValue(value),
          },
        },
        yAxis: {
          type: "category",
          inverse: true,
          data: visibleRows.map(
            (row, index) => `${index + 1}. ${compactDriverName(row.name)}`,
          ),
          ...axis,
          axisLabel: { color: "#aab4bf", width: 124, overflow: "truncate" },
        },
        series: [
          {
            type: "bar",
            barMaxWidth: 22,
            data: visibleRows.map((row) => ({
              name: row.name,
              value: row.chartValue,
            })),
            label: {
              show: true,
              position: "right",
              color: "#f3f5f7",
              formatter: (params) => formatValue(params.value),
            },
            itemStyle: { color: "#f04f4f" },
          },
        ],
      }}
    />
  );
}
