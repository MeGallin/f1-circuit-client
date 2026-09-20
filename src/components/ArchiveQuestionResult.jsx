import { Button, StatusBadge, TextLink } from "./ui";

const labels = {
  constructor: "Constructor",
  count: "Count",
  comparisonCount: "Compared count",
  comparisonDriver: "Compared driver",
  driver: "Driver",
  drivers: "Drivers",
  durationMs: "Duration (ms)",
  durationType: "Duration type",
  event: "Event",
  fromYear: "From year",
  firstWinDate: "First win date",
  firstWinEvent: "First win",
  firstWinRound: "First win round",
  firstWinYear: "First win year",
  lapNumber: "Lap",
  matches: "Matching records",
  missingPositions: "Missing positions",
  metric: "Metric",
  podium: "Podium",
  query: "Search",
  round: "Round",
  toYear: "To year",
  year: "Year",
};

function displayValue(value) {
  if (value === null || value === undefined) return "Not supplied";
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

export default function ArchiveQuestionResult({ result, onChoice }) {
  if (!result) return null;
  if (result.status === "clarification") {
    return (
      <div className="question-result" role="status">
        <StatusBadge tone="warning">Clarification needed</StatusBadge>
        <p className="question-result-message">{result.message}</p>
        {result.choices?.length ? (
          <div className="question-choices">
            {result.choices.map((choice, index) => (
              <Button
                variant="secondary"
                key={`${choice.label}-${index}`}
                onClick={() => onChoice?.(choice)}
              >
                {choice.label}
              </Button>
            ))}
          </div>
        ) : null}
      </div>
    );
  }
  if (result.status !== "answered") {
    return (
      <div className="question-result" role="status">
        <StatusBadge tone="warning">{result.status}</StatusBadge>
        <p className="question-result-message">{result.message}</p>
        {result.reasonCode && <p className="muted">{result.reasonCode}</p>}
      </div>
    );
  }
  const values = result.values || {};
  const detailEntries = Object.entries(values).filter(
    ([key]) => key !== "answer",
  );
  return (
    <div className="question-result" role="status">
      <div className="question-result-heading">
        <StatusBadge tone="success">Answer from the archive</StatusBadge>
      </div>
      <p className="question-answer">
        {values.answer || "The archive returned an answer."}
      </p>
      {detailEntries.length ? (
        <dl className="question-values">
          {detailEntries.map(([key, value]) => (
            <div key={key}>
              <dt>{labels[key] || key}</dt>
              <dd>{displayValue(value)}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {result.evidenceIds?.length ? (
        <div className="question-evidence">
          <strong>Evidence</strong>
          <ul>
            {result.evidenceIds.map((evidenceId) => (
              <li key={evidenceId}>
                <TextLink to={`/evidence/${encodeURIComponent(evidenceId)}`}>
                  View source evidence
                </TextLink>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="muted">No evidence references supplied.</p>
      )}
    </div>
  );
}
