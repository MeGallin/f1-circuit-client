import { useSearchParams } from "react-router-dom";
import {
  useGetSeasonsQuery,
  useSearchEntitiesQuery,
} from "../api/archiveApi";
import {
  PageHeading,
  Panel,
  Input,
  Select,
  Button,
  ActionLink,
  TextLink,
  ErrorState,
  Skeleton,
  SourceNote,
} from "../components/ui";
import {
  entityPath,
  changeFilters,
  CollectionPages,
  refreshSelection,
} from "../features/entities/shared";
import { runtimeYear, selectSeasonOptions } from "../features/season/selectors";
import "../styles/entities.css";
export const searchKinds = [
  { value: "", label: "All records" },
  ...[
    ["driver", "Drivers"],
    ["constructor", "Constructors"],
    ["circuit", "Circuits"],
    ["event", "Events"],
    ["season", "Seasons"],
  ].map(([value, label]) => ({ value, label })),
];

const kindLabels = Object.fromEntries(
  searchKinds
    .filter((option) => option.value)
    .map((option) => [option.value, option.label.slice(0, -1)]),
);
const searchExamples = ["Hamilton", "Silverstone", "2024"];

function kindLabel(kind) {
  return kindLabels[kind] || "Record";
}

function resultPath(row, season) {
  return (
    entityPath(row.kind, row.entity.id, season) ||
    (row.kind === "season"
      ? `/?season=${encodeURIComponent(row.entity.displayName)}`
      : `/events/${encodeURIComponent(row.entity.id)}${row.context && /^\d{4}$/.test(row.context) ? `?season=${row.context}` : ""}`)
  );
}

export default function Explore() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const requestedKind = params.get("type") || "";
  const kind = searchKinds.some((option) => option.value === requestedKind)
    ? requestedKind
    : "";
  const season = params.get("season") || String(runtimeYear());
  const seasons = useGetSeasonsQuery();
  const seasonOptions = selectSeasonOptions(seasons.currentData);
  const valid =
    q.trim().length >= 2 &&
    q.length <= 100 &&
    searchKinds.some((option) => option.value === kind);
  const query = useSearchEntitiesQuery(
    {
      q,
      kind: kind || undefined,
      cursor: params.get("cursor") || undefined,
      snapshotId: params.get("snapshot") || undefined,
    },
    { skip: !valid },
  );
  const data = query.currentData;
  const clearSearch = () =>
    setParams(changeFilters(params, { q: "", type: "" }));
  const runExample = (value) =>
    setParams(changeFilters(params, { q: value, type: "" }));
  const comparePath = `/compare?${new URLSearchParams({ season })}`;
  const seasonSelectOptions = seasonOptions.length
    ? seasonOptions
    : [{ value: season, label: `${season} season` }];
  return (
    <>
      <PageHeading
        eyebrow="EXPLORE THE ARCHIVE"
        title="People, teams & places"
        description="Search published drivers, constructors, circuits, events and seasons. Open a record for its history and evidence."
        actions={
          <div className="explore-page-actions">
            <Select
              label="Season context"
              value={season}
              options={seasonSelectOptions}
              onChange={(e) => setParams({ season: e.target.value })}
            />
            <ActionLink variant="quiet" to={comparePath}>
              Compare two records
            </ActionLink>
          </div>
        }
      />
      <Panel title="Search the archive">
        <p className="explore-search-note">
          Results come from the published archive snapshot. Search is not
          limited to the selected season.
        </p>
        <form
          key={`${q}:${kind}`}
          className="entity-filters explore-search-form"
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            setParams(
              changeFilters(params, {
                q: String(form.get("q")).trim(),
                type: form.get("type"),
              }),
            );
          }}
        >
          <Input
            label="Name, circuit, race or season"
            name="q"
            defaultValue={q}
            required
            minLength={2}
            maxLength={100}
            placeholder="Try Hamilton, Silverstone or 2024"
          />
          <Select
            label="Record type"
            name="type"
            defaultValue={kind}
            options={searchKinds}
          />
          <Button type="submit">Search</Button>
        </form>
        {!valid ? (
          <div className="explore-idle-state">
            <h3>Start with a search</h3>
            <p>
              Search people, teams, circuits, races or seasons, then open a
              published record for its history.
            </p>
            <div className="explore-suggestions" aria-label="Example searches">
              <span>Try</span>
              {searchExamples.map((example) => (
                <button
                  key={example}
                  type="button"
                  className="explore-suggestion"
                  onClick={() => runExample(example)}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {query.isLoading || (!data && query.isFetching) ? (
              <Skeleton label="Searching the archive" />
            ) : query.isError && !data ? (
              <ErrorState
                status={query.error?.status}
                onRetry={() => refreshSelection(params, setParams, query)}
              />
            ) : data?.items.length ? (
              <div className="explore-results" aria-live="polite">
                <div className="explore-results-heading">
                  <div>
                    <p className="eyebrow">SEARCH RESULTS</p>
                    <h3>
                      {data.page.total ?? data.items.length}{" "}
                      {data.page.total === 1 ? "result" : "results"}
                    </h3>
                  </div>
                  <Button variant="quiet" type="button" onClick={clearSearch}>
                    Clear search
                  </Button>
                </div>
                {query.isError && data && (
                  <ErrorState
                    status={query.error?.status}
                    onRetry={() => refreshSelection(params, setParams, query)}
                  />
                )}
                <ul className="entity-list">
                  {data.items.map((row) => (
                    <li key={row.id}>
                      <div className="explore-result-copy">
                        <TextLink to={resultPath(row, season)}>
                          {row.entity.displayName || "Record name not supplied"}
                        </TextLink>
                        <div className="explore-result-meta">
                          <span className="explore-result-kind">
                            {kindLabel(row.kind)}
                          </span>
                          {row.context && (
                            <span className="explore-result-context">
                              {/^\d{4}$/.test(row.context)
                                ? `Season ${row.context}`
                                : row.context}
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <CollectionPages {...{ data, query, params, setParams }} />
              </div>
            ) : (
              <div className="explore-empty-state" role="status">
                <h3>
                  No {kind ? kindLabel(kind).toLowerCase() : "records"} match{" "}
                  “{q}”
                </h3>
                <p>
                  Try a different name, circuit, race or season, or search all
                  record types.
                </p>
                <Button variant="quiet" type="button" onClick={clearSearch}>
                  Clear search
                </Button>
              </div>
            )}
            <SourceNote meta={data?.meta} />
          </>
        )}
      </Panel>
      <Panel title="Browse another route">
        <nav className="explore-browse" aria-label="Browse archive routes">
          <ActionLink to={`/calendar?season=${season}`}>Find a race</ActionLink>
          <ActionLink to={`/standings?season=${season}&kind=drivers`}>
            Browse drivers
          </ActionLink>
          <ActionLink to={`/standings?season=${season}&kind=constructors`}>
            Browse constructors
          </ActionLink>
          <ActionLink to={`/explore?season=${season}&type=circuit`}>
            Search circuits
          </ActionLink>
          <ActionLink to={`/explore?season=${season}&type=event`}>
            Search events
          </ActionLink>
          <ActionLink to={`/explore?season=${season}&type=season`}>
            Search seasons
          </ActionLink>
        </nav>
        <p className="muted explore-browse-note">
          Use the calendar and standings for structured browsing, or narrow the
          search to a specific record type.
        </p>
      </Panel>
    </>
  );
}
