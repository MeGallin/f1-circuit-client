import { APEX_CHART } from "../../design-system/apex.tokens";
// Missing observations break the line; exact accessible figures belong outside
// scaled SVG text. All geometry is sourced from keyed Apex chart tokens.
export function CompactSeriesPlot({ series, rounds, describe }) {
  const { width, height, padding } = APEX_CHART.homeMiniPlot;
  const maximum = Math.max(
    1,
    ...series
      .flatMap((row) =>
        row.rounds.map((cell) => (cell.gap == null ? 0 : Number(cell.gap))),
      )
      .filter(Number.isFinite),
  );
  const x = (index) =>
    padding +
    (rounds.length === 1
      ? (width - padding * 2) / 2
      : (index * (width - padding * 2)) / Math.max(1, rounds.length - 1));
  const y = (gap) => padding + (Number(gap) / maximum) * (height - padding * 2);
  return (
    <svg
      className="compact-series-plot"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Points deficit below each round’s leader; missing observations break lines"
    >
      <line
        className="compact-series-baseline"
        x1={padding}
        x2={width - padding}
        y1={padding}
        y2={padding}
      />
      {series.map((row, index) => {
        let connected = false;
        const path = row.rounds
          .map((cell, i) => {
            if (cell.gap == null) {
              connected = false;
              return "";
            }
            const segment = `${connected ? "L" : "M"}${x(i)},${y(cell.gap)}`;
            connected = true;
            return segment;
          })
          .join(" ");
        return (
          <g
            className={`compact-series compact-series--${index + 1}`}
            key={row.entityId}
            data-testid="chase-series"
          >
            <path d={path} />
            {row.rounds.map(
              (cell, i) =>
                cell.gap != null && (
                  <circle
                    key={cell.round}
                    data-coverage={cell.coverage}
                    cx={x(i)}
                    cy={y(cell.gap)}
                    r={APEX_CHART.lineSymbolSize / 2}
                  >
                    <title>{describe(row, cell)}</title>
                  </circle>
                ),
            )}
          </g>
        );
      })}
    </svg>
  );
}
