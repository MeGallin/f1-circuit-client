import { useParams, useSearchParams } from "react-router-dom";
import {
  useGetProfileQuery,
  useGetHistoryQuery,
  useGetProgressionQuery,
  useGetLayoutsQuery,
  useGetSeasonsQuery,
} from "../api/archiveApi";
import {
  PageHeading,
  Panel,
  Button,
  ActionLink,
  Select,
  Tabs,
  DataBoundary,
  EmptyState,
  SourceNote,
  DataTable,
  Metric,
  TextLink,
} from "../components/ui";
import {
  CollectionPages,
  changeFilters,
  refreshSelection,
} from "../features/entities/shared";
import {
  isScopedSeason,
  seasonOptionLabel,
} from "../features/season/selectors";
import { CircuitSilhouette, CountryFlag } from "../components/visuals";
import { RaceRecords } from "./RaceDetail";
import "../styles/entities.css";
export function HistoryRows({ kind, rows }) {
  if (kind === "circuit")
    return (
      <ul className="entity-list">
        {rows.map((row) => (
          <li key={row.id}>
            <TextLink
              to={`/events/${encodeURIComponent(row.id)}?season=${row.year}`}
            >
              {row.name}
            </TextLink>
            <span>
              {row.year} · Round {row.round ?? "Not supplied"} ·{" "}
              {row.schedule?.date ?? "Date not supplied"}
            </span>
          </li>
        ))}
      </ul>
    );
  return (
    <div>
      {rows.map((row) => (
        <section
          key={row.id}
          aria-label={`${row.entry?.drivers?.map((d) => d.displayName).join(" / ") || "Entry"} result`}
        >
          <RaceRecords rows={[row]} dataset="results" />
          <details className="entity-session">
            <summary>Session reference</summary>
            <p>{row.sessionId}</p>
          </details>
        </section>
      ))}
    </div>
  );
}
function History({
  kind,
  id,
  view,
  year,
  snapshotId,
  params,
  setParams,
  refreshProfile,
}) {
  const args = {
    kind,
    id,
    year: year || undefined,
    snapshotId,
    cursor: params.get("cursor") || undefined,
  };
  const history = useGetHistoryQuery(args, { skip: view !== "history" });
  const progression = useGetProgressionQuery(args, {
    skip: view !== "progression" || !year,
  });
  const layouts = useGetLayoutsQuery(args, { skip: view !== "layouts" });
  const query =
    view === "layouts"
      ? layouts
      : view === "progression"
        ? progression
        : history;
  const data = query.currentData;
  if (view === "progression" && !year)
    return (
      <EmptyState
        title="Choose a season"
        description="Championship progression is scoped to a single season."
      />
    );
  return (
    <>
      <DataBoundary
        query={query}
        empty={query.isSuccess && !data?.items.length}
        onRetry={() => {
          if (query.error?.status === 409) {
            refreshProfile();
          } else query.refetch();
        }}
      >
        {data &&
          (view === "history" ? (
            <HistoryRows kind={kind} rows={data.items} />
          ) : view === "progression" ? (
            <DataTable
              caption="Published championship progression"
              rows={data.items}
              columns={[
                { key: "round", label: "Round" },
                {
                  key: "rank",
                  label: "Rank",
                  render: (r) => r.rank ?? "Not supplied",
                },
                {
                  key: "points",
                  label: "Points",
                  render: (r) => r.points ?? "Not supplied",
                },
              ]}
            />
          ) : (
            <ul className="entity-list">
              {data.items.map((row) => (
                <li key={row.id}>
                  <div>
                    <h3>{row.name}</h3>
                    <CircuitSilhouette
                      layout={row}
                      circuitName={row.name || "Circuit"}
                      showFallback
                    />
                    <p>
                      {row.lengthMetres == null
                        ? "Length not supplied"
                        : `${row.lengthMetres} metres`}
                    </p>
                    <p>
                      {row.validFrom ?? "Start date not supplied"} —{" "}
                      {row.validTo ?? "End date not supplied"}
                    </p>
                    <p>
                      {row.attribution ?? "Attribution not supplied"} ·{" "}
                      {row.licence ?? "Licence not supplied"}
                    </p>
                    {row.assetUrl && /^https?:\/\//i.test(row.assetUrl) && (
                      <a href={row.assetUrl} target="_blank" rel="noreferrer">
                        View supplied layout asset
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ))}
      </DataBoundary>
      <SourceNote meta={data?.meta} />
      <CollectionPages {...{ data, query, params, setParams }} />
    </>
  );
}
export default function Profile({ kind }) {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const snapshotId = params.get("snapshot") || undefined;
  const profile = useGetProfileQuery({ kind, id, snapshotId });
  const seasons = useGetSeasonsQuery();
  const data = profile.currentData;
  const p = data?.profile;
  const views = [
    { value: "history", label: kind === "circuit" ? "Events" : "Results" },
    kind === "circuit"
      ? { value: "layouts", label: "Layouts" }
      : { value: "progression", label: "Championship progression" },
  ];
  const view = params.get("view") || "history";
  const year = params.get("season") || "";
  const validYear =
    !year ||
    (/^\d{4}$/.test(year) &&
      isScopedSeason(year) &&
      (!seasons.currentData ||
        seasons.currentData.items.some((s) => s.year === Number(year))));
  const validView = views.some((v) => v.value === view);
  const refresh = () => refreshSelection(params, setParams, profile);
  return (
    <div className="entity-stack">
      <PageHeading
        eyebrow={`${kind.toUpperCase()} PROFILE`}
        title={p?.entity.displayName || "Archive profile"}
        description="Published identity and historical records. Missing coverage is not a zero result."
        actions={
          <ActionLink
            to={`/explore?${new URLSearchParams({ season: year || "2024", type: kind })}`}
          >
            Explore profiles
          </ActionLink>
        }
      />
      <DataBoundary query={profile} onRetry={refresh}>
        {p ? (
          <Panel
            title="Profile details"
            action={
              <Button
                variant="quiet"
                disabled={profile.isFetching}
                onClick={refresh}
              >
                Refresh profile
              </Button>
            }
          >
            <div className="entity-identity">
              <CountryFlag
                country={kind === "driver" ? p.nationality : p.country}
                label={
                  kind === "driver" ? "Driver nationality" : "Circuit country"
                }
                showFallback
              />
              <div>
                <strong>{p.entity.displayName}</strong>
                <span>
                  {kind === "driver"
                    ? p.nationality
                    : p.country || "Country not supplied"}
                </span>
              </div>
            </div>
            <dl className="entity-facts">
              {(kind === "driver"
                ? [
                    ["Nationality", p.nationality],
                    ["Date of birth", p.birthDate],
                  ]
                : kind === "constructor"
                  ? [
                      ["Nationality", p.nationality],
                      ["Country", p.country],
                    ]
                  : [
                      ["Country", p.country],
                      ["Latitude", p.latitude],
                      ["Longitude", p.longitude],
                    ]
              ).map(([key, value]) => (
                <div key={key}>
                  <dt>{key}</dt>
                  <dd>{value ?? "Not supplied"}</dd>
                </div>
              ))}
            </dl>
            {p.aliases.length > 0 && (
              <p>Also known as: {p.aliases.join(", ")}</p>
            )}
            {p.metrics.length ? (
              <div className="entity-facts">
                {p.metrics.map((m) => (
                  <Metric
                    key={m.id}
                    label={m.key}
                    value={m.value ?? "Not supplied"}
                    detail={`${m.unit} · ${m.scope} · ${m.coverage} coverage`}
                  />
                ))}
              </div>
            ) : (
              <p className="muted">
                Career metrics are not supplied. No totals have been inferred
                from partial records.
              </p>
            )}
            <ActionLink
              to={`/compare?${new URLSearchParams({ kind, leftId: id, leftName: p.entity.displayName, ...(year ? { season: year, fromYear: year, toYear: year } : {}) })}`}
            >
              Compare {kind === "constructor" ? "constructors" : `${kind}s`}
            </ActionLink>
            <SourceNote meta={data.meta} />
          </Panel>
        ) : (
          profile.isSuccess && <EmptyState title="Profile unavailable" />
        )}
      </DataBoundary>
      {p && (
        <Panel title="Historical archive">
          <DataBoundary query={seasons}>
            {seasons.currentData && (
              <Select
                label="History season"
                value={year}
                options={[
                  { value: "", label: "All imported seasons" },
                  ...seasons.currentData.items
                    .filter((s) => isScopedSeason(s.year))
                    .map((s) => ({
                      value: String(s.year),
                      label: seasonOptionLabel(s),
                    })),
                  ...(!validYear
                    ? [{ value: year, label: "Invalid season" }]
                    : []),
                ]}
                onChange={(e) =>
                  setParams(changeFilters(params, { season: e.target.value }))
                }
              />
            )}
          </DataBoundary>
          {!validYear || !validView ? (
            <EmptyState
              title="Invalid archive selection"
              description="Choose a listed season and a supported history view."
              action={
                <Button
                  onClick={() =>
                    setParams(
                      changeFilters(params, { season: null, view: null }),
                    )
                  }
                >
                  Reset selection
                </Button>
              }
            />
          ) : (
            <Tabs
              label="Profile history"
              items={views}
              value={view}
              onChange={(value) =>
                setParams(changeFilters(params, { view: value }))
              }
            >
              <p className="muted">
                {view === "history" && kind !== "circuit"
                  ? "Each result is a published entry classification. The provider does not supply event labels in this history endpoint; session references are available with each record."
                  : "Only published records are shown. Gaps in coverage are not filled or estimated."}
              </p>
              <History
                refreshProfile={refresh}
                kind={kind}
                id={id}
                view={view}
                year={year ? Number(year) : undefined}
                snapshotId={snapshotId || data.meta.snapshotId}
                params={params}
                setParams={setParams}
              />
            </Tabs>
          )}
        </Panel>
      )}
    </div>
  );
}
