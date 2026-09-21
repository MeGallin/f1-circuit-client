import { Button, StatusBadge, TextLink } from "./ui";

const labels = {
  constructor: "Constructor",
  championshipYears: "Championship years",
  count: "Count",
  comparisonCount: "Compared count",
  comparisonCompounds: "Compared compounds",
  comparisonDriver: "Compared driver",
  comparisonEvents: "Compared events",
  comparisonPeriod: "Compared period",
  comparisonObservations: "Compared observations",
  comparisonAirTemperatureMinC: "Compared minimum air temperature (°C)",
  comparisonAirTemperatureMaxC: "Compared maximum air temperature (°C)",
  comparisonTrackTemperatureMinC: "Compared minimum track temperature (°C)",
  comparisonTrackTemperatureMaxC: "Compared maximum track temperature (°C)",
  comparisonRainfallObservations: "Compared rainfall observations",
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
  observationCount: "Weather observations",
  airTemperatureMinC: "Minimum air temperature (°C)",
  airTemperatureMaxC: "Maximum air temperature (°C)",
  trackTemperatureMinC: "Minimum track temperature (°C)",
  trackTemperatureMaxC: "Maximum track temperature (°C)",
  rainfallObservations: "Rainfall observations",
  compounds: "Compounds",
  circuit: "Circuit",
  country: "Country",
  events: "Events",
  period: "Period",
  observations: "Observations",
  stintCount: "Tyre stints",
  tyreLaps: "Tyre laps",
  messageCount: "Race-control messages",
  safetyCarEvents: "Safety-car events",
  redFlagEvents: "Red-flag events",
  highlights: "Highlights",
  podium: "Podium",
  query: "Search",
  round: "Round",
  toYear: "To year",
  year: "Year",
  winners: "Race winners",
};

function displayValue(value) {
  if (value === null || value === undefined) return "Not supplied";
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

function QuestionResultHeading({ label, tone = "warning", onClear }) {
  return (
    <div className="question-result-heading">
      <StatusBadge tone={tone}>{label}</StatusBadge>
      {onClear ? (
        <Button variant="secondary" onClick={onClear}>
          Clear question
        </Button>
      ) : null}
    </div>
  );
}

export default function ArchiveQuestionResult({ result, onChoice, onClear }) {
  if (!result) return null;
  if (result.status === "clarification") {
    return (
      <div className="question-result" role="status">
        <QuestionResultHeading label="Clarification needed" onClear={onClear} />
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
        <QuestionResultHeading label={result.status} onClear={onClear} />
        <p className="question-result-message">{result.message}</p>
      </div>
    );
  }
  const values = result.values || {};
  const detailEntries = Object.entries(values).filter(
    ([key]) => key !== "answer",
  );
  return (
    <div className="question-result" role="status">
      <QuestionResultHeading
        label="Answer from the archive"
        tone="success"
        onClear={onClear}
      />
      <div className="question-answer-block">
        <span className="question-answer-label">Answer</span>
        <p className="question-answer">
          {values.answer || "The archive returned an answer."}
        </p>
      </div>
      {detailEntries.length || result.evidenceIds?.length ? (
        <div className="question-disclosures">
          {detailEntries.length ? (
            <details className="question-disclosure">
              <summary className="question-disclosure-summary">
                <span>Archive details</span>
                <span className="question-disclosure-meta">
                  {detailEntries.length} fields
                  <span
                    className="question-disclosure-indicator"
                    aria-hidden="true"
                  />
                </span>
              </summary>
              <dl className="question-values">
                {detailEntries.map(([key, value]) => (
                  <div key={key}>
                    <dt>{labels[key] || key}</dt>
                    <dd>{displayValue(value)}</dd>
                  </div>
                ))}
              </dl>
            </details>
          ) : null}
          {result.evidenceIds?.length ? (
            <details className="question-disclosure">
              <summary className="question-disclosure-summary">
                <span>Source evidence</span>
                <span className="question-disclosure-meta">
                  {result.evidenceIds.length}{" "}
                  {result.evidenceIds.length === 1 ? "source" : "sources"}
                  <span
                    className="question-disclosure-indicator"
                    aria-hidden="true"
                  />
                </span>
              </summary>
              <div className="question-evidence">
                <ul>
                  {result.evidenceIds.map((evidenceId) => (
                    <li key={evidenceId}>
                      <TextLink
                        to={`/evidence/${encodeURIComponent(evidenceId)}`}
                      >
                        View source evidence
                      </TextLink>
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          ) : null}
        </div>
      ) : (
        <p className="muted">No evidence references supplied.</p>
      )}
    </div>
  );
}
