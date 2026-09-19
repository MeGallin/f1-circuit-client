import "../../styles/season-event-strip.css";

export function SeasonEventStrip({
  events = [],
  eventCount = events.length,
  resultsCount = 0,
  selectedEventId,
  onSelect,
}) {
  const total = Number.isFinite(Number(eventCount)) ? Number(eventCount) : 0;
  const available = Number.isFinite(Number(resultsCount))
    ? Number(resultsCount)
    : 0;

  return (
    <div className="season-event-strip" role="list" aria-label="Season events">
      {Array.from({ length: total }, (_, index) => {
        const event = events[index];
        const complete = index < available;
        const round = event?.round ?? index + 1;
        const label = event
          ? `Round ${round}: ${event.name}. ${
              complete ? "Results available." : "Results not yet available."
            } Select to view event details.`
          : `Round ${round}: Event details not supplied.`;

        if (!event)
          return (
            <span
              aria-hidden="true"
              className="season-event-segment season-event-segment--placeholder"
              key={round}
            >
              <span />
            </span>
          );

        return (
          <button
            aria-label={label}
            aria-current={event.id === selectedEventId ? "true" : undefined}
            className={`season-event-segment${
              complete ? " season-event-segment--complete" : ""
            }${event.id === selectedEventId ? " season-event-segment--selected" : ""}`}
            key={event.id}
            onClick={() => onSelect?.(event)}
            type="button"
          >
            <span aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
