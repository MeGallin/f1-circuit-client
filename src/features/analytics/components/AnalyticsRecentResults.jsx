export function buildRecentResultsModel(race) {
  return (race?.results || []).slice(0, 5);
}

export function formatResultGap(gap) {
  if (!gap) return "Classified";
  if (gap.kind === "leader") return "Winner";
  if (gap.kind === "laps" && gap.laps != null) {
    return `+${gap.laps} lap${gap.laps === 1 ? "" : "s"}`;
  }
  if (gap.kind === "time" && gap.milliseconds != null) {
    return `+${(gap.milliseconds / 1000).toFixed(3)}s`;
  }
  return "Classified";
}

function ResultRow({ result }) {
  return (
    <li className="analytics-recent-result">
      <span className="analytics-recent-result-position">
        {result.position}
      </span>
      <div className="analytics-recent-result-driver">
        <strong>{result.driverName || "Driver not supplied"}</strong>
        <small>{result.constructorName || "Constructor not supplied"}</small>
      </div>
      <div className="analytics-recent-result-outcome">
        <strong>
          {result.points != null
            ? `${result.points} pts`
            : "Points not published"}
        </strong>
        <small>{formatResultGap(result.gap)}</small>
      </div>
    </li>
  );
}

export default function AnalyticsRecentResults({ race }) {
  const results = buildRecentResultsModel(race);
  if (!race || !results.length) {
    return (
      <p className="muted">
        No published race results are available for this selection.
      </p>
    );
  }
  return (
    <div className="analytics-recent-results">
      <div className="analytics-recent-results-heading">
        <div>
          <h3>{race.name}</h3>
          <p>
            Round {race.round} ·{" "}
            {race.circuit?.displayName || "Circuit not supplied"}
          </p>
        </div>
        <span>Top {results.length}</span>
      </div>
      <ol aria-label={`${race.name} leading results`}>
        {results.map((result) => (
          <ResultRow
            key={`${result.position}-${result.driverId}`}
            result={result}
          />
        ))}
      </ol>
    </div>
  );
}
