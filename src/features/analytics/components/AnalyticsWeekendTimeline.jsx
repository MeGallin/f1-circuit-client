import { APEX_SIZES } from "../../../design-system/apex.tokens";
import { CalendarBlankIcon, FlagCheckeredIcon } from "@phosphor-icons/react";
import { ScheduleTime } from "../../../components/ScheduleTime";

function findPivot(events) {
  const nextIndex = events.findIndex((event) => !event.completed);
  if (nextIndex >= 0) return nextIndex;
  return Math.max(0, events.length - 1);
}

export function buildAnalyticsWeekendTimelineModel(events = []) {
  const publishedEvents = events.filter(Boolean);
  if (!publishedEvents.length) return [];
  const pivot = findPivot(publishedEvents);
  const start = Math.max(0, Math.min(pivot - 2, publishedEvents.length - 5));
  return publishedEvents.slice(start, start + 5).map((event, index) => {
    const absoluteIndex = start + index;
    const isNext = absoluteIndex === pivot && !event.completed;
    return {
      ...event,
      statusLabel: event.completed
        ? "Completed"
        : isNext
          ? "Next up"
          : "Upcoming",
    };
  });
}

function TimelineCard({ event }) {
  return (
    <li
      className={`analytics-weekend-card ${event.statusLabel === "Next up" ? "analytics-weekend-card--next" : ""}`}
    >
      <div className="analytics-weekend-card-marker" aria-hidden="true">
        {event.completed ? (
          <FlagCheckeredIcon size={APEX_SIZES.iconSmall} />
        ) : (
          <CalendarBlankIcon size={APEX_SIZES.iconSmall} />
        )}
      </div>
      <div className="analytics-weekend-card-copy">
        <span>{event.statusLabel}</span>
        <strong>Round {event.round}</strong>
        <h3>{event.name}</h3>
        <small>{event.circuit?.displayName || "Circuit not supplied"}</small>
        <ScheduleTime schedule={event.schedule} />
        {event.winner?.driverName && (
          <small>Winner · {event.winner.driverName}</small>
        )}
      </div>
    </li>
  );
}

export default function AnalyticsWeekendTimeline({ events }) {
  const model = buildAnalyticsWeekendTimelineModel(events);
  if (!model.length) {
    return <p className="muted">No published event timeline is available.</p>;
  }
  return (
    <div className="analytics-weekend-timeline">
      <p className="analytics-weekend-timeline-note">
        Completed rounds sit alongside the next scheduled event so the season
        flow is visible at a glance.
      </p>
      <ol aria-label="Season weekend timeline">
        {model.map((event) => (
          <TimelineCard event={event} key={event.id} />
        ))}
      </ol>
    </div>
  );
}
