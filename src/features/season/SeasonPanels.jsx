import { useState } from "react";
import { CalendarBlankIcon } from "@phosphor-icons/react";
import {
  Panel,
  RaceStatus,
  StatusBadge,
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
      className="race-focus-availability"
      role="group"
      aria-label="Season results coverage"
    >
      <div className="race-focus-availability-heading">
        <p className="eyebrow">EVENTS</p>
        <p className="race-focus-availability-count">
          <strong>{resultsCount}</strong>
          <span>of {eventCount} events</span>
        </p>
      </div>
      <div className="season-event-guidance">
        <p className="season-event-guidance-action">
          <span className="season-event-guidance-marker" aria-hidden="true" />
          <span className="season-event-guidance-copy">
            <span className="season-event-guidance-kicker">ROUND EXPLORER</span>
            <span>Tap or click a marker to inspect that round.</span>
          </span>
        </p>
        <div className="season-event-legend" aria-label="Event status legend">
          <RaceStatus
            className="season-event-legend-item season-event-legend-item--complete"
            status="completed"
          >
            Completed
          </RaceStatus>
          <span className="season-event-legend-item season-event-legend-item--upcoming">
            Upcoming
          </span>
        </div>
      </div>
      <SeasonEventStrip
        events={events}
        eventCount={eventCount}
        resultsCount={resultsCount}
        selectedEventId={selectedEventId}
        onSelect={onSelectEvent}
      />
    </div>
  );
}
export function RaceFocus({ summary, snapshotId }) {
  const event = focusEvent(summary);
  const focusKind = focusEventKind(summary);
  const [selectedEventId, setSelectedEventId] = useState(null);
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
    <section className="race-focus" aria-labelledby="race-focus-title">
      <div className="race-focus-top">
        <p className="eyebrow">
          {focusKind === "next"
            ? "NEXT SCHEDULED EVENT"
            : "LATEST COMPLETED RACE"}
        </p>
          <StatusBadge status={focusKind === "next" ? "upcoming" : event.resultStatus || event.status}>
            {focusKind === "next" ? "upcoming" : event.resultStatus || event.status}
          </StatusBadge>
      </div>
      <div className="race-focus-content">
        <div className="race-focus-copy">
          <p className="race-round">
            ROUND {event.round ?? "N/A"} OF {summary.season?.eventCount ?? "N/A"}
          </p>
          <h2 id="race-focus-title">{event.name}</h2>
          <p className="circuit-name">
            <span>{event.circuit?.displayName || "Circuit not supplied"}</span>
          </p>
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
      <ResultsAvailability
        season={summary.season}
        events={calendarEvents}
        selectedEventId={selectedEventId}
        onSelectEvent={(selected) => setSelectedEventId(selected.id)}
      />
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
        <ActionLink
          variant="primary"
          to={`/calendar?season=${event.year}&event=${encodeURIComponent(event.id)}`}
        >
          Explore the calendar
        </ActionLink>
      </div>
      {selectedEvent && (
        <EventInsightDialog
          event={selectedEvent}
          snapshotId={snapshotId}
          onClose={() => setSelectedEventId(null)}
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
                <strong>{entryName(row.entry)}</strong>
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
function LeaderList({ entries }) {
  return (
    <ol className="leader-list">
      {entries.map((row) => (
        <li key={row.id}>
          <span className="leader-rank">
            {String(row.rank ?? "?").padStart(2, "0")}
          </span>
          <div>
            <strong>{row.entity.displayName}</strong>
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
export function StandingsPreview({ summary }) {
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
    <section id="season-standings" className="anchor-section">
      <Panel title="Championship snapshot">
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
            <LeaderList entries={rows} />
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
