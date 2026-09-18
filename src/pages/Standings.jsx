import { EntityLink } from "../features/entities/shared";
import useSeasonSearch from "../features/season/useSeasonSearch";
import { useDispatch } from "react-redux";
import {
  archiveApi,
  useGetSeasonsQuery,
  useGetCalendarQuery,
  useGetStandingsQuery,
} from "../api/archiveApi";
import {
  selectedSeason,
  selectSeasonOptions,
} from "../features/season/selectors";
import {
  PageHeading,
  Panel,
  Select,
  Tabs,
  Button,
  DataBoundary,
  EmptyState,
  SourceNote,
  Skeleton,
  ErrorState,
} from "../components/ui";
import "../styles/standings.css";
import SeasonUnavailable from "../features/season/SeasonUnavailable";

const kinds = [
  { value: "drivers", label: "Drivers" },
  { value: "constructors", label: "Constructors" },
];
export function validRound(value) {
  return (
    value == null ||
    (/^[1-9]\d*$/.test(value) && Number.isSafeInteger(Number(value)))
  );
}
export function StandingRows({ rows, kind }) {
  return (
    <ol
      className="standing-rows"
      aria-label={`${kind === "drivers" ? "Driver" : "Constructor"} standings`}
    >
      {rows.map((row) => (
        <li key={row.id}>
          <div className="standing-rank">
            <span>Rank</span>
            <strong>{row.rank ?? "Not supplied"}</strong>
          </div>
          <div className="standing-name">
            <strong>
              <EntityLink
                entity={row.entity}
                kind={kind === "drivers" ? "driver" : "constructor"}
              />
            </strong>
            {kind === "drivers" && (
              <p>
                {row.constructors.length
                  ? row.constructors.map((team) => team.displayName).join(" / ")
                  : "Constructor not supplied"}
              </p>
            )}
          </div>
          <dl className="standing-stats">
            <div>
              <dt>Points</dt>
              <dd>{row.points ?? "Not supplied"}</dd>
            </div>
            <div>
              <dt>Wins</dt>
              <dd>{row.wins ?? "Not supplied"}</dd>
            </div>
            <div>
              <dt>Podiums</dt>
              <dd>{row.podiums ?? "Not supplied"}</dd>
            </div>
          </dl>
        </li>
      ))}
    </ol>
  );
}
function Championship({ year, kind, params, setParams }) {
  const dispatch = useDispatch();
  const round = params.get("round");
  const calendar = useGetCalendarQuery({ year });
  const query = useGetStandingsQuery(
    {
      year,
      kind,
      round: round || undefined,
      cursor: params.get("cursor") || undefined,
      snapshotId: params.get("snapshot") || undefined,
      standingSnapshotId: params.get("standingSnapshot") || undefined,
    },
    { skip: !validRound(round) },
  );
  const data = query.currentData;
  const rounds = [
    ...new Set(
      (calendar.currentData?.items || [])
        .map((event) => event.round)
        .filter((value) => value != null),
    ),
  ].sort((a, b) => a - b);
  const updateRound = (value) =>
    setParams({
      season: String(year),
      kind,
      ...(value ? { round: value } : {}),
    });
  const restart = () => {
    const next = new URLSearchParams(params);
    next.delete("cursor");
    next.delete("snapshot");
    next.delete("standingSnapshot");
    setParams(next);
    dispatch(archiveApi.util.invalidateTags([{ type: "Season", id: year }]));
  };
  return (
    <>
      <div className="standing-toolbar">
        <Select
          label="Standings after"
          value={round || ""}
          options={[
            { value: "", label: "Latest published" },
            ...(round && !rounds.includes(Number(round))
              ? [{ value: round, label: `Requested round ${round}` }]
              : []),
            ...rounds.map((value) => ({
              value: String(value),
              label: `Round ${value}`,
            })),
          ]}
          onChange={(event) => updateRound(event.target.value)}
        />
        <Button
          variant="quiet"
          disabled={query.isFetching || !validRound(round)}
          onClick={restart}
        >
          Refresh standings
        </Button>
      </div>
      {calendar.isError && (
        <p className="standing-note">
          Calendar round choices are temporarily unavailable. Your standings
          selection is preserved.{" "}
          <Button variant="quiet" onClick={calendar.refetch}>
            Retry round choices
          </Button>
        </p>
      )}
      <p className="standing-note">
        {round
          ? `After round ${round}`
          : "Latest published standings in this archive"}{" "}
        · {year}. Missing round data is never replaced by the latest standings.
        Points and ranks are shown exactly as supplied.
      </p>
      <SourceNote meta={data?.meta} />
      {!validRound(round) ? (
        <EmptyState
          title="Invalid round selection"
          description="Choose latest published or a round from the calendar."
        />
      ) : (
        <DataBoundary
          query={query}
          empty={query.isSuccess && !data?.items.length}
          onRetry={query.error?.status === 409 ? restart : query.refetch}
        >
          {data && <StandingRows rows={data.items} kind={kind} />}
        </DataBoundary>
      )}
      {data && (
        <nav className="standing-pagination" aria-label="Standings pages">
          <Button
            variant="quiet"
            disabled={!params.has("cursor") || query.isFetching}
            onClick={() => {
              const next = new URLSearchParams(params);
              next.delete("cursor");
              setParams(next);
            }}
          >
            First page
          </Button>
          <span>
            {data.items.length} shown · {data.page.total ?? "Unknown total"}{" "}
            records
          </span>
          <Button
            disabled={!data.page.hasMore || query.isFetching}
            onClick={() => {
              const next = new URLSearchParams(params);
              next.set("season", String(year));
              next.set("kind", kind);
              next.set("cursor", data.page.nextCursor);
              next.set("snapshot", data.meta.snapshotId);
              setParams(next);
            }}
          >
            Next page
          </Button>
        </nav>
      )}
    </>
  );
}
export default function Standings() {
  const [params, setParams] = useSeasonSearch();
  const review = import.meta.env.DEV ? params.get("reviewState") : null;
  const simulated =
    import.meta.env.DEV && ["loading", "empty", "error"].includes(review);
  const catalogue = useGetSeasonsQuery(undefined, { skip: simulated });
  const year = selectedSeason(
    catalogue.currentData?.items,
    params.get("season"),
  );
  const options = selectSeasonOptions(catalogue.currentData);
  const kind = params.get("kind") || "drivers";
  const validKind = kinds.some((item) => item.value === kind);
  const exitReview = () => {
    const next = new URLSearchParams(params);
    next.delete("reviewState");
    setParams(next);
  };
  return (
    <>
      <PageHeading
        eyebrow="THE CHAMPIONSHIP PICTURE"
        title="Season standings"
        description="Driver and constructor rankings, with the source behind every point."
        actions={
          options.length > 0 && (
            <Select
              label="Season"
              value={year ? String(year) : ""}
              options={
                year
                  ? options
                  : [{ value: "", label: "Choose a season" }, ...options]
              }
              onChange={(event) =>
                setParams({
                  season: event.target.value,
                  kind: validKind ? kind : "drivers",
                })
              }
            />
          )
        }
      />
      {simulated ? (
        <Panel title="Development state review">
          <p className="standing-note">
            State simulation only. No standings or actual service failure are
            represented.
          </p>
          {review === "loading" ? (
            <Skeleton />
          ) : review === "error" ? (
            <ErrorState onRetry={exitReview} />
          ) : (
            <EmptyState />
          )}
          <Button variant="quiet" onClick={exitReview}>
            Return to real data
          </Button>
        </Panel>
      ) : (
        <DataBoundary query={catalogue}>
          {catalogue.currentData &&
            (!year ||
            !catalogue.currentData.items.some(
              (season) => season.year === year,
            ) ? (
              <SeasonUnavailable
                year={year}
                seasons={catalogue.currentData.items}
              />
            ) : (
              <Panel title="Championship standings">
                <Tabs
                  label="Championship type"
                  items={kinds}
                  value={validKind ? kind : "drivers"}
                  onChange={(value) =>
                    setParams({
                      season: String(year),
                      kind: value,
                      ...(params.has("round")
                        ? { round: params.get("round") }
                        : {}),
                    })
                  }
                >
                  {validKind ? (
                    <Championship
                      key={`${year}:${kind}`}
                      year={year}
                      kind={kind}
                      params={params}
                      setParams={setParams}
                    />
                  ) : (
                    <EmptyState
                      title="Unknown championship selection"
                      description="Choose Drivers or Constructors above."
                    />
                  )}
                </Tabs>
              </Panel>
            ))}
        </DataBoundary>
      )}
    </>
  );
}
