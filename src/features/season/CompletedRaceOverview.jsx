import { useState } from "react";
import {
  useGetEventQuery,
  useGetStandingsQuery,
  useGetOverviewCollectionQuery,
} from "../../api/archiveApi";
import {
  ActionLink,
  Button,
  DataBoundary,
  DataTable,
  EmptyState,
  SourceNote,
} from "../../components/ui";
import { ConstructorIdentity } from "../../components/ConstructorIdentity";
import { DriverIdentity } from "../../components/DriverIdentity";
import { RaceFocus, RacePodium, LeaderList } from "./RaceSummary";
import { entryName } from "./raceFormat";
import { ChampionshipGraphics } from "./ChampionshipGraphics";

function championshipContext(summary) {
  const year = summary?.season?.year;
  const match =
    Number.isSafeInteger(year) &&
    new RegExp(`^standing:${year}:([1-9]\\d*)$`).exec(
      summary.standingSnapshotId || "",
    );
  const round =
    match && Number.isSafeInteger(Number(match[1])) ? match[1] : null;
  return {
    year,
    round,
    standingSnapshotId: round ? summary.standingSnapshotId : null,
  };
}

function RaceResultsExpansion({
  sessionId,
  year,
  snapshotId,
  onSnapshotReset,
}) {
  const query = useGetOverviewCollectionQuery(
    { kind: "results", sessionId, snapshotId },
    { skip: !sessionId },
  );
  const data = query.currentData;
  const rows = data?.items || [];
  const valid =
    data?.meta?.snapshotId === snapshotId &&
    rows.every((row) => row.sessionId === sessionId);
  return (
    <section
      id="home-more-results"
      className="home-expanded home-expanded--results"
      aria-label="Full race results"
    >
      <h3>Full race results</h3>
      {!sessionId ? (
        <EmptyState title="Published context not supplied" />
      ) : (
        <DataBoundary
          query={query}
          onRetry={
            query.error?.status === 409 ? onSnapshotReset : query.refetch
          }
        >
          {!valid || data?.meta.coverage === "unavailable" || !rows.length ? (
            <EmptyState title="Published records not available" />
          ) : (
            <DataTable
              caption="Published race classification"
              rows={rows}
              columns={[
                {
                  key: "position",
                  label: "Position",
                  numeric: true,
                  render: (row) => row.position ?? "Not supplied",
                },
                {
                  key: "driver",
                  label: "Driver",
                  rowHeader: true,
                  stickyIdentity: true,
                  render: (row) => (
                    <>
                      <DriverIdentity
                        inline
                        stackOnMobile
                        presentation="record"
                        number={row.entry?.number}
                        name={entryName(row.entry)}
                      />
                    </>
                  ),
                },
                {
                  key: "constructor",
                  label: "Constructor",
                  render: (row) => (
                    <ConstructorIdentity
                      constructor={row.entry?.constructor}
                      year={year}
                    />
                  ),
                },
                {
                  key: "status",
                  label: "Status",
                  render: (row) => row.status || "Not supplied",
                },
                {
                  key: "points",
                  label: "Points",
                  numeric: true,
                  render: (row) => row.points ?? "Not supplied",
                },
              ]}
            />
          )}
          <SourceNote meta={data?.meta} />
        </DataBoundary>
      )}
    </section>
  );
}
function ChampionshipPanel({ kind, summary, snapshotId, onSnapshotReset }) {
  const { year, round, standingSnapshotId } = championshipContext(summary);
  const query = useGetStandingsQuery(
    { year, kind, standingSnapshotId, snapshotId },
    { skip: !standingSnapshotId },
  );
  const suppliedRows = query.currentData?.items || [];
  const rows =
    query.currentData?.meta?.snapshotId === snapshotId &&
    ["complete", "partial"].includes(query.currentData?.meta?.coverage) &&
    suppliedRows.every((row) => row.standingSnapshotId === standingSnapshotId)
      ? suppliedRows.slice(0, 3)
      : [];
  const title =
    kind === "drivers" ? "Drivers’ championship" : "Constructors’ championship";
  const href = new URLSearchParams({
    season: String(year),
    kind,
    ...(snapshotId ? { snapshot: snapshotId } : {}),
    ...(standingSnapshotId ? { standingSnapshotId, round } : {}),
  });
  return (
    <section
      className={`home-championship home-championship--${kind}`}
      aria-label={title}
    >
      <h3 className="eyebrow">{title}</h3>
      <p className="muted">
        Top 3
        {round ? ` after Round ${round}` : " · published round not supplied"}
      </p>
      <div className="home-championship-records">
        {!standingSnapshotId ? (
          <EmptyState title="Standings context not supplied" />
        ) : (
          <DataBoundary
            query={query}
            onRetry={
              query.error?.status === 409 ? onSnapshotReset : query.refetch
            }
          >
            {rows.length ? (
              <LeaderList
                entries={rows}
                kind={kind}
                year={year}
                sharedIdentity
              />
            ) : (
              <EmptyState title="Standings not available" />
            )}
          </DataBoundary>
        )}
      </div>
      <ChampionshipGraphics
        kind={kind}
        rows={rows}
        year={year}
        round={round}
        standingSnapshotId={standingSnapshotId}
        snapshotId={snapshotId}
        onSnapshotReset={onSnapshotReset}
      />
      <div className="home-panel-link">
        <ActionLink to={`/standings?${href}`}>View standings</ActionLink>
      </div>
    </section>
  );
}
export function CompletedRaceOverview({
  summary,
  snapshotId,
  onSnapshotReset,
}) {
  const [resultsExpanded, setResultsExpanded] = useState(false);
  const event = summary.latestCompletedEvent;
  const query = useGetEventQuery(
    { eventId: event?.id, snapshotId },
    { skip: !event?.id },
  );
  const detail =
    Boolean(snapshotId) &&
    query.currentData?.meta?.snapshotId === snapshotId &&
    ["complete", "partial"].includes(query.currentData?.meta?.coverage) &&
    query.currentData?.detail?.event?.id === event?.id
      ? query.currentData.detail
      : null;
  const session = detail?.sessions?.find(
    (item) => item.kind === "race" && item.eventId === event?.id,
  );
  return (
    <section
      className="home-completed-race"
      aria-label="Completed race and championship"
    >
      <div
        className={`home-summary-panels${resultsExpanded ? " home-summary-panels--expanded-results" : ""}`}
      >
        <section className="home-race-result" aria-label="Race result">
          {event ? (
            <RaceFocus
              headerOnly
              compact
              className="home-completed-header"
              includeSeasonProgress={false}
              showCalendarAction={false}
              summary={summary}
              snapshotId={snapshotId}
            />
          ) : (
            <EmptyState title="No completed race published" />
          )}
          <RacePodium
            aligned
            nationalityFlags
            snapshotId={snapshotId}
            detail={detail}
            isFetching={query.isFetching}
            isError={query.isError}
            year={event?.year}
            headerAction={
              event ? (
                <Button
                  variant="secondary"
                  disabled={!session?.id}
                  aria-expanded={resultsExpanded}
                  aria-controls="home-more-results"
                  onClick={() => setResultsExpanded((previous) => !previous)}
                >
                  {resultsExpanded ? "Show less" : "Show full results"}
                </Button>
              ) : null
            }
          />
          {event && !session?.id && (
            <p className="muted" role="status">
              {query.isLoading || query.isFetching
                ? "Loading published race context…"
                : "Published race session not supplied."}
            </p>
          )}
        </section>
        {resultsExpanded && (
          <RaceResultsExpansion
            sessionId={session?.id}
            year={event?.year}
            snapshotId={snapshotId}
            onSnapshotReset={onSnapshotReset}
          />
        )}
        <ChampionshipPanel
          onSnapshotReset={onSnapshotReset}
          kind="drivers"
          summary={summary}
          snapshotId={snapshotId}
        />
        <ChampionshipPanel
          onSnapshotReset={onSnapshotReset}
          kind="constructors"
          summary={summary}
          snapshotId={snapshotId}
        />
      </div>
    </section>
  );
}
