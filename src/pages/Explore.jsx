import { useSearchParams } from "react-router-dom";
import { useSearchEntitiesQuery } from "../api/archiveApi";
import {
  PageHeading,
  Panel,
  Input,
  Select,
  Button,
  ActionLink,
  TextLink,
  DataBoundary,
  EmptyState,
  SourceNote,
} from "../components/ui";
import {
  entityPath,
  changeFilters,
  CollectionPages,
  refreshSelection,
} from "../features/entities/shared";
import { runtimeYear } from "../features/season/selectors";
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
export default function Explore() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const kind = params.get("type") || "";
  const season = params.get("season") || String(runtimeYear());
  const valid =
    q.trim().length >= 2 &&
    q.length <= 100 &&
    searchKinds.some((k) => k.value === kind);
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
  return (
    <>
      <PageHeading
        eyebrow="EXPLORE THE ARCHIVE"
        title="People, teams & places"
        description="Find published profiles, race history and circuits. Search covers imported records, not every participant in Formula 1 history."
        actions={
          <ActionLink
            to={`/compare?${new URLSearchParams({ season: params.get("season") || "2024" })}`}
          >
            Compare records
          </ActionLink>
        }
      />
      <Panel title="Browse by task">
        <div className="explore-browse">
          <ActionLink to={`/calendar?season=${season}`}>
            Find a race
          </ActionLink>
          <ActionLink to={`/standings?season=${season}&kind=drivers`}>
            Browse drivers
          </ActionLink>
          <ActionLink to={`/standings?season=${season}&kind=constructors`}>
            Browse constructors
          </ActionLink>
        </div>
        <p className="muted">
          Start with the season view, then open a published profile or race
          detail for the evidence behind each record.
        </p>
      </Panel>
      <Panel title="Search the archive">
        <form
          key={`${q}:${kind}`}
          className="entity-filters"
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
            label="Name or season"
            name="q"
            defaultValue={q}
            required
            minLength={2}
            maxLength={100}
            placeholder="Try Hamilton or Silverstone"
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
          <EmptyState
            title="Find a record"
            description="Enter at least two characters and choose a record type, or search across the archive."
          />
        ) : (
          <DataBoundary
            query={query}
            onRetry={() => refreshSelection(params, setParams, query)}
            empty={query.isSuccess && !data?.items.length}
          >
            <ul className="entity-list">
              {data?.items.map((row) => {
                const path =
                  entityPath(row.kind, row.entity.id, params.get("season")) ||
                  (row.kind === "season"
                    ? `/?season=${encodeURIComponent(row.entity.displayName)}`
                    : `/events/${encodeURIComponent(row.entity.id)}${row.context && /^\d{4}$/.test(row.context) ? `?season=${row.context}` : ""}`);
                return (
                  <li key={row.id}>
                    <TextLink to={path}>{row.entity.displayName}</TextLink>
                    <span className="muted">
                      {row.kind}
                      {row.context ? ` · ${row.context}` : ""}
                    </span>
                  </li>
                );
              })}
            </ul>
            <CollectionPages {...{ data, query, params, setParams }} />
          </DataBoundary>
        )}
        <SourceNote meta={data?.meta} />
      </Panel>
    </>
  );
}
