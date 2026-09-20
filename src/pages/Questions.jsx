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
import "../styles/questions.css";

const initialContext = {
  year: null,
  eventId: null,
  sessionId: null,
  driverId: null,
  constructorId: null,
};

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
    <Panel title="Questions are not available yet">
      <div className="question-capability" role="status">
        <StatusBadge tone="warning">Unavailable</StatusBadge>
        <p>
          The optional question layer is disabled in this archive build. No
          model is used, and no question can supply facts outside the published
          API records.
        </p>
        <p className="muted">
          Use the deterministic archive journeys below to find the same
          information with its source and evidence attached.
        </p>
        <div className="question-capability-actions">
          <ActionLink to="/records">Browse published records</ActionLink>
          <ActionLink to="/explore">Explore drivers and circuits</ActionLink>
        </div>
      </div>
    </Panel>
  );
}

export default function Questions() {
  const enabled = import.meta.env.VITE_ENABLE_QUESTION_LAYER !== "false";
  const [context, setContext] = useState(initialContext);
  const [contextLabels, setContextLabels] = useState({});
  const [text, setText] = useState("");
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
  return (
    <>
      <PageHeading
        eyebrow="ASK THE ARCHIVE"
        title="Questions"
        description={
          enabled
            ? "Ask a supported, read-only question. Answers use deterministic archive templates and always show the supplied evidence references."
            : "The optional question layer is not enabled. Use the archive’s direct, source-backed journeys instead."
        }
        actions={<ActionLink to="/records">Browse records</ActionLink>}
      />
      {!enabled ? (
        <QuestionUnavailable />
      ) : (
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
                placeholder="Try: How many wins does Lewis Hamilton have?"
                required
              />
              <span className="muted">{text.length}/500 characters</span>
            </div>
            <fieldset>
              <legend>Optional context</legend>
              <p className="muted">
                Use published names when you want to pin the interpretation to a
                specific race, driver, team or session.
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
            <ArchiveQuestionResult
              result={query.data?.questionResult}
              onChoice={handleChoice}
            />
          )}
          <SourceNote meta={query.data?.meta} />
        </Panel>
      )}
    </>
  );
}
