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

export function PointsProgressionChart({ data }) {
  const events = data?.events || [];
  const allSeries = [...(data?.series || [])].sort(
    (a, b) => (b.points?.at(-1) || 0) - (a.points?.at(-1) || 0),
  );
  const visibleCount = Math.min(5, allSeries.length);
  const series = allSeries.slice(0, visibleCount).map((item) => ({
    name: item.driverName,
    type: "line",
    smooth: false,
    symbol: "circle",
    symbolSize: 7,
    data: item.points,
  }));
  return (
    <EChart
      label="Points progression by event"
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
                  `${item.marker} ${item.seriesName}: ${item.value} pts`,
              );
            return [heading, ...rows].join("<br />");
          },
        },
        legend: {
          bottom: 0,
          itemWidth: 16,
          itemGap: 12,
          textStyle: { color: "#aab4bf" },
        },
        xAxis: {
          type: "category",
          data: events.map((event) => `R${event.round}`),
          ...axis,
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
  const height = Math.max(360, Math.min(600, rows.length * 40 + 192));
  return (
    <EChart
      label="Constructor points contribution"
      height={height}
      option={{
        animation: false,
        grid: { ...grid, left: 44, right: 12, bottom: 104 },
        tooltip: {
          ...tooltip,
          trigger: "item",
          formatter: (params) => `${params.name}<br />Points: ${params.value}`,
        },
        xAxis: {
          type: "category",
          data: rows.map((row) => row.constructorName),
          ...axis,
          axisLabel: {
            color: "#aab4bf",
            interval: 0,
            rotate: 35,
            width: 84,
            overflow: "truncate",
          },
        },
        yAxis: {
          type: "value",
          min: 0,
          ...axis,
        },
        series: [
          {
            type: "bar",
            barMaxWidth: 32,
            label: {
              show: true,
              position: "top",
              color: "#f3f5f7",
            },
            data: rows.map((row) => ({
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
  const height = Math.max(360, Math.min(600, circuits.length * 20 + 112));
  return (
    <EChart
      label="Leading driver finish positions by circuit"
      height={height}
      option={{
        animation: false,
        grid: { ...grid, left: 24, right: 10, top: 44, bottom: 84 },
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
          data: visibleDrivers.map((driver) => driver.name),
          ...axis,
          axisLabel: {
            color: "#aab4bf",
            rotate: 25,
            width: 78,
            overflow: "truncate",
          },
        },
        yAxis: {
          type: "category",
          data: circuits.map((circuit) => circuit.name),
          ...axis,
          axisLabel: { color: "#aab4bf", width: 96, overflow: "truncate" },
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

const comparisonMetricConfig = {
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

export function DriverComparisonChart({
  rows,
  metric = "points",
  showAll = false,
}) {
  const config =
    comparisonMetricConfig[metric] || comparisonMetricConfig.points;
  const rankedRows = rows
    .map((row) => ({ ...row, chartValue: comparisonValue(row, metric) }))
    .filter((row) => Number.isFinite(row.chartValue))
    .sort((a, b) =>
      config.direction === "asc"
        ? a.chartValue - b.chartValue
        : b.chartValue - a.chartValue,
    );
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
  const height = Math.max(320, Math.min(640, visibleRows.length * 42 + 92));
  return (
    <EChart
      label={`Driver comparison ranked by ${config.label.toLowerCase()}`}
      height={height}
      option={{
        animation: false,
        grid: { left: 24, right: 56, top: 20, bottom: 36, containLabel: true },
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
          data: visibleRows.map((row) => row.name),
          ...axis,
          axisLabel: { color: "#aab4bf", width: 118, overflow: "truncate" },
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
