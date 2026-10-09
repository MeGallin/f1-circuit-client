import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  CaretLeftIcon,
  CaretRightIcon,
  CalendarBlankIcon,
  FlagCheckeredIcon,
  ClockIcon,
  ProhibitIcon,
} from "@phosphor-icons/react";
import { Button, RaceStatus } from "../../components/ui";
import { dateLabel, isPastScheduledEventAwaitingResults } from "./selectors";
import "../../design-system/season-races.css";
import "../../design-system/season-races.tokens.css";
import { CountryFlag, countryForCircuit } from "../../components/visuals";
import { useGetProfileQuery } from "../../api/archiveApi";

function hasPublishedResults(event) {
  const coverage = event.features?.find(
    (feature) => feature.key === "results",
  )?.coverage;
  // Legacy calendar records omit optional features. The normalizer sets this
  // completed marker only when race Results contains rows, never from the date.
  if (coverage == null) return event.status === "completed";
  return coverage === "complete" || coverage === "partial";
}

export function CircuitCountryFlag({ event, snapshotId }) {
  const profile = useGetProfileQuery(
    { kind: "circuit", id: event.circuit?.id, snapshotId },
    { skip: !event.circuit?.id || Boolean(event.circuit?.country) },
  );
  return (
    <CountryFlag
      image
      country={countryForCircuit(event, profile.currentData, snapshotId)}
    />
  );
}
function SeasonRaceCard({
  event,
  published,
  latest,
  selected,
  onSelect,
  now,
  showCountryFlags,
  snapshotId,
}) {
  const status = String(event.status || "unknown").toLowerCase();
  const cancelled = status === "cancelled" || status === "canceled";
  const label = published
    ? "Results available"
    : cancelled
      ? "Cancelled"
      : status === "postponed"
        ? "Postponed"
        : isPastScheduledEventAwaitingResults(event, now)
          ? "Results pending"
          : ["scheduled", "upcoming"].includes(status)
            ? "Upcoming"
            : "Results not published";
  const upcoming = label === "Upcoming";
  const displayLabel = published ? "Completed" : label;
  const action = latest
    ? "Latest results"
    : published
      ? "View results"
      : "View event";
  const StateIcon = published
    ? FlagCheckeredIcon
    : cancelled
      ? ProhibitIcon
      : upcoming
        ? CalendarBlankIcon
        : ClockIcon;
  return (
    <li
      data-event-id={event.id}
      className={`season-race-card${latest ? " season-race-card--latest" : ""}`}
    >
      <Button
        variant="quiet"
        className="season-race-card-button"
        aria-current={selected ? "true" : undefined}
        aria-label={`Round ${event.round ?? "not supplied"}: ${event.name}. ${displayLabel}. ${published ? "Results available. " : ""}${action}. Select to view event details.`}
        onClick={() => onSelect?.(event)}
      >
        <span className="season-race-card-meta">
          {showCountryFlags && (
            <CircuitCountryFlag event={event} snapshotId={snapshotId} />
          )}
          <span className="season-race-card-round">
            Round {event.round ?? "N/A"}
          </span>
          <RaceStatus status="unknown" className="season-race-card-status">
            <StateIcon
              className={`season-race-status-icon${published ? " season-race-status-icon--completed" : upcoming ? " season-race-status-icon--upcoming" : ""}`}
              data-weight={published ? "fill" : "regular"}
              data-kind={upcoming ? "calendar" : undefined}
              weight={published ? "fill" : "regular"}
              size="1em"
              aria-hidden
            />
            {displayLabel}
          </RaceStatus>
        </span>
        <strong className="season-race-card-name">{event.name}</strong>
        <span className="season-race-card-details">
          <time dateTime={event.schedule?.date || undefined}>
            {dateLabel(event.schedule?.date)}
          </time>
          {event.circuit?.displayName && (
            <span className="season-race-card-circuit">
              {event.circuit.displayName}
            </span>
          )}
        </span>
        {/* One native button owns the entire card; this CTA is visual, not nested interaction. */}
        <span className="button button--secondary season-race-card-action">
          {action}
          <CaretRightIcon size="1em" aria-hidden />
        </span>
      </Button>
    </li>
  );
}

export function SeasonEventStrip({
  events = [],
  selectedEventId,
  onSelect,
  now,
  showCountryFlags = false,
  snapshotId,
}) {
  const [initialNow] = useState(() => Date.now());
  const [expanded, setExpanded] = useState(false);
  const [edges, setEdges] = useState({ start: true, end: true });
  const listRef = useRef(null);
  const positionRef = useRef(null);
  const listId = useId();
  const ordered = useMemo(
    () => events.slice().sort((a, b) => a.round - b.round),
    [events],
  );
  const published = ordered.filter(hasPublishedResults);
  const latestId = published.at(-1)?.id;

  const updateEdges = () => {
    const list = listRef.current;
    if (!list) return;
    const start = list.scrollLeft <= 0;
    const end =
      Math.ceil(list.scrollLeft + list.clientWidth) >= list.scrollWidth;
    setEdges((previous) =>
      previous.start === start && previous.end === end
        ? previous
        : { start, end },
    );
  };
  useEffect(() => {
    const list = listRef.current;
    const reposition =
      !positionRef.current ||
      positionRef.current.latestId !== latestId ||
      positionRef.current.expanded;
    positionRef.current = { latestId, expanded };
    if (!list || expanded) return undefined;
    const centerLatest = () => {
      const latest = Array.from(list.children).find(
        (card) => card.dataset.eventId === latestId,
      );
      const initialLeft = latest
        ? latest.getBoundingClientRect().left -
          list.getBoundingClientRect().left +
          list.scrollLeft -
          Math.max(
            0,
            (list.clientWidth - latest.getBoundingClientRect().width) / 2,
          )
        : 0;
      const left = Math.max(
        0,
        Math.min(initialLeft, list.scrollWidth - list.clientWidth),
      );
      list.scrollTo?.({ left, behavior: "auto" });
      updateEdges();
    };
    if (reposition) centerLatest();
    else updateEdges();
    let width = list.clientWidth;
    const observer =
      typeof ResizeObserver === "function"
        ? new ResizeObserver(() => {
            if (width !== list.clientWidth) {
              width = list.clientWidth;
              centerLatest();
            } else updateEdges();
          })
        : null;
    observer?.observe(list);
    return () => observer?.disconnect();
  }, [expanded, latestId, ordered]);

  const scroll = (direction) => {
    const list = listRef.current;
    const left = Math.max(
      0,
      Math.min(
        list.scrollLeft + direction * list.clientWidth,
        list.scrollWidth - list.clientWidth,
      ),
    );
    const reduce = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    list.scrollTo({ left, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <section className="season-races" aria-label="Season races history">
      <div className="season-races-heading">
        <h3>Season races</h3>
        <p className="season-races-count">
          <span className="sr-only">{`${published.length} of ${ordered.length} races have published results`}</span>
          <strong aria-hidden="true">{published.length}</strong>
          <span aria-hidden="true">of {ordered.length}</span>
        </p>
      </div>
      <p className="season-races-instruction">
        Select a race to view details and results.
      </p>
      {!ordered.length ? (
        <p>No calendar races supplied</p>
      ) : (
        <>
          <div
            className={`season-races-navigation${expanded ? " season-races-navigation--expanded" : ""}`}
          >
            {!expanded && (
              <Button
                variant="secondary"
                className="season-races-arrow"
                aria-label="Show earlier races"
                aria-controls={listId}
                disabled={edges.start}
                onClick={() => scroll(-1)}
              >
                <CaretLeftIcon size="1em" aria-hidden />
              </Button>
            )}
            <ol
              id={listId}
              aria-label="Season races"
              ref={listRef}
              onScroll={updateEdges}
              className={`season-races-list${expanded ? " season-races-list--expanded" : ""}`}
            >
              {ordered.map((event) => (
                <SeasonRaceCard
                  showCountryFlags={showCountryFlags}
                  snapshotId={snapshotId}
                  key={event.id}
                  event={event}
                  published={hasPublishedResults(event)}
                  latest={event.id === latestId}
                  selected={event.id === selectedEventId}
                  onSelect={onSelect}
                  now={now ?? initialNow}
                />
              ))}
            </ol>
            {!expanded && (
              <Button
                variant="secondary"
                className="season-races-arrow"
                aria-label="Show later races"
                aria-controls={listId}
                disabled={edges.end}
                onClick={() => scroll(1)}
              >
                <CaretRightIcon size="1em" aria-hidden />
              </Button>
            )}
          </div>
          <div className="season-races-footer">
            {!expanded && (
              <Button
                variant="secondary"
                aria-controls={listId}
                disabled={edges.start}
                onClick={() => scroll(-1)}
              >
                <CaretLeftIcon size="1em" aria-hidden />
                Earlier races
              </Button>
            )}
            <Button
              variant="secondary"
              className="season-races-toggle"
              aria-controls={listId}
              aria-expanded={expanded}
              onClick={() => setExpanded((value) => !value)}
            >
              {expanded ? "Return to ribbon" : "Show all rounds"}
              <CaretRightIcon size="1em" aria-hidden />
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
