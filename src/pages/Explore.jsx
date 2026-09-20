import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAskQuestionMutation, useGetSeasonsQuery } from "../api/archiveApi";
import ArchiveQuestionResult from "../components/ArchiveQuestionResult";
import {
  ActionLink,
  Button,
  ErrorState,
  Input,
  PageHeading,
  Panel,
  Select,
  Skeleton,
  SourceNote,
} from "../components/ui";
import { changeFilters } from "../features/entities/shared";
import { runtimeYear, selectSeasonOptions } from "../features/season/selectors";
import "../styles/entities.css";
import "../styles/questions.css";

const initialContext = {
  year: null,
  eventId: null,
  sessionId: null,
  driverId: null,
  constructorId: null,
};

function questionContext(season) {
  const year = Number(season);
  return Number.isInteger(year) ? { ...initialContext, year } : initialContext;
}

export default function Explore() {
  const [params, setParams] = useSearchParams();
  const season = params.get("season") || String(runtimeYear());
  const queryText = params.get("q") || "";
  const [text, setText] = useState(queryText);
  const [ask, query] = useAskQuestionMutation();
  const seasons = useGetSeasonsQuery();
  const seasonOptions = selectSeasonOptions(seasons.currentData);
  const resolvedSeasonOptions = seasonOptions.length
    ? seasonOptions
    : [{ value: season, label: `${season} season` }];

  useEffect(() => {
    if (queryText.trim())
      void ask({ text: queryText.trim(), context: questionContext(season) });
  }, [ask, queryText, season]);

  const submit = (event) => {
    event.preventDefault();
    const nextText = text.trim();
    if (nextText.length < 2 || nextText.length > 500) return;
    setParams(changeFilters(params, { q: nextText, type: "" }));
  };

  const clearQuestion = () => {
    setText("");
    setParams(changeFilters(params, { q: "", type: "" }));
  };

  const handleChoice = (choice) => {
    const suffix = choice.label ? ` ${choice.label.toLowerCase()}` : "";
    void ask({
      text: `${text.trim()}${suffix}`,
      context: choice.context || questionContext(season),
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
            <Select
              label="Season context"
              value={season}
              options={resolvedSeasonOptions}
              onChange={(event) => setParams({ season: event.target.value })}
            />
            <ActionLink
              variant="quiet"
              to={`/compare?season=${encodeURIComponent(season)}`}
            >
              Compare two records
            </ActionLink>
          </div>
        }
      />
      <Panel title="What do you want to know?">
        <p className="explore-search-note">
          Ask a question about the published archive. The selected season is
          used as context when your wording includes a relative period such as
          “last four years”.
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
            placeholder="Try: Who won the 2024 British Grand Prix?"
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
            onRetry={() =>
              void ask({ text: queryText, context: questionContext(season) })
            }
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
          <ActionLink to={`/calendar?season=${encodeURIComponent(season)}`}>
            Find a race
          </ActionLink>
          <ActionLink
            to={`/standings?season=${encodeURIComponent(season)}&kind=drivers`}
          >
            Browse drivers
          </ActionLink>
          <ActionLink
            to={`/standings?season=${encodeURIComponent(season)}&kind=constructors`}
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
