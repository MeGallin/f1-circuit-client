import { EntityLink } from "../features/entities/shared";
import { useState } from "react";
import { TitleScenariosDialog } from "../features/season/TitleScenariosDialog";
import { ConstructorIdentities } from "../components/ConstructorIdentity";
import useSeasonSearch from "../features/season/useSeasonSearch";
import { useDispatch } from "react-redux";
import {
  RankingIcon,
  ArrowClockwiseIcon,
  TrophyIcon,
} from "@phosphor-icons/react";
import { APEX_SIZES } from "../design-system/apex.tokens";
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
  PanelBody,
  Metric,
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
import "../design-system/standings-context.css";
import SeasonUnavailable from "../features/season/SeasonUnavailable";
import { dateLabel, standingCutoff } from "../features/season/selectors";

const kinds = [
  { value: "drivers", label: "Drivers" },
  { value: "constructors", label: "Constructors" },
];
function podiumDescription(coverage) {
  if (!coverage || coverage.coverage === "unavailable")
    return "Podium evidence unavailable";
  return `${coverage.verifiedRaces} of ${coverage.expectedRaces} races have all three podium positions verified. ${coverage.coverage === "partial" ? "Counts are observed only; missing evidence can increase them." : "All podium positions in this scope are present in the published results."}`;
}
export function validRound(value) {
  return (
    value == null ||
    (/^[1-9]\d*$/.test(value) && Number.isSafeInteger(Number(value)))
  );
}
export function StandingOutlookControl({ outlook, kind = "drivers" }) {
  const [scenariosOpen, setScenariosOpen] = useState(false);
  if (!outlook) return null;
  return (
    <>
      <Button
        variant="secondary"
        className="standing-outlook-trigger"
        onClick={() => setScenariosOpen(true)}
      >
        <TrophyIcon aria-hidden size={APEX_SIZES.icon} />
        Title outlook
      </Button>
      {scenariosOpen && (
        <TitleScenariosDialog
          outlook={outlook}
          kind={kind}
          onClose={() => setScenariosOpen(false)}
        />
      )}
    </>
  );
}
export function StandingTitleOutlook({ outlook }) {
  if (!outlook) return null;
  const available = outlook.coverage === "conditional";
  return (
    <section className="standing-title-outlook" aria-label="Title outlook">
      <PanelBody className="standing-title-layout">
        <div className="standing-title-heading">
          <h3 className="eyebrow">Championship leader</h3>
          <p className="standing-title-leader">
            {outlook.leaderName || "Published leader unavailable"}
          </p>
          {!available && (
            <p className="standing-title-unavailable">
              {outlook.reasonCode === "SCORING_PROFILE_UNAVAILABLE"
                ? "Verified scoring profile not available for this season."
                : "Title outlook unavailable."}
            </p>
          )}
        </div>
        <Metric
          label="Maximum points remaining"
          value={outlook.remainingMaximum}
        />
        <Metric
          label="Safe target (not minimum)"
          value={outlook.sufficientAdditional}
        />
      </PanelBody>
    </section>
  );
}
export function StandingCalculationDetails({ data, kind }) {
  const outlook = data?.titleOutlook;
  const podium = data?.items?.[0]?.podiumCoverage;
  return (
    <details className="standing-publication-details">
      <summary>Calculation and source details</summary>
      {outlook && (
        <>
          <p>
            Title outlook · {outlook.year}
            {outlook.round != null ? ` after round ${outlook.round}` : ""}.
          </p>
          {outlook.coverage === "conditional" && (
            <>
              <p>
                {outlook.remainingRaces} races · {outlook.remainingSprints}{" "}
                sprints · maximum per{" "}
                {kind === "constructors" ? "team" : "driver"}.
              </p>
              <p>
                Additional points sufficient to guarantee the title under these
                assumptions; not the exact minimum. Ties are not resolved.
              </p>
            </>
          )}
          {outlook.targetWithinAvailablePoints === false && (
            <p>
              Conservative target exceeds points available. Minimum winning
              requirement not calculated.
            </p>
          )}
          {outlook.assumptions?.map((assumption) => (
            <p key={assumption}>{assumption}</p>
          ))}
          {outlook.sourceUrls?.map((url, index) => (
            <p key={url}>
              <a href={url} target="_blank" rel="noreferrer">
                Rule source {index + 1}
              </a>
            </p>
          ))}
        </>
      )}
      {podium && (
        <p>
          Podiums are calculated from published final race results
          {podium.throughRound != null
            ? ` through round ${podium.throughRound}`
            : ""}
          . {podiumDescription(podium)} Sprint and qualifying results are
          excluded. Constructor totals count each podium car. Overall source
          coverage may remain partial even when every podium position is
          verified.
        </p>
      )}
      <p>
        Driver and constructor rankings, with the source behind every point.
        Missing round data is never replaced by the latest standings. Points and
        ranks are shown exactly as supplied.
      </p>
      <SourceNote meta={data?.meta} collapsible={false} />
    </details>
  );
}
export function StandingRows({ rows, kind, year }) {
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
                season={year}
                number={row.number}
              />
            </strong>
            {kind === "drivers" && (
              <p>
                <ConstructorIdentities
                  constructors={row.constructors}
                  year={year}
                />
              </p>
            )}
          </div>
          <dl className="standing-stats">
            <div>
              <dt>Points</dt>
              <dd>{row.points ?? "Not supplied"}</dd>
            </div>
            <div>
              <dt title="Gap to leader">
                Gap<span className="sr-only"> to leader</span>
              </dt>
              <dd>{row.gapToLeader ?? "Not supplied"}</dd>
            </div>
            <div>
              <dt>Wins</dt>
              <dd>{row.wins ?? "Not supplied"}</dd>
            </div>
            <div>
              <dt>Podiums</dt>
              <dd>
                {row.podiums ?? "Not supplied"}
                {row.podiums != null &&
                row.podiumCoverage?.coverage === "partial"
                  ? " observed"
                  : ""}
              </dd>
            </div>
          </dl>
        </li>
      ))}
    </ol>
  );
}
function Championship({ year, kind, params, setParams, seasonOptions }) {
  const dispatch = useDispatch();
  const round = params.get("round");
  const query = useGetStandingsQuery(
    {
      year,
      kind,
      round: round || undefined,
      cursor: params.get("cursor") || undefined,
      snapshotId: params.get("snapshot") || undefined,
      standingSnapshotId:
        params.get("standingSnapshotId") ||
        params.get("standingSnapshot") ||
        undefined,
    },
    { skip: !validRound(round) },
  );
  const data = query.currentData;
  const publication =
    data?.meta.snapshotId || params.get("snapshot") || undefined;
  const calendar = useGetCalendarQuery({ year, snapshotId: publication });
  const calendarMatches =
    !publication || calendar.currentData?.meta.snapshotId === publication;
  const calendarEvents = calendarMatches
    ? calendar.currentData?.items || []
    : [];
  const hasEventStatuses = calendarEvents.some((event) => event.status);
  const rounds = [
    ...new Set(
      calendarEvents
        .map((event) => event.round)
        .filter(
          (value, index) =>
            value != null &&
            (!hasEventStatuses ||
              calendarEvents[index]?.status === "completed"),
        )
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
    next.delete("standingSnapshotId");
    setParams(next);
    dispatch(archiveApi.util.invalidateTags([{ type: "Season", id: year }]));
  };
  return (
    <>
      <div
        className="standing-context"
        role="group"
        aria-label="Standings context"
      >
        <div className="standing-toolbar">
          <Select
            label="Season"
            value={String(year)}
            options={seasonOptions}
            onChange={(event) =>
              setParams({ season: event.target.value, kind })
            }
          />
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
            className="standing-refresh"
            aria-label="Refresh standings"
            disabled={query.isFetching || !validRound(round)}
            onClick={restart}
          >
            <ArrowClockwiseIcon size="1em" aria-hidden />
            <span>Refresh standings</span>
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
        {(() => {
          const cutoff = standingCutoff({
            standingSnapshotId:
              data?.items?.[0]?.standingSnapshotId ||
              (round ? `standing:${year}:${round}` : null),
            events: calendarEvents,
          });
          return (
            <div className="standing-context-note">
              <p className="standing-note">
                {cutoff.eventName
                  ? `Standings after ${cutoff.eventName}${cutoff.date ? ` · ${dateLabel(cutoff.date)}` : ""}`
                  : round
                    ? `Standings after round ${round}`
                    : data?.titleOutlook?.round != null
                      ? `Standings after round ${data.titleOutlook.round}`
                      : "Latest published standings in this archive"}{" "}
                · {year}.
              </p>
              <StandingOutlookControl
                outlook={data?.titleOutlook}
                kind={kind}
              />
            </div>
          );
        })()}
      </div>
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
          {data && (
            <>
              <StandingTitleOutlook outlook={data.titleOutlook} kind={kind} />
              <StandingRows rows={data.items} kind={kind} year={year} />
            </>
          )}
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
      <StandingCalculationDetails data={data} kind={kind} />
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
    <div className="standing-page">
      <PageHeading
        eyebrow="THE CHAMPIONSHIP PICTURE"
        title="Season standings"
        icon={RankingIcon}
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
              <Panel title="Championship standings" icon={RankingIcon}>
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
                      seasonOptions={options}
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
    </div>
  );
}
