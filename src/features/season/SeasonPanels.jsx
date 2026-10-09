import { useEffect, useState } from "react";
import {
  Panel,
  RaceStatus,
  EmptyState,
  SourceNote,
  DataBoundary,
  ActionLink,
} from "../../components/ui";
import { useGetCalendarQuery } from "../../api/archiveApi";
import { CountryFlag } from "../../components/visuals";
import {
  dateLabel,
  adjacentCalendarEvents,
  focusEvent,
  nextScheduledEvent,
  runtimeYear,
} from "./selectors";
import { RaceCountdown } from "../../components/RaceCountdown";
import { ScheduleTime } from "../../components/ScheduleTime";
import { RaceResultStatus } from "./RaceResultStatusPanel";
import { EventInsightDialog } from "./EventInsightDialog";
import { SeasonEventStrip, CircuitCountryFlag } from "./SeasonEventStrip";
import { CompletedRaceOverview } from "./CompletedRaceOverview";
export { RaceFocus } from "./RaceSummary";

const SEASON_EVENT_REFRESH_INTERVAL_MS = 30_000;

function NextEventBand({ event, label, now, snapshotId }) {
  if (!event) return null;
  const status = event.status || "unknown";
  const statusLabel = status === "unknown" ? "Status not supplied" : status;
  return (
    <section
      className="overview-adjacent-event overview-adjacent-event--next overview-adjacent-event--countdown-hero"
      aria-label={label}
    >
      <div className="overview-adjacent-event-countdown">
        <RaceResultStatus event={event} now={now} />
      </div>
      <div className="overview-adjacent-event-hero-copy">
        <div className="overview-adjacent-event-heading">
          <span>{label}</span>
        </div>
        <div className="overview-adjacent-event-identity">
          <b className="overview-adjacent-event-round">
            {event.round ?? "N/A"}
          </b>
          <div className="overview-adjacent-event-copy">
            <CircuitCountryFlag event={event} snapshotId={snapshotId} />
            <strong>{event.name}</strong>
            <p>{event.circuit?.displayName || "Circuit not supplied"}</p>
          </div>
        </div>
      </div>
      <div className="overview-adjacent-event-hero-meta">
        <div className="overview-adjacent-event-date">
          <ScheduleTime schedule={event.schedule} showVenue />
          <small>
            <RaceStatus status={status}>{statusLabel}</RaceStatus>
          </small>
        </div>
        <ActionLink
          to={`/calendar?season=${event.year}&event=${encodeURIComponent(event.id)}`}
        >
          Explore the calendar
        </ActionLink>
      </div>
    </section>
  );
}

export function SeasonAroundRace({
  summary,
  snapshotId,
  meta,
  onSnapshotReset,
  now: suppliedNow,
}) {
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [clockNow, setClockNow] = useState(() => Date.now());
  useEffect(() => {
    if (suppliedNow != null) return undefined;
    const timer = setInterval(
      () => setClockNow(Date.now()),
      SEASON_EVENT_REFRESH_INTERVAL_MS,
    );
    return () => clearInterval(timer);
  }, [suppliedNow]);
  const now = suppliedNow ?? clockNow;
  const calendarQuery = useGetCalendarQuery({
    year: summary.season?.year,
    snapshotId,
  });
  const events = calendarQuery.currentData?.items || [];
  const isCurrentSeason = Number(summary.season?.year) === runtimeYear();
  const focus = focusEvent(summary);
  const adjacentNext = focus?.id
    ? adjacentCalendarEvents(events, focus.id).next
    : null;
  const nextEvent = isCurrentSeason
    ? nextScheduledEvent(
        calendarQuery.currentData
          ? events
          : [summary.nextEvent].filter(Boolean),
        now,
      )
    : adjacentNext || summary.nextEvent || null;
  const statusNow = suppliedNow == null ? undefined : now;
  const selectEvent = (event) => setSelectedEventId(event.id);

  return (
    <section className="season-around-race" aria-label="Season around the race">
      <NextEventBand
        event={nextEvent}
        label="NEXT EVENT"
        now={statusNow}
        snapshotId={snapshotId}
      />
      <CompletedRaceOverview
        key={`${summary.season?.year}:${summary.latestCompletedEvent?.id}:${snapshotId}:${summary.standingSnapshotId}`}
        summary={summary}
        snapshotId={snapshotId}
        onSnapshotReset={onSnapshotReset}
      />
      <DataBoundary
        query={calendarQuery}
        empty={calendarQuery.isSuccess && !events.length}
        onRetry={
          calendarQuery.error?.status === 409
            ? onSnapshotReset
            : calendarQuery.refetch
        }
      >
        <SeasonEventStrip
          key={summary.season?.year}
          showCountryFlags
          snapshotId={snapshotId}
          events={events}
          now={now}
          onSelect={selectEvent}
          selectedEventId={selectedEventId}
        />
      </DataBoundary>
      <div className="season-around-race-provenance">
        {selectedEventId &&
          events.find((item) => item.id === selectedEventId) && (
            <EventInsightDialog
              event={events.find((item) => item.id === selectedEventId)}
              snapshotId={snapshotId}
              onClose={() => setSelectedEventId(null)}
            />
          )}
        <SourceNote meta={meta} />
      </div>
    </section>
  );
}

function CalendarContextRows({ events }) {
  return (
    <ol className="calendar-rows">
      {events.map(({ event, label, showCountdown }) => (
        <li key={event.id} className="calendar-row calendar-row--context">
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
