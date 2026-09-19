import { useState } from "react";
import { CalendarBlankIcon } from "@phosphor-icons/react";
import {
  Panel,
  CircuitName,
  DriverNumber,
  RaceStatus,
  Tabs,
  EmptyState,
  SourceNote,
  DataBoundary,
  ActionLink,
} from "../../components/ui";
import {
  useGetCalendarQuery,
  useGetEventQuery,
  useGetLayoutsQuery,
  useGetProfileQuery,
  useGetStandingsQuery,
} from "../../api/archiveApi";
import {
  CircuitSilhouette,
  CountryFlag,
  selectLayout,
} from "../../components/visuals";
import {
  dateLabel,
  adjacentCalendarEvents,
  focusEvent,
  focusEventKind,
} from "./selectors";
import { entryName } from "./raceFormat";
import { RaceCountdown } from "../../components/RaceCountdown";
import { EventInsightDialog } from "./EventInsightDialog";
import { SeasonEventStrip } from "./SeasonEventStrip";

function ResultsAvailability({
  season = {},
  events,
  selectedEventId,
  onSelectEvent,
  throughEventName,
}) {
  const resultsCount = Number.isFinite(Number(season.resultsEventCount))
    ? season.resultsEventCount
    : season.completedCount;
  const eventCount = Number.isFinite(Number(season.eventCount))
    ? Number(season.eventCount)
    : null;
  if (!eventCount) return null;

  return (
    <div
      className="season-progress"
      role="group"
      aria-label="Season progress"
    >
      <div className="season-progress-heading">
        <div>
          <p className="eyebrow">SEASON PROGRESS</p>
          <p className="season-progress-count">
            <strong>{resultsCount}</strong>
            <span>of {eventCount} events</span>
          </p>
        </div>
        <span className="season-progress-note">
          Results through {throughEventName || "latest published result"}
        </span>
      </div>
      <SeasonEventStrip
        events={events}
        eventCount={eventCount}
        resultsCount={resultsCount}
        selectedEventId={selectedEventId}
        onSelect={onSelectEvent}
      />
      <div className="season-progress-legend" aria-label="Event status legend">
        <span className="season-progress-legend-item season-progress-legend-item--complete">
          <i aria-hidden="true" /> Completed
        </span>
        <span className="season-progress-legend-item season-progress-legend-item--upcoming">
          <i aria-hidden="true" /> Upcoming
        </span>
        <b>Tap or click a marker to inspect that round.</b>
      </div>
    </div>
  );
}
export function RaceFocus({
  summary,
  snapshotId,
  includeSeasonProgress = true,
  showCalendarAction = true,
  selectedEventId: suppliedSelectedEventId,
  onSelectEvent,
  onCloseEvent,
  className = "",
}) {
  const event = focusEvent(summary);
  const focusKind = focusEventKind(summary);
  const [internalSelectedEventId, setInternalSelectedEventId] = useState(null);
  const isControlled = suppliedSelectedEventId !== undefined;
  const selectedEventId = isControlled
    ? suppliedSelectedEventId
    : internalSelectedEventId;
  const circuitId = event?.circuit?.id;
  const circuitProfile = useGetProfileQuery(
    { kind: "circuit", id: circuitId, snapshotId },
    { skip: !circuitId },
  );
  const circuitLayouts = useGetLayoutsQuery(
    { id: circuitId, snapshotId },
    { skip: !circuitId },
  );
  const eventDetail = useGetEventQuery(
    { eventId: event?.id, snapshotId },
    { skip: !event?.id || focusKind !== "latest" },
  );
  const calendarQuery = useGetCalendarQuery({
    year: summary.season?.year,
    snapshotId,
  });
  const calendarEvents = calendarQuery.currentData?.items || [];
  const selectedEvent = calendarEvents.find((item) => item.id === selectedEventId);
  const layout = selectLayout(circuitLayouts.currentData?.items, event?.year);
  const country = circuitProfile.currentData?.profile?.country;
  if (!event)
    return (
      <Panel title="Race spotlight">
        <EmptyState
          title="No race spotlight available"
          description="No next or completed event is supplied for this season."
        />
      </Panel>
    );
  return (
    <section
      className={`race-focus ${className}`.trim()}
      aria-labelledby="race-focus-title"
    >
      <div className="race-focus-top">
        <p className="eyebrow">
          {focusKind === "next"
            ? "NEXT SCHEDULED EVENT"
            : "LATEST COMPLETED RACE"}
        </p>
        <b>
          <RaceStatus
            status={focusKind === "next" ? "upcoming" : event.resultStatus || event.status}
          >
            {focusKind === "next" ? "upcoming" : event.resultStatus || event.status}
          </RaceStatus>
        </b>
      </div>
      <div className="race-focus-content">
        <div className="race-focus-copy">
          <p className="race-round">
            ROUND {event.round ?? "N/A"} OF {summary.season?.eventCount ?? "N/A"}
          </p>
          <h2 id="race-focus-title">{event.name}</h2>
          <CircuitName
            name={event.circuit?.displayName || "Circuit not supplied"}
          />
        </div>
        {focusKind === "latest" && (
          <RacePodium
            detail={eventDetail.currentData?.detail}
            isFetching={eventDetail.isFetching}
            isError={eventDetail.isError}
          />
        )}
        <CircuitSilhouette
          layout={layout}
          circuitName={event.circuit?.displayName}
          country={country}
          size="hero"
          fallback="message"
        />
      </div>
      {includeSeasonProgress && (
        <ResultsAvailability
          season={summary.season}
          events={calendarEvents}
          selectedEventId={selectedEventId}
          throughEventName={summary.latestCompletedEvent?.name}
          onSelectEvent={(selected) => {
            if (!isControlled) setInternalSelectedEventId(selected.id);
            onSelectEvent?.(selected);
          }}
        />
      )}
      <div className="race-focus-bottom">
        <ActionLink
          to={`/events/${encodeURIComponent(event.id)}?season=${event.year}`}
        >
          Open race detail
        </ActionLink>
        <span>
          <CalendarBlankIcon size={18} aria-hidden />
          <time dateTime={event.schedule.date || undefined}>
            {dateLabel(event.schedule.date)}
          </time>
        </span>
        {showCalendarAction && (
          <ActionLink
            variant="primary"
            to={`/calendar?season=${event.year}&event=${encodeURIComponent(event.id)}`}
          >
            Explore the calendar
          </ActionLink>
        )}
      </div>
      {selectedEvent && (
        <EventInsightDialog
          event={selectedEvent}
          snapshotId={snapshotId}
          onClose={() => {
            if (!isControlled) setInternalSelectedEventId(null);
            onCloseEvent?.();
          }}
        />
      )}
    </section>
  );
}

function RacePodium({ detail, isFetching, isError }) {
  const podium = (detail?.podium || [])
    .filter((row) => row?.position >= 1 && row.position <= 3)
    .sort((a, b) => a.position - b.position);

  return (
    <section className="race-focus-results" aria-labelledby="race-result-title">
      <div className="race-focus-results-heading">
        <h3 className="eyebrow" id="race-result-title">
          RACE RESULT
        </h3>
        <span className="race-focus-results-note">
          {isFetching && !detail ? "Loading" : "Top three"}
        </span>
      </div>
      {podium.length ? (
        <ol className="race-podium">
          {podium.map((row) => (
            <li
              key={row.id}
              className={`race-podium-row race-podium-row--${
                row.position === 1
                  ? "winner"
                  : row.position === 2
                    ? "second"
                    : "third"
              }`}
            >
              <div className="race-podium-driver">
                <div className="race-podium-driver-line">
                  <DriverNumber number={row.entry?.number || row.entry?.driverNumber} />
                  <strong>{entryName(row.entry)}</strong>
                </div>
                <span>{row.entry?.constructor?.displayName || "Team not supplied"}</span>
              </div>
              <div className="race-podium-block">
                <span
                  className="race-podium-position"
                  aria-label={`Position ${row.position}`}
                >
                  {row.position}
                </span>
                <span className="race-podium-points">
                  {row.points == null ? "—" : `${row.points} PTS`}
                </span>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="race-focus-results-empty">
          {isError
            ? "Top-three results are not supplied for this race."
            : "Top-three results will appear here when published."}
        </p>
      )}
    </section>
  );
}

function AdjacentEventBand({ event, label, next = false }) {
  if (!event) return null;
  const status = event.status || "unknown";
  const statusLabel = status === "unknown" ? "Status not supplied" : status;
  return (
    <section
      className={`overview-adjacent-event overview-adjacent-event--${next ? "next" : "previous"}`}
      aria-label={label}
    >
      <div className="overview-adjacent-event-heading">
        <span>{label}</span>
      </div>
      <b className="overview-adjacent-event-round">{event.round ?? "N/A"}</b>
      <div className="overview-adjacent-event-copy">
        <strong>{event.name}</strong>
        <p>{event.circuit?.displayName || "Circuit not supplied"}</p>
      </div>
      <div className="overview-adjacent-event-date">
        {!next && <b>{dateLabel(event.schedule?.date)}</b>}
        <small>
          <RaceStatus status={status}>{statusLabel}</RaceStatus>
        </small>
      </div>
      {next && (
        <RaceCountdown
          startsAt={event.schedule?.startsAt}
          timePrecision={event.schedule?.timePrecision}
          variant="wide"
        />
      )}
      {next && (
        <ActionLink
          to={`/calendar?season=${event.year}&event=${encodeURIComponent(event.id)}`}
        >
          Explore the calendar
        </ActionLink>
      )}
    </section>
  );
}

export function SeasonAroundRace({ summary, snapshotId, meta, onSnapshotReset }) {
  const [selectedEventId, setSelectedEventId] = useState(null);
  const calendarQuery = useGetCalendarQuery({
    year: summary.season?.year,
    snapshotId,
  });
  const events = calendarQuery.currentData?.items || [];
  const focus = focusEvent(summary);
  const adjacent = focus?.id
    ? adjacentCalendarEvents(events, focus.id)
    : { previous: null, next: null };
  const nextEvent = adjacent.next || summary.nextEvent || null;
  const previousEvent = adjacent.previous || summary.previousEvent || null;
  const selectEvent = (event) => setSelectedEventId(event.id);

  return (
    <section className="season-around-race" aria-label="Season around the race">
      <div className="season-around-race-freshness">
        Results through {summary.latestCompletedEvent?.name || "latest published result"}
        {summary.latestCompletedEvent?.schedule?.date
          ? ` · ${summary.latestCompletedEvent.schedule.date}`
          : ""}
      </div>
      <AdjacentEventBand event={nextEvent} label="NEXT EVENT" next />
      <div className="season-around-race-main">
        <RaceFocus
          className="season-around-race-focus"
          includeSeasonProgress={false}
          onCloseEvent={() => setSelectedEventId(null)}
          onSelectEvent={selectEvent}
          selectedEventId={selectedEventId}
          showCalendarAction={false}
          snapshotId={snapshotId}
          summary={summary}
        />
        <StandingsPreview embedded summary={summary} />
      </div>
      <DataBoundary
        query={calendarQuery}
        empty={calendarQuery.isSuccess && !events.length}
        onRetry={
          calendarQuery.error?.status === 409
            ? onSnapshotReset
            : calendarQuery.refetch
        }
      >
        <ResultsAvailability
          events={events}
          onSelectEvent={selectEvent}
          season={summary.season}
          selectedEventId={selectedEventId}
          throughEventName={summary.latestCompletedEvent?.name}
        />
      </DataBoundary>
      <AdjacentEventBand event={previousEvent} label="PREVIOUS EVENT" />
      <div className="season-around-race-provenance">
        <SourceNote meta={meta} />
      </div>
    </section>
  );
}

function CalendarContextRows({ events }) {
  return (
    <ol className="calendar-rows">
      {events.map(({ event, label, showCountdown }) => (
        <li
          key={event.id}
          className="calendar-row calendar-row--context"
        >
          <span className="round-number">
            <span className="sr-only">Round </span>
            {event.round == null
              ? "Not supplied"
              : String(event.round).padStart(2, "0")}
          </span>
          <div>
            <p className="calendar-row-label">{label}</p>
            <strong>{event.name}</strong>
            <p>
              <CountryFlag
                country={event.circuit?.country}
                label="Circuit country"
              />
              <span>
                {event.circuit?.displayName || "Circuit not supplied"}
              </span>
            </p>
            {showCountdown && (
              <RaceCountdown
                startsAt={event.schedule.startsAt}
                timePrecision={event.schedule.timePrecision}
              />
            )}
          </div>
          <div className="calendar-row-date">
            <time dateTime={event.schedule.date || undefined}>
              {dateLabel(event.schedule.date)}
            </time>
            <RaceStatus status={event.status}>
              {event.status === "unknown"
                ? "Status not supplied"
                : event.status}
            </RaceStatus>
          </div>
        </li>
      ))}
    </ol>
  );
}
export function CalendarPreview({
  year,
  snapshotId,
  eventId,
  onSnapshotReset,
}) {
  const query = useGetCalendarQuery({ year, snapshotId });
  const events = query.currentData?.items || [];
  const { previous, next } = adjacentCalendarEvents(events, eventId);
  const contextEvents = [
    previous && { event: previous, label: "Previous event" },
    next && { event: next, label: "Next event", showCountdown: true },
  ].filter(Boolean);
  return (
    <div id="season-calendar" className="anchor-section">
      <Panel title="Previous and next events">
        <DataBoundary
          query={query}
          empty={query.isSuccess && !events.length}
          onRetry={
            query.error?.status === 409 ? onSnapshotReset : query.refetch
          }
        >
          {contextEvents.length > 0 ? (
            <CalendarContextRows events={contextEvents} />
          ) : (
            <EmptyState title="No adjacent events available" />
          )}
        </DataBoundary>
      </Panel>
      <ActionLink to={`/calendar?season=${year}`}>
        Open season calendar
      </ActionLink>
      <SourceNote meta={query.currentData?.meta} />
    </div>
  );
}
function LeaderList({ entries, kind }) {
  return (
    <ol className="leader-list">
      {entries.map((row) => (
        <li key={row.id}>
          <span className="leader-rank">
            {String(row.rank ?? "?").padStart(2, "0")}
          </span>
          <div>
            <div className="leader-driver-line">
              {kind === "drivers" && (
                <DriverNumber
                  number={row.number || row.entity?.number || row.entity?.driverNumber}
                />
              )}
              <strong>{row.entity.displayName}</strong>
            </div>
            {row.constructors.length > 0 && (
              <p>{row.constructors.map((c) => c.displayName).join(" / ")}</p>
            )}
          </div>
          <span className="leader-points">
            <strong>{row.points}</strong>
            <span>PTS</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
export function StandingsPreview({ summary, embedded = false }) {
  const [kind, setKind] = useState("drivers");
  const standingsQuery = useGetStandingsQuery({
    year: summary.season.year,
    kind,
    standingSnapshotId: summary.standingSnapshotId,
  });
  const fallbackRows =
    kind === "drivers" ? summary.leadingDrivers : summary.leadingConstructors;
  const rows = standingsQuery.currentData?.items?.slice(0, 10) || fallbackRows;
  return (
    <section
      id="season-standings"
      className={`anchor-section${embedded ? " season-around-race-standings" : ""}`}
    >
      <Panel
        className={embedded ? "season-around-race-panel" : ""}
        eyebrow="CHAMPIONSHIP"
        title="Championship snapshot"
      >
        <Tabs
          label="Championship standings"
          items={[
            { value: "drivers", label: "Drivers" },
            { value: "constructors", label: "Constructors" },
          ]}
          value={kind}
          onChange={setKind}
        >
          {rows.length ? (
            <LeaderList entries={rows} kind={kind} />
          ) : (
            <EmptyState title="Standings not yet available" />
          )}
        </Tabs>
        <p className="panel-footnote">
          Leading entries from the latest published standings
          {summary.latestCompletedEvent?.name
            ? ` after ${summary.latestCompletedEvent.name}`
            : ""}
          . Points are shown exactly as supplied.
        </p>
        <ActionLink
          to={`/standings?season=${summary.season.year}&kind=${kind}`}
        >
          Open full standings
        </ActionLink>
      </Panel>
    </section>
  );
}
