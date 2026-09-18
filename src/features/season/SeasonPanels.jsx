import { useState } from "react";
import {
  ArrowRightIcon,
  CalendarBlankIcon,
  FlagCheckeredIcon,
} from "@phosphor-icons/react";
import {
  Panel,
  StatusBadge,
  Metric,
  Button,
  Tabs,
  EmptyState,
  SourceNote,
  DataBoundary,
  ActionLink,
} from "../../components/ui";
import { useGetCalendarQuery } from "../../api/archiveApi";
import { dateLabel, focusEvent, previewCalendar } from "./selectors";

export function ArchiveProgress({ season }) {
  return (
    <Panel title="Archive coverage">
      <div className="archive-progress">
        <div className="coverage-count">
          <strong>{season.completedCount}</strong>
          <span>of {season.eventCount} events</span>
        </div>
        <p>
          Completed events with results in this archive. This is data coverage,
          not season progress.
        </p>
        <div className="coverage-segments" aria-hidden>
          {Array.from({ length: season.eventCount }, (_, i) => (
            <span
              key={i}
              className={i < season.completedCount ? "filled" : ""}
            />
          ))}
        </div>
        <div className="coverage-stats">
          <Metric label="Calendar rounds" value={season.eventCount} />
          <Metric label="Season coverage" value={season.coverage} />
        </div>
      </div>
    </Panel>
  );
}
export function RaceFocus({ summary }) {
  const event = focusEvent(summary);
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
          {summary.nextEvent
            ? "NEXT SCHEDULED EVENT"
            : "LATEST COMPLETED IN ARCHIVE"}
        </p>
        <StatusBadge>{event.status}</StatusBadge>
      </div>
      <div className="race-focus-content">
        <div>
          <p className="race-round">
            ROUND {event.round ?? "N/A"} / {event.year}
          </p>
          <h2 id="race-focus-title">{event.name}</h2>
          <p className="circuit-name">
            {event.circuit?.displayName || "Circuit not supplied"}
          </p>
        </div>
        <FlagCheckeredIcon
          size={64}
          weight="light"
          aria-hidden
          className="race-focus-icon"
        />
      </div>
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
    </section>
  );
}
function CalendarRows({ events, selectedId }) {
  return (
    <ol className="calendar-rows">
      {events.map((event) => (
        <li
          key={event.id}
          className={
            event.id === selectedId
              ? "calendar-row calendar-row--selected"
              : "calendar-row"
          }
        >
          <span className="round-number">
            <span className="sr-only">Round </span>
            {event.round == null
              ? "Not supplied"
              : String(event.round).padStart(2, "0")}
          </span>
          <div>
            <strong>{event.name}</strong>
            <p>{event.circuit?.displayName || "Circuit not supplied"}</p>
          </div>
          <div className="calendar-row-date">
            <time dateTime={event.schedule.date || undefined}>
              {dateLabel(event.schedule.date)}
            </time>
            <span>
              {event.status === "unknown"
                ? "Status not supplied"
                : event.status}
            </span>
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
  const [expanded, setExpanded] = useState(false);
  const events = query.currentData?.items || [];
  return (
    <div id="season-calendar" className="anchor-section">
      <Panel
        title="Around the calendar"
        action={
          <Button
            variant="quiet"
            onClick={() => setExpanded(!expanded)}
            disabled={!events.length}
          >
            {expanded ? "Show nearby rounds" : "Show all rounds"}
            <ArrowRightIcon size={17} aria-hidden />
          </Button>
        }
      >
        <DataBoundary
          query={query}
          empty={query.isSuccess && !events.length}
          onRetry={
            query.error?.status === 409 ? onSnapshotReset : query.refetch
          }
        >
          {events.length > 0 && (
            <CalendarRows
              events={expanded ? events : previewCalendar(events, eventId)}
              selectedId={eventId}
            />
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
  const rows =
    kind === "drivers" ? summary.leadingDrivers : summary.leadingConstructors;
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
          Leading entries from the latest published standings. Points are shown
          exactly as supplied.
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
