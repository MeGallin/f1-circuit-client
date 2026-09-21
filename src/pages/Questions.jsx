import { useState } from "react";
import { useAskQuestionMutation, useGetEventQuery } from "../api/archiveApi";
import ArchiveQuestionResult from "../components/ArchiveQuestionResult";
import {
  ActionLink,
  Button,
  EmptyState,
  ErrorState,
  Input,
  PageHeading,
  Panel,
  Select,
  Skeleton,
  SourceNote,
  StatusBadge,
} from "../components/ui";
import EntityPicker from "../components/EntityPicker";
import { useSearchParams } from "react-router-dom";
import "../styles/questions.css";

const initialContext = {
  year: null,
  eventId: null,
  sessionId: null,
  driverId: null,
  constructorId: null,
};

const questionExamples = [
  "Who won the 2024 British Grand Prix?",
  "How many wins does Lewis Hamilton have?",
  "Which driver has the most first-place finishes?",
  "Which driver has had the most second-place finishes?",
  "Which driver has had the most fifth-place finishes?",
  "Who has the most podium finishes in position 3?",
  "Which constructor scored the most points in 2023?",
  "How many races did Max Verstappen win in 2023?",
  "Who won the 2000 World Championship?",
  "Which circuit hosted the 2022 Italian Grand Prix?",
];

function contextFromForm(form, current) {
  const year = String(form.get("year") || "").trim();
  return {
    ...current,
    year: year ? Number(year) : null,
  };
}

function SessionPicker({ eventId, value, onChange }) {
  const event = useGetEventQuery({ eventId }, { skip: !eventId });
  const sessions = event.currentData?.detail?.sessions || [];
  return (
    <Select
      label="Session"
      value={value || ""}
      disabled={!eventId || event.isFetching}
      options={[
        {
          value: "",
          label: !eventId
            ? "Choose an event first"
            : event.isFetching
              ? "Loading sessions…"
              : "Choose session",
        },
        ...sessions.map((session) => ({
          value: session.id,
          label: session.label || session.kind || session.id,
        })),
      ]}
      onChange={(event) => onChange(event.target.value || null)}
    />
  );
}

function QuestionUnavailable() {
  return (
    <Panel title="Ask is not available yet">
      <div className="question-capability" role="status">
        <StatusBadge tone="warning">Unavailable</StatusBadge>
        <p>
          The AI-assisted question route is not enabled in this archive build.
          It will only answer from published archive data when it is available.
        </p>
        <p className="muted">
          Use Explore to find published drivers, constructors, circuits, events
          and seasons with their source and evidence attached.
        </p>
        <div className="question-capability-actions">
          <ActionLink to="/explore">Explore the archive</ActionLink>
        </div>
      </div>
    </Panel>
  );
}

export default function Questions() {
  const [params] = useSearchParams();
  const enabled = import.meta.env.VITE_ENABLE_QUESTION_LAYER !== "false";
  const [context, setContext] = useState(initialContext);
  const [contextLabels, setContextLabels] = useState({});
  const [text, setText] = useState(() => params.get("q") || "");
  const [ask, query] = useAskQuestionMutation();
  const submit = async (event, selectedContext = context) => {
    event?.preventDefault();
    const form = event ? new FormData(event.currentTarget) : null;
    const nextText = event ? String(form.get("text") || "").trim() : text;
    const nextContext = form ? contextFromForm(form, context) : selectedContext;
    if (!nextText || nextText.length > 500) return;
    setText(nextText);
    setContext(nextContext);
    await ask({ text: nextText, context: nextContext });
  };
  const handleChoice = (choice) => {
    setContext(choice.context);
    const suffix = choice.label ? ` ${choice.label.toLowerCase()}` : "";
    void ask({ text: `${text}${suffix}`, context: choice.context });
  };
  const clearQuestion = () => {
    setText("");
    setContext(initialContext);
    setContextLabels({});
    query.reset();
  };
  return (
    <>
      <PageHeading
        eyebrow="ASK THE ARCHIVE"
        title="Ask the archive"
        description={
          <>
            {enabled
              ? "Ask a question in ordinary language. Answers are built from the published archive and show their evidence."
              : "The optional question layer is not enabled. Use the archive’s direct, source-backed journeys instead."}
            <span className="question-coverage-note">
              Questions use published archive data and show its source coverage.
            </span>
          </>
        }
        actions={<ActionLink to="/explore">Explore the archive</ActionLink>}
      />
      {!enabled ? (
        <QuestionUnavailable />
      ) : query.isUninitialized ? (
        <Panel title="Write a complete question">
          <form className="questions-form" onSubmit={submit}>
            <Select
              id="question-example"
              label="Example question"
              defaultValue=""
              options={[
                { value: "", label: "Choose an example question" },
                ...questionExamples.map((example) => ({
                  value: example,
                  label: example,
                })),
              ]}
              onChange={(event) => {
                if (event.target.value) setText(event.target.value);
              }}
            />
            <div className="field questions-form__text">
              <label htmlFor="question-text">Question</label>
              <textarea
                id="question-text"
                name="text"
                value={text}
                onChange={(event) => setText(event.target.value)}
                maxLength={500}
                rows={4}
                placeholder="Ask about a race, driver, constructor, circuit, season or session..."
                aria-describedby="question-count"
                required
              />
              <span id="question-count" className="muted" aria-live="polite">
                {text.length}/500 characters
              </span>
            </div>
            <div className="question-form-actions">
              <Button type="submit">Ask question</Button>
            </div>
            <details className="question-context-disclosure">
              <summary className="question-disclosure-summary">
                <span>Add context</span>
                <span className="question-disclosure-meta">
                  Optional
                  <span
                    className="question-disclosure-indicator"
                    aria-hidden="true"
                  />
                </span>
              </summary>
              <fieldset>
                <legend>Optional context</legend>
                <p className="muted">
                  Pin the interpretation to a published season, race, driver,
                  team or session when the wording could mean more than one
                  thing.
                </p>
                <div className="questions-context">
                  <Input
                    label="Season year"
                    name="year"
                    type="number"
                    min="2000"
                    max="2100"
                  />
                  <EntityPicker
                    label="Event"
                    kind="event"
                    value={context.eventId || ""}
                    displayName={contextLabels.event || ""}
                    onChange={(id, item) => {
                      setContext((current) => ({
                        ...current,
                        eventId: id || null,
                        sessionId: null,
                      }));
                      setContextLabels((current) => ({
                        ...current,
                        event: item?.entity?.displayName || "",
                        session: "",
                      }));
                    }}
                  />
                  <SessionPicker
                    eventId={context.eventId}
                    value={context.sessionId}
                    onChange={(id) =>
                      setContext((current) => ({ ...current, sessionId: id }))
                    }
                  />
                  <EntityPicker
                    label="Driver"
                    kind="driver"
                    value={context.driverId || ""}
                    displayName={contextLabels.driver || ""}
                    onChange={(id, item) => {
                      setContext((current) => ({
                        ...current,
                        driverId: id || null,
                      }));
                      setContextLabels((current) => ({
                        ...current,
                        driver: item?.entity?.displayName || "",
                      }));
                    }}
                  />
                  <EntityPicker
                    label="Constructor"
                    kind="constructor"
                    value={context.constructorId || ""}
                    displayName={contextLabels.constructor || ""}
                    onChange={(id, item) => {
                      setContext((current) => ({
                        ...current,
                        constructorId: id || null,
                      }));
                      setContextLabels((current) => ({
                        ...current,
                        constructor: item?.entity?.displayName || "",
                      }));
                    }}
                  />
                </div>
              </fieldset>
            </details>
          </form>
          <div className="question-output">
            <EmptyState
              title="Ready when you are"
              description={
                <>
                  <span>
                    The archive will interpret the question only after you
                    submit it.
                  </span>
                  <span className="question-coverage-note">
                    The published archive currently covers Formula 1 data from
                    the 2000 season onward. Earlier seasons are not included at
                    this stage.
                  </span>
                </>
              }
            />
          </div>
        </Panel>
      ) : (
        <Panel
          title="Archive result"
          action={
            <Button variant="secondary" onClick={clearQuestion}>
              Clear question
            </Button>
          }
        >
          <div className="question-result-view">
            <div className="question-submitted">
              <span className="question-result-label">Submitted question</span>
              <p className="question-result-question">{text}</p>
            </div>
            <div className="question-output">
              {query.isLoading ? (
                <Skeleton label="Interpreting the published archive" />
              ) : query.isError ? (
                <ErrorState
                  status={query.error?.status}
                  onRetry={() => void ask({ text, context })}
                />
              ) : (
                <ArchiveQuestionResult
                  result={query.data?.questionResult}
                  onChoice={handleChoice}
                />
              )}
            </div>
            {text.trim() ? (
              <ActionLink
                variant="quiet"
                to={`/explore?q=${encodeURIComponent(text.trim())}`}
              >
                Browse matching archive items
              </ActionLink>
            ) : null}
            <SourceNote meta={query.data?.meta} />
          </div>
        </Panel>
      )}
    </>
  );
}
