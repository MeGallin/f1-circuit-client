import { useSearchParams } from "react-router-dom";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useSearchEntitiesQuery } from "../api/archiveApi";
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
  Tabs,
  TextLink,
} from "../components/ui";
import { changeFilters, CollectionPages } from "../features/entities/shared";
import { runtimeYear } from "../features/season/selectors";
import "../styles/entities.css";

const kindItems = [
  { value: "", label: "All" },
  { value: "driver", label: "Drivers" },
  { value: "constructor", label: "Constructors" },
  { value: "circuit", label: "Circuits" },
  { value: "event", label: "Events" },
  { value: "season", label: "Seasons" },
];

const kindLabels = Object.fromEntries(
  kindItems.filter((item) => item.value).map((item) => [item.value, item.label]),
);

function SearchResultItem({ item }) {
  const name = item.entity?.displayName || item.id;
  const evidencePath = item.evidenceId
    ? `/evidence/${encodeURIComponent(item.evidenceId)}`
    : null;
  return (
    <li className="explore-result">
      <div className="explore-result-copy">
        <div className="explore-result-meta">
          <span className="explore-result-kind">
            {kindLabels[item.kind] || item.kind || "Archive item"}
          </span>
          {item.context && (
            <span className="explore-result-context">{item.context}</span>
          )}
        </div>
        {item.entity?.clientPath ? (
          <TextLink to={item.entity.clientPath}>{name}</TextLink>
        ) : (
          <strong>{name}</strong>
        )}
      </div>
      {evidencePath && (
        <TextLink
          to={evidencePath}
          aria-label={`View evidence for ${name}`}
          className="explore-result-evidence"
        >
          View evidence
        </TextLink>
      )}
    </li>
  );
}

function SearchResults({ queryText, data, query, onClear }) {
  if (query.isLoading || (!data && query.isFetching))
    return <Skeleton label="Searching the archive" />;

  if (query.isError && !data)
    return (
      <ErrorState
        status={query.error?.status}
        onRetry={() => void query.refetch()}
      />
    );

  if (!data)
    return (
      <EmptyState
        title="Search is ready"
        description="Enter at least two characters to search the published archive."
      />
    );

  const items = data.items || [];
  return (
    <div
      className="explore-results"
      aria-busy={query.isFetching || undefined}
    >
      <div className="explore-results-heading">
        <div>
          <p className="eyebrow">SEARCH RESULTS</p>
          <h3>
            {items.length} {items.length === 1 ? "match" : "matches"} for{" "}
            <q>{queryText}</q>
          </h3>
        </div>
        {query.isFetching && <StatusBadge>Updating</StatusBadge>}
      </div>
      {data.meta?.coverage === "partial" && (
        <p className="explore-coverage-note" role="status">
          Results include published matches from a partially covered archive.
          Missing source data is not treated as a match.
        </p>
      )}
      {items.length ? (
        <ul className="entity-list explore-result-list">
          {items.map((item) => (
            <SearchResultItem key={`${item.kind}:${item.id}`} item={item} />
          ))}
        </ul>
      ) : (
        <div className="explore-empty-state">
          <EmptyState
            title={`No published matches for “${queryText}”`}
            description="Try a driver, constructor, circuit, event or four-digit season. Search uses the published archive and does not fill gaps with guessed data."
            action={
              <Button variant="secondary" onClick={onClear}>
                Clear search
              </Button>
            }
          />
        </div>
      )}
      <CollectionPages
        data={data}
        query={query}
        params={query.params}
        setParams={query.setParams}
        label="Search result pages"
      />
    </div>
  );
}

export default function Explore() {
  const [params, setParams] = useSearchParams();
  const queryText = (params.get("q") || "").trim();
  const kindParam = params.get("kind") || "";
  const kind = kindItems.some((item) => item.value === kindParam)
    ? kindParam
    : "";
  const cursor = params.get("cursor") || undefined;
  const snapshotId = params.get("snapshot") || undefined;
  const search = useSearchEntitiesQuery(
    { q: queryText, kind: kind || undefined, cursor, snapshotId },
    { skip: queryText.length < 2 },
  );
  const browseSeason = String(params.get("season") || runtimeYear());

  const submit = (event) => {
    event.preventDefault();
    const nextText = String(new FormData(event.currentTarget).get("query") || "").trim();
    if (nextText.length < 2 || nextText.length > 100) return;
    setParams(changeFilters(params, { q: nextText }));
  };

  const clearSearch = () => {
    setParams(changeFilters(params, { q: "" }));
    window.requestAnimationFrame(() =>
      document.getElementById("explore-query")?.focus(),
    );
  };

  const selectKind = (value) => {
    setParams(changeFilters(params, { kind: value }));
  };

  const hasSearch = queryText.length > 0;
  const hasResults = Boolean(search.currentData?.items?.length);
  const showBrowse = !hasSearch || (search.currentData && !hasResults);

  return (
    <>
      <PageHeading
        eyebrow="EXPLORE THE ARCHIVE"
        title="Explore the archive"
        description="Find published drivers, constructors, circuits, events and seasons from the historical archive."
        icon={MagnifyingGlassIcon}
        actions={
          <div className="explore-page-actions">
            <ActionLink variant="quiet" to="/compare">
              Compare archive metrics
            </ActionLink>
          </div>
        }
      />
      <Panel title="Search the archive" icon={MagnifyingGlassIcon}>
        <p className="explore-search-note">
          Search the published archive by name or keyword. Results are not
          limited to a season
          {params.get("season")
            ? `; ${params.get("season")} is your browsing context`
            : ""}
          .
        </p>
        <form key={queryText} className="explore-search-form" onSubmit={submit}>
          <Input
            id="explore-query"
            label="Find a driver, constructor, circuit, event or season"
            name="query"
            defaultValue={queryText}
            maxLength={100}
            minLength={2}
            required
            placeholder="e.g. Hamilton, Silverstone or 2008"
          />
          <div className="explore-search-actions">
            <Button type="submit" disabled={search.isFetching}>
              {search.isFetching ? "Searching…" : "Search the archive"}
            </Button>
            {hasSearch && (
              <Button variant="quiet" type="button" onClick={clearSearch}>
                Clear search
              </Button>
            )}
            {hasSearch && (
              <ActionLink
                variant="quiet"
                to={`/questions?q=${encodeURIComponent(queryText)}`}
              >
                Ask a question instead
              </ActionLink>
            )}
          </div>
        </form>
        <Tabs
          label="Search result type"
          items={kindItems}
          value={kind}
          onChange={selectKind}
        >
          {!hasSearch ? (
            <div className="explore-idle-state">
              <h3>Find a published archive item</h3>
              <p>
                Search for a person, team, place, race or season. Choose a
                result type when you want to narrow the list before you open a
                profile or event.
              </p>
            </div>
          ) : queryText.length < 2 ? (
            <EmptyState
              title="Keep typing"
              description="Search needs at least two characters."
            />
          ) : (
            <SearchResults
              queryText={queryText}
              data={search.currentData}
              query={{ ...search, params, setParams }}
              onClear={clearSearch}
            />
          )}
        </Tabs>
        <SourceNote meta={search.currentData?.meta} />
      </Panel>
      {showBrowse && (
        <Panel title="Browse by route">
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
          </nav>
          <p className="muted explore-browse-note">
            Search is best when you know a name or place; these routes are a
            direct way into the season archive.
          </p>
        </Panel>
      )}
    </>
  );
}
