import { EntityLink } from "../features/entities/shared";
import { useParams, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  archiveApi,
  useGetEventQuery,
  useGetSessionDataQuery,
} from "../api/archiveApi";
import {
  PageHeading,
  Panel,
  Metric,
  SourceNote,
  DataBoundary,
  EmptyState,
  ErrorState,
  Skeleton,
  Button,
  ActionLink,
  Select,
  Tabs,
} from "../components/ui";
import { dateLabel } from "../features/season/selectors";
import {
  duration,
  entryName,
  gapLabel,
  gridLabel,
  missing,
} from "../features/season/raceFormat";
import "../styles/race.css";

const views = [
  { value: "results", label: "Results" },
  { value: "qualifying", label: "Qualifying" },
  { value: "laps", label: "Laps" },
  { value: "pit-stops", label: "Pit stops" },
];
function Facts({ items }) {
  return (
    <dl className="race-facts">
      {items.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value ?? missing}</dd>
        </div>
      ))}
    </dl>
  );
}
export function RaceRecords({ rows, dataset, names = {} }) {
  return (
    <ol className="race-records">
      {rows.map((row) => (
        <li key={row.id}>
          <div className="race-record-heading">
            <strong>
              {row.entry
                ? row.entry.drivers.map((driver, index) => (
                    <span key={driver.id}>
                      {index > 0 ? " / " : ""}
                      <EntityLink entity={driver} kind="driver" />
                    </span>
                  ))
                : names[row.entryId] || "Driver name not supplied"}
            </strong>
            <span>
              {(row.entry?.constructor ? (
                <EntityLink entity={row.entry.constructor} kind="constructor" />
              ) : null) || (row.entry ? "Constructor not supplied" : "")}
            </span>
          </div>
          {dataset === "results" && (
            <Facts
              items={[
                ["Position", row.position],
                ["Grid", gridLabel(row.grid)],
                ["Status", row.statusLabel],
                ["Laps", row.lapsCompleted],
                ["Points", row.points],
                ["Gap", gapLabel(row.gap)],
                ["Elapsed", duration(row.elapsedMs)],
                ["Fastest lap", duration(row.fastestLap?.durationMs)],
                ["Fastest lap number", row.fastestLap?.lapNumber],
                ["Fastest lap rank", row.fastestLap?.rank],
              ]}
            />
          )}
          {dataset === "qualifying" && (
            <Facts
              items={[
                ["Position", row.position],
                ...row.phases.map((phase) => [
                  phase.label,
                  `${duration(phase.bestTimeMs)} · ${phase.participation.replaceAll("-", " ")}`,
                ]),
              ]}
            />
          )}
          {dataset === "laps" && (
            <Facts
              items={[
                ["Lap", row.lapNumber],
                ["Time", duration(row.durationMs)],
                ["Validity", row.validity],
                [
                  "Pit in",
                  row.isPitInLap == null
                    ? missing
                    : row.isPitInLap
                      ? "Yes"
                      : "No",
                ],
                [
                  "Pit out",
                  row.isPitOutLap == null
                    ? missing
                    : row.isPitOutLap
                      ? "Yes"
                      : "No",
                ],
                ...row.sectors.map((sector) => [
                  `Sector ${sector.index}`,
                  duration(sector.durationMs),
                ]),
              ]}
            />
          )}
          {dataset === "pit-stops" && (
            <Facts
              items={[
                ["Stop", row.sequence],
                ["Lap", row.lap],
                ["Pit lane duration", duration(row.laneDurationMs)],
                ["Stationary duration", duration(row.stationaryDurationMs)],
              ]}
            />
          )}
        </li>
      ))}
    </ol>
  );
}
function SessionData({
  session,
  dataset,
  snapshotId,
  params,
  setParams,
  onSnapshotReset,
}) {
  const cursor = params.get("cursor") || undefined;
  const query = useGetSessionDataQuery({
    sessionId: session.id,
    dataset,
    snapshotId,
    cursor,
  });
  const identities = useGetSessionDataQuery(
    { sessionId: session.id, dataset: "results", snapshotId, limit: 200 },
    { skip: !["laps", "pit-stops"].includes(dataset) },
  );
  const names = Object.fromEntries(
    (identities.currentData?.items || []).map((row) => [
      row.entry.id,
      entryName(row.entry),
    ]),
  );
  const data = query.currentData;
  const first = () => {
    const next = new URLSearchParams(params);
    next.delete("cursor");
    setParams(next);
  };
  const nextPage = () => {
    const next = new URLSearchParams(params);
    next.set("cursor", data.page.nextCursor);
    next.set("snapshot", data.meta.snapshotId);
    next.set("session", session.id);
    next.set("view", dataset);
    setParams(next);
  };
  return (
    <>
      <p className="race-note">
        {session.label} · {dateLabel(session.schedule.date)} ·{" "}
        {session.status === "unknown" ? "Status not supplied" : session.status}
      </p>
      <SourceNote meta={data?.meta} />
      <DataBoundary
        query={query}
        empty={query.isSuccess && !data?.items.length}
        onRetry={query.error?.status === 409 ? onSnapshotReset : query.refetch}
      >
        {data && (
          <RaceRecords rows={data.items} dataset={dataset} names={names} />
        )}
      </DataBoundary>
      {data && (
        <nav className="race-pagination" aria-label="Session data pages">
          <Button
            variant="quiet"
            disabled={!cursor || query.isFetching}
            onClick={first}
          >
            First page
          </Button>
          <span>
            {data.items.length} shown · {data.page.total ?? "Unknown total"}{" "}
            records
          </span>
          <Button
            disabled={!data.page.hasMore || query.isFetching}
            onClick={nextPage}
          >
            Next page
          </Button>
        </nav>
      )}
    </>
  );
}

function Detail({ data, params, setParams, refresh }) {
  const { detail, meta } = data;
  const { event, sessions } = detail;
  const fastestEntries = useGetSessionDataQuery(
    {
      sessionId: detail.fastestLap?.sessionId,
      dataset: "results",
      snapshotId: meta.snapshotId,
      limit: 200,
    },
    { skip: !detail.fastestLap },
  );
  const fastestEntry = fastestEntries.currentData?.items.find(
    (row) => row.entry.id === detail.fastestLap?.entryId,
  )?.entry;
  const requestedView = params.get("view") || "results";
  const validView = views.some((view) => view.value === requestedView);
  const session = params.has("session")
    ? sessions.find((item) => item.id === params.get("session"))
    : sessions.find(
        (item) =>
          item.kind ===
          (requestedView === "qualifying" ? "qualifying" : "race"),
      ) || sessions[0];
  const update = (values) => {
    const next = new URLSearchParams({ season: String(event.year), ...values });
    setParams(next);
  };
  const changeView = (view) => {
    const preferred =
      view === "qualifying"
        ? sessions.find((item) =>
            ["qualifying", "sprint-qualifying"].includes(item.kind),
          )
        : session?.kind === "qualifying"
          ? sessions.find((item) => item.kind === "race")
          : session;
    update({ view, ...(preferred ? { session: preferred.id } : {}) });
  };
  return (
    <>
      <PageHeading
        eyebrow={`ROUND ${event.round ?? "NOT SUPPLIED"} / ${event.year}`}
        title={event.name}
        description={`${event.circuit?.displayName || "Circuit not supplied"} · ${dateLabel(event.schedule.date)}`}
        actions={
          <ActionLink
            to={`/calendar?season=${event.year}&event=${encodeURIComponent(event.id)}`}
          >
            Back to calendar
          </ActionLink>
        }
      />
      <div className="race-summary">
        <Metric
          label="Event status"
          value={event.status === "unknown" ? missing : event.status}
        />
        <Metric
          label="Winner"
          value={detail.winner ? entryName(detail.winner) : missing}
        />
        <Metric
          label="Fastest lap supplied"
          value={duration(detail.fastestLap?.durationMs)}
          detail={
            detail.fastestLap
              ? `${fastestEntry ? entryName(fastestEntry) : "Driver name not supplied"} · ${detail.fastestLap.lapNumber == null ? "Lap number not supplied" : `Lap ${detail.fastestLap.lapNumber}`} · validity ${detail.fastestLap.validity}`
              : "No fastest lap supplied"
          }
        />
      </div>
      <SourceNote meta={meta} />
      <details className="race-coverage">
        <summary>Event coverage and session schedule</summary>
        <ul>
          {event.features.map((feature) => (
            <li key={feature.key}>
              {feature.key.replaceAll("-", " ")}: {feature.coverage}
            </li>
          ))}
        </ul>
        {!event.features.length && <p>No dataset coverage supplied.</p>}
        <ul>
          {sessions.map((item) => (
            <li key={item.id}>
              {item.label} · {dateLabel(item.schedule.date)} ·{" "}
              {item.status === "unknown" ? "Status not supplied" : item.status}
            </li>
          ))}
        </ul>
      </details>
      <Panel
        title="Session archive"
        action={
          <Button variant="quiet" onClick={refresh}>
            Refresh event
          </Button>
        }
      >
        {sessions.length ? (
          <>
            <div className="race-session-picker">
              <Select
                label="Session"
                value={session?.id || ""}
                options={[
                  ...(!session
                    ? [{ value: "", label: "Choose a session" }]
                    : []),
                  ...sessions.map((item) => ({
                    value: item.id,
                    label: item.label,
                  })),
                ]}
                onChange={(e) =>
                  update({ session: e.target.value, view: requestedView })
                }
              />
            </div>
            <Tabs
              label="Session datasets"
              items={views}
              value={validView ? requestedView : ""}
              onChange={changeView}
            >
              {!validView ? (
                <EmptyState
                  title="Unknown dataset selection"
                  description="Choose one of the available dataset tabs."
                />
              ) : !session ? (
                <EmptyState
                  title="This session is not available"
                  description="Choose a session supplied for this event. No other session has been substituted."
                />
              ) : (
                <SessionData
                  key={`${session.id}:${requestedView}`}
                  session={session}
                  dataset={requestedView}
                  snapshotId={meta.snapshotId}
                  params={params}
                  setParams={setParams}
                  onSnapshotReset={refresh}
                />
              )}
            </Tabs>
          </>
        ) : (
          <EmptyState
            title="No sessions in this archive"
            description="The event is known, but session data has not been published."
          />
        )}
      </Panel>
    </>
  );
}

export default function RaceDetail() {
  const dispatch = useDispatch();
  const { eventId } = useParams();
  const [params, setParams] = useSearchParams();
  const review = import.meta.env.DEV ? params.get("reviewState") : null;
  const simulated =
    import.meta.env.DEV && ["loading", "empty", "error"].includes(review);
  const query = useGetEventQuery(
    { eventId, snapshotId: params.get("snapshot") || undefined },
    { skip: simulated },
  );
  const eventYear = query.currentData?.detail?.event.year;
  useEffect(() => {
    if (eventYear && !params.has("season")) {
      const next = new URLSearchParams(params);
      next.set("season", String(eventYear));
      setParams(next, { replace: true });
    }
  }, [eventYear, params, setParams]);
  const refresh = () => {
    const next = new URLSearchParams(params);
    next.delete("snapshot");
    next.delete("cursor");
    next.delete("reviewState");
    setParams(next);
    if (!simulated && params.has("snapshot"))
      dispatch(
        archiveApi.util.invalidateTags([{ type: "Event", id: eventId }]),
      );
    if (!simulated && !params.has("snapshot")) query.refetch();
  };
  if (simulated)
    return (
      <>
        <PageHeading
          title="Race detail"
          eyebrow="DEVELOPMENT STATE REVIEW"
          description="State simulation only. No race data or actual service failure is represented."
        />
        <Panel title="Event request state">
          {review === "loading" ? (
            <Skeleton />
          ) : review === "error" ? (
            <ErrorState onRetry={refresh} />
          ) : (
            <EmptyState />
          )}
          <Button variant="quiet" onClick={refresh}>
            Return to real data
          </Button>
        </Panel>
      </>
    );
  return (
    <>
      {!query.currentData?.detail && (
        <PageHeading
          title="Race detail"
          description="Event and session records from the historical archive."
        />
      )}
      <DataBoundary
        query={query}
        empty={query.isSuccess && !query.currentData?.detail}
        onRetry={query.error?.status === 409 ? refresh : query.refetch}
      >
        {eventYear &&
        params.has("season") &&
        params.get("season") !== String(eventYear) ? (
          <>
            <PageHeading
              title="Event and season do not match"
              description={`This event belongs to ${eventYear}. No results have been shown for the selected season.`}
            />
            <ActionLink
              to={`/calendar?season=${encodeURIComponent(params.get("season"))}`}
            >
              Return to selected season
            </ActionLink>
            <ActionLink
              to={`/events/${encodeURIComponent(eventId)}?season=${eventYear}`}
            >
              Open this event in {eventYear}
            </ActionLink>
          </>
        ) : (
          query.currentData?.detail && (
            <Detail
              data={query.currentData}
              params={params}
              setParams={setParams}
              refresh={refresh}
            />
          )
        )}
      </DataBoundary>
      {!query.currentData?.detail && (
        <SourceNote meta={query.currentData?.meta} />
      )}
    </>
  );
}
