import { useState } from "react";
import { useAskQuestionMutation } from "../api/archiveApi";
import {
  ActionLink,
  Button,
  EmptyState,
  ErrorState,
  Input,
  PageHeading,
  Panel,
  Skeleton,
  SourceNote,
  StatusBadge,
  TextLink,
} from "../components/ui";
import "../styles/questions.css";

const initialContext = {
  year: null,
  eventId: null,
  sessionId: null,
  driverId: null,
  constructorId: null,
};

function contextFromForm(form) {
  const year = String(form.get("year") || "").trim();
  return {
    year: year ? Number(year) : null,
    eventId: String(form.get("eventId") || "").trim() || null,
    sessionId: String(form.get("sessionId") || "").trim() || null,
    driverId: String(form.get("driverId") || "").trim() || null,
    constructorId: String(form.get("constructorId") || "").trim() || null,
  };
}

function displayValue(value) {
  if (value === null || value === undefined) return "Not supplied";
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

function QuestionResult({ result, onChoice }) {
  if (!result) return null;
  if (result.status === "clarification") {
    return (
      <div className="question-result" role="status">
        <StatusBadge tone="warning">Clarification needed</StatusBadge>
        <p>{result.message}</p>
        <div className="question-choices">
          {result.choices.map((choice, index) => (
            <Button
              variant="secondary"
              key={`${choice.label}-${index}`}
              onClick={() => onChoice(choice.context)}
            >
              {choice.label}
            </Button>
          ))}
        </div>
      </div>
    );
  }
  if (result.status !== "answered") {
    return (
      <div className="question-result" role="status">
        <StatusBadge tone="warning">{result.status}</StatusBadge>
        <p>{result.message}</p>
        {result.reasonCode && <p className="muted">{result.reasonCode}</p>}
      </div>
    );
  }
  return (
    <div className="question-result" role="status">
      <div className="question-result-heading">
        <StatusBadge tone="success">Answered</StatusBadge>
        <span className="muted">{result.resolvedIntent}</span>
      </div>
      <p className="muted">Template: {result.templateKey}</p>
      <dl className="question-values">
        {Object.entries(result.values || {}).map(([key, value]) => (
          <div key={key}>
            <dt>{key}</dt>
            <dd>{displayValue(value)}</dd>
          </div>
        ))}
      </dl>
      {result.evidenceIds?.length ? (
        <div className="question-evidence">
          <strong>Evidence</strong>
          <ul>
            {result.evidenceIds.map((evidenceId) => (
              <li key={evidenceId}>
                <TextLink to={`/evidence/${encodeURIComponent(evidenceId)}`}>
                  {evidenceId}
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

export default function Questions() {
  const [context, setContext] = useState(initialContext);
  const [text, setText] = useState("");
  const [ask, query] = useAskQuestionMutation();
  const submit = async (event, selectedContext = context) => {
    event?.preventDefault();
    const form = event ? new FormData(event.currentTarget) : null;
    const nextText = event
      ? String(form.get("text") || "").trim()
      : text;
    const nextContext = form ? contextFromForm(form) : selectedContext;
    if (!nextText || nextText.length > 500) return;
    setText(nextText);
    setContext(nextContext);
    await ask({ text: nextText, context: nextContext });
  };
  const handleChoice = (choiceContext) => {
    setContext(choiceContext);
    void ask({ text, context: choiceContext });
  };
  return (
    <>
      <PageHeading
        eyebrow="ASK THE ARCHIVE"
        title="Questions"
        description="Ask a supported, read-only question. Answers use deterministic archive templates and always show the supplied evidence references; unsupported questions stay clearly labelled."
        actions={<ActionLink to="/records">Browse records</ActionLink>}
      />
      <Panel title="Ask a question">
        <form className="questions-form" onSubmit={submit}>
          <div className="field questions-form__text">
            <label htmlFor="question-text">Question</label>
            <textarea
              id="question-text"
              name="text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              maxLength={500}
              rows={4}
              placeholder="Try: How many wins does driver:hamilton have?"
              required
            />
            <span className="muted">{text.length}/500 characters</span>
          </div>
          <fieldset>
            <legend>Optional context</legend>
            <p className="muted">
              Use canonical IDs when you want to pin the interpretation to a
              published entity or session.
            </p>
            <div className="questions-context">
              <Input label="Season year" name="year" type="number" min="1950" max="2100" />
              <Input label="Event ID" name="eventId" placeholder="event:..." />
              <Input label="Session ID" name="sessionId" placeholder="session:..." />
              <Input label="Driver ID" name="driverId" placeholder="driver:..." />
              <Input label="Constructor ID" name="constructorId" placeholder="constructor:..." />
            </div>
          </fieldset>
          <Button type="submit" disabled={query.isLoading}>
            {query.isLoading ? "Interpreting…" : "Ask question"}
          </Button>
        </form>
        {query.isUninitialized ? (
          <EmptyState
            title="Ready when you are"
            description="The archive will interpret the question only after you submit it."
          />
        ) : query.isLoading ? (
          <Skeleton label="Interpreting the published archive" />
        ) : query.isError ? (
          <ErrorState
            status={query.error?.status}
            onRetry={() => void ask({ text, context })}
          />
        ) : (
          <QuestionResult result={query.data?.questionResult} onChoice={handleChoice} />
        )}
        <SourceNote meta={query.data?.meta} />
      </Panel>
    </>
  );
}
