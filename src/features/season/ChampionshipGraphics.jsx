import { useState } from "react";
import { useGetHomeChampionshipGraphicsQuery } from "../../api/archiveApi";
import { DataBoundary, Select } from "../../components/ui";
import { CompactSeriesPlot } from "../../components/charts/CompactSeriesPlot";
import "../../design-system/compact-charts.css";
const supplied = (value) => value ?? "Not available";
const decimal = (value) =>
  value === null ||
  (typeof value === "string" &&
    /^-?\d+(\.\d+)?$/.test(value) &&
    Number.isFinite(Number(value)));
const coverage = (value) =>
  ["complete", "partial", "unavailable"].includes(value);
const nullableText = (value) => value === null || typeof value === "string";
function validCell(cell, kind) {
  if (!cell || !coverage(cell.coverage)) return false;
  const validStanding =
    decimal(cell.gap) &&
    (cell.gap == null || Number(cell.gap) >= 0) &&
    decimal(cell.points) &&
    decimal(cell.leaderPoints) &&
    nullableText(cell.leaderId) &&
    nullableText(cell.leaderName) &&
    (cell.rank === null ||
      (Number.isSafeInteger(cell.rank) && cell.rank > 0)) &&
    (cell.gap == null
      ? cell.coverage === "unavailable"
      : cell.coverage !== "unavailable" &&
        cell.points !== null &&
        cell.leaderPoints !== null &&
        !!cell.leaderId &&
        !!cell.leaderName);
  return (
    validStanding &&
    (kind !== "drivers" ||
      (decimal(cell.racePoints) && coverage(cell.raceCoverage)))
  );
}
export function graphicsMatches(
  data,
  { year, round, standingSnapshotId, snapshotId },
  kind,
  rows,
) {
  const graphics = data?.graphics;
  if (
    !graphics ||
    !["complete", "partial"].includes(data.meta?.coverage) ||
    data.meta?.snapshotId !== snapshotId ||
    graphics.snapshotId !== snapshotId ||
    graphics.year !== year ||
    graphics.round !== Number(round) ||
    graphics.standingSnapshotId !== standingSnapshotId ||
    !Array.isArray(graphics.rounds) ||
    graphics.rounds.length > 64 ||
    !Array.isArray(graphics[kind])
  )
    return false;
  if (
    graphics.rounds.some(
      (item) =>
        !item ||
        typeof item.name !== "string" ||
        typeof item.eventId !== "string",
    )
  )
    return false;
  const numbers = graphics.rounds.map((item) => item.round);
  if (
    new Set(numbers).size !== numbers.length ||
    numbers.some(
      (number, index) =>
        !Number.isSafeInteger(number) ||
        number < 1 ||
        number > Number(round) ||
        (index > 0 && number <= numbers[index - 1]),
    )
  )
    return false;
  const series = graphics[kind];
  return (
    series.length === rows.length &&
    series.length <= 3 &&
    series.every(
      (item, index) =>
        item &&
        typeof item.name === "string" &&
        item.entityId === rows[index]?.entity?.id &&
        Array.isArray(item.rounds) &&
        item.rounds.length === numbers.length &&
        item.rounds.every(
          (cell, i) => validCell(cell, kind) && cell.round === numbers[i],
        ),
    )
  );
}
const standingDescription = (row, cell) =>
  `${row.name}, Round ${cell.round}: championship points ${supplied(cell.points)}, deficit ${supplied(cell.gap)}, rank ${supplied(cell.rank)}. Round leader ${supplied(cell.leaderName)} (${supplied(cell.leaderPoints)}); standings ${cell.coverage}.`;
const driverDescription = (row, cell) =>
  `${standingDescription(row, cell)} Race entry points ${supplied(cell.racePoints)} (${cell.raceCoverage}).`;
function Chase({ graphics, kind }) {
  const series = graphics[kind];
  const describe = kind === "drivers" ? driverDescription : standingDescription;
  const [selectedRound, setRound] = useState(graphics.rounds.at(-1)?.round);
  const effectiveRound = graphics.rounds.some(
    (item) => item.round === selectedRound,
  )
    ? selectedRound
    : graphics.rounds.at(-1).round;
  return (
    <>
      <p className="compact-chart-note">0 = leader · points behind</p>
      <CompactSeriesPlot
        rounds={graphics.rounds}
        series={series}
        describe={describe}
      />
      <div className="compact-chart-round-ends" aria-hidden="true">
        <span>R{graphics.rounds[0].round}</span>
        <span>R{graphics.rounds.at(-1).round}</span>
      </div>
      <ol className="compact-chart-legend">
        {series.map((row, index) => (
          <li key={row.entityId} className={`compact-series--${index + 1}`}>
            <span className="compact-chart-key" aria-hidden="true" />
            <span>{row.name}</span>
            <span className="compact-chart-gap">
              {row.rounds.at(-1).gap ?? "—"}
              {row.rounds.at(-1).coverage === "partial" ? "*" : ""} pts
            </span>
          </li>
        ))}
      </ol>
      <p className="compact-chart-note">
        Latest R{graphics.rounds.at(-1).round} gaps · * partial standings
      </p>
      <details className="compact-chart-details">
        <summary>Exact round figures</summary>
        <p className="compact-chart-note">
          Hollow dots = partial standings. Missing gaps break lines. Each gap
          uses that round’s leader across all published standings; smaller gaps
          are closer to the leader.
        </p>
        <Select
          label="Inspect completed round"
          value={String(effectiveRound)}
          options={graphics.rounds.map((item) => ({
            value: String(item.round),
            label: `Round ${item.round}`,
          }))}
          onChange={(event) => setRound(Number(event.target.value))}
        />
        {series.map((row) => (
          <p key={row.entityId}>
            {describe(
              row,
              row.rounds.find((cell) => cell.round === effectiveRound),
            )}
          </p>
        ))}
      </details>
    </>
  );
}
export function ChampionshipGraphics({
  kind,
  rows,
  year,
  round,
  standingSnapshotId,
  snapshotId,
  onSnapshotReset,
}) {
  const context = { year, round, standingSnapshotId, snapshotId };
  const enabled = !!snapshotId && !!standingSnapshotId && !!rows.length;
  const query = useGetHomeChampionshipGraphicsQuery(
    { year, standingSnapshotId, snapshotId },
    { skip: !enabled },
  );
  if (!enabled) return null;
  const valid = graphicsMatches(query.currentData, context, kind, rows);
  const graphics = query.currentData?.graphics;
  return (
    <section
      className="home-championship-graphic"
      aria-label={
        kind === "drivers" ? "Championship chase" : "Points gap to the leader"
      }
    >
      <h4>
        {kind === "drivers" ? "Championship chase" : "Points gap to the leader"}
      </h4>
      <DataBoundary
        query={query}
        onRetry={query.error?.status === 409 ? onSnapshotReset : query.refetch}
      >
        {!valid ? (
          <p className="compact-chart-note">Graphic context not available</p>
        ) : !graphics.rounds.length ? (
          <p className="compact-chart-note">No completed rounds published</p>
        ) : (
          <Chase
            key={`${snapshotId}:${standingSnapshotId}`}
            graphics={graphics}
            kind={kind}
          />
        )}
      </DataBoundary>
    </section>
  );
}
