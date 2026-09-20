import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAskQuestionMutation } from "../api/archiveApi";
import ArchiveQuestionResult from "../components/ArchiveQuestionResult";
import {
  ActionLink,
  Button,
  ErrorState,
  Input,
  PageHeading,
  Panel,
  Skeleton,
  SourceNote,
} from "../components/ui";
import { changeFilters } from "../features/entities/shared";
import { runtimeYear } from "../features/season/selectors";
import "../styles/entities.css";
import "../styles/questions.css";

export default function Explore() {
  const [params, setParams] = useSearchParams();
  const queryText = params.get("q") || "";
  const [text, setText] = useState(queryText);
  const [ask, query] = useAskQuestionMutation();
  const browseSeason = String(runtimeYear());

  useEffect(() => {
    if (queryText.trim()) void ask({ text: queryText.trim() });
  }, [ask, queryText]);

  const submit = (event) => {
    event.preventDefault();
    const nextText = text.trim();
    if (nextText.length < 2 || nextText.length > 500) return;
    const next = changeFilters(params, { q: nextText, type: "" });
    next.delete("season");
    setParams(next);
  };

  const clearQuestion = () => {
    setText("");
    const next = changeFilters(params, { q: "", type: "" });
    next.delete("season");
    setParams(next);
  };

  const handleChoice = (choice) => {
    const suffix = choice.label ? ` ${choice.label.toLowerCase()}` : "";
    void ask({
      text: `${text.trim()}${suffix}`,
      ...(choice.context ? { context: choice.context } : {}),
    });
  };

  return (
    <>
      <PageHeading
        eyebrow="EXPLORE THE ARCHIVE"
        title="Ask the archive"
        description="Use ordinary language to explore published drivers, constructors, circuits, events and seasons. Answers are built from the archive database and include their evidence."
        actions={
          <div className="explore-page-actions">
            <ActionLink variant="quiet" to="/compare">
              Compare two records
            </ActionLink>
          </div>
        }
      />
      <Panel title="What do you want to know?">
        <p className="explore-search-note">
          Ask a complete question about the published archive, for example,
          “Who won the 2024 British Grand Prix?” Years and time periods belong
          in the question itself.
        </p>
        <form
          className="questions-form explore-question-form"
          onSubmit={submit}
        >
          <Input
            label="Question"
            name="question"
            value={text}
            onChange={(event) => setText(event.target.value)}
            maxLength={500}
            required
            minLength={2}
            placeholder="e.g. Who won the 2024 British Grand Prix?"
          />
          <div className="explore-question-actions">
            <Button type="submit" disabled={query.isLoading}>
              {query.isLoading ? "Checking the archive…" : "Ask the archive"}
            </Button>
            {query.data && (
              <Button variant="quiet" type="button" onClick={clearQuestion}>
                Clear question
              </Button>
            )}
          </div>
        </form>
        {!queryText ? (
          <div className="explore-idle-state">
            <h3>Start with a question</h3>
            <p>
              Ask about a race, driver, constructor, circuit or season in your
              own words. The archive will ask for clarification when the wording
              is ambiguous.
            </p>
          </div>
        ) : query.isLoading ? (
          <Skeleton label="Interpreting the published archive" />
        ) : query.isError ? (
          <ErrorState
            status={query.error?.status}
            onRetry={() => void ask({ text: queryText })}
          />
        ) : (
          <ArchiveQuestionResult
            result={query.data?.questionResult}
            onChoice={handleChoice}
          />
        )}
        <SourceNote meta={query.data?.meta} />
      </Panel>
      <Panel title="Browse another route">
        <nav className="explore-browse" aria-label="Browse archive routes">
          <ActionLink to={`/calendar?season=${encodeURIComponent(browseSeason)}`}>
            Find a race
          </ActionLink>
          <ActionLink
            to={`/standings?season=${encodeURIComponent(browseSeason)}&kind=drivers`}
          >
            Browse drivers
          </ActionLink>
          <ActionLink
            to={`/standings?season=${encodeURIComponent(browseSeason)}&kind=constructors`}
          >
            Browse constructors
          </ActionLink>
          <ActionLink to="/records">Browse published records</ActionLink>
        </nav>
        <p className="muted explore-browse-note">
          Use the archive question box for natural-language queries, or browse a
          structured route when you already know what you want to inspect.
        </p>
      </Panel>
    </>
  );
}
