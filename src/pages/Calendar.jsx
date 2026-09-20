import { useState } from "react";
import { useDispatch } from "react-redux";
import useSeasonSearch from "../features/season/useSeasonSearch";
import {
  archiveApi,
  useGetCalendarQuery,
  useGetEventQuery,
  useGetLayoutsQuery,
  useGetProfileQuery,
  useGetSeasonsQuery,
} from "../api/archiveApi";
import {
  selectedSeason,
  selectSeasonOptions,
  dateLabel,
} from "../features/season/selectors";
import { entryName } from "../features/season/raceFormat";
import {
  PageHeading,
  Select,
  Panel,
  Button,
  DataBoundary,
  EmptyState,
  SourceNote,
  StatusBadge,
  Pagination,
  Skeleton,
  ErrorState,
  ActionLink,
} from "../components/ui";
import "../styles/calendar.css";
import SeasonUnavailable from "../features/season/SeasonUnavailable";
import {
  CircuitSilhouette,
  CountryFlag,
  selectLayout,
} from "../components/visuals";

const calendarFilters = [
  { value: "all", label: "All rounds" },
  { value: "completed", label: "Completed" },
  { value: "upcoming", label: "Upcoming" },
];

function statusLabel(status) {
  if (status === "completed") return "Completed";
  if (["scheduled", "upcoming"].includes(status)) return "Upcoming";
  return "Status not supplied";
}

function eventTime(event) {
  if (
    !event.schedule.startsAt ||
    !["minute", "second"].includes(event.schedule.timePrecision)
  )
    return null;
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(event.schedule.startsAt));
}

export function filterCalendarEvents(events, filter = "all") {
  return (events || []).filter((event) => {
    if (filter === "completed") return event.status === "completed";
    if (filter === "upcoming")
      return ["scheduled", "upcoming"].includes(event.status);
    return true;
  });
}

export function CalendarEvents({
  events,
  selectedId,
  onSelect,
  selectedLayout,
  selectedCountry,
  latestResultId,
  nextRaceId,
  eventDetail,
  eventDetailFetching,
  eventDetailError,
}) {
  return (
    <ol className="calendar-events" aria-label="Season events">
      {events.map((event) => (
        <li
          key={event.id}
          className={
            event.id === selectedId
              ? "calendar-event is-selected"
              : "calendar-event"
          }
        >
          <span className="calendar-round">
            <span>Round</span>
            <strong>{String(event.round ?? "N/A").padStart(2, "0")}</strong>
          </span>
          <div className="calendar-event-name">
            {(event.id === latestResultId || event.id === nextRaceId) && (
              <span className="calendar-event-marker">
                {event.id === latestResultId ? "Latest result" : "Next race"}
              </span>
            )}
            <button
              type="button"
              aria-expanded={event.id === selectedId}
              aria-controls={`calendar-event-detail-${encodeURIComponent(event.id)}`}
              onClick={() => onSelect(event.id)}
            >
              {event.name}
            </button>
            <p>
              <CountryFlag
                country={
                  event.id === selectedId
                    ? selectedCountry || event.circuit?.country
                    : event.circuit?.country
                }
                label="Circuit country"
              />
              <span>
                {event.circuit?.displayName || "Circuit not supplied"}
              </span>
            </p>
          </div>
          <div className="calendar-date">
            <time dateTime={event.schedule.date || undefined}>
              {dateLabel(event.schedule.date)}
            </time>
            {eventTime(event) && <span>{eventTime(event)} UTC</span>}
          </div>
          <StatusBadge status={event.status}>
            {statusLabel(event.status)}
          </StatusBadge>
          <div className="calendar-event-actions">
            <ActionLink
              to={`/events/${encodeURIComponent(event.id)}?season=${event.year}`}
            >
              Full race detail
            </ActionLink>
          </div>
          {event.id === selectedId && (
            <div
              className="calendar-event-detail"
              id={`calendar-event-detail-${encodeURIComponent(event.id)}`}
            >
              <CircuitSilhouette
                layout={event.id === selectedId ? selectedLayout : null}
                circuitName={event.circuit?.displayName}
                  country={selectedCountry || event.circuit?.country}
                size="compact"
                fallback="message"
              />
              <div className="calendar-event-detail-copy">
                <div className="calendar-detail-meta">
                  <p>
                    {selectedCountry ||
                      event.circuit?.country ||
                      "Location not supplied by the calendar source."}
                  </p>
                  <p>
                    {event.schedule.circuitTimeZone
                      ? `Circuit time zone: ${event.schedule.circuitTimeZone}`
                      : "Circuit time zone not supplied."}
                  </p>
                </div>
                <p className="calendar-detail-kicker">
                  {event.status === "completed" ? "Race result" : "Round preview"}
                </p>
                {eventDetail?.podium?.length ? (
                  <ol className="calendar-podium" aria-label="Top three finishers">
                    {eventDetail.podium
                      .filter((row) => row.position >= 1 && row.position <= 3)
                      .sort((a, b) => a.position - b.position)
                      .map((row) => (
                        <li key={row.id}>
                          <strong>{row.position}</strong>
                          <span>{entryName(row.entry)}</span>
                          <small>
                            {row.entry?.constructor?.displayName ||
                              "Team not supplied"}
                          </small>
                        </li>
                      ))}
                  </ol>
                ) : (
                  <p>
                    {eventDetailFetching
                      ? "Loading race result…"
                      : eventDetailError
                        ? "Race result is not available for this round."
                        : event.status === "completed"
                          ? "Race result is not supplied for this round."
                          : "Results will appear here after the race."}
                  </p>
                )}
                <details className="calendar-coverage">
                  <summary>Data availability</summary>
                  {event.features?.length ? (
                    <ul aria-label="Available datasets">
                      {event.features.map((feature) => (
                        <li key={feature.key}>
                          {feature.key.replaceAll("-", " ")}: {feature.coverage}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Coverage details are not supplied for this round.</p>
                  )}
                </details>
              </div>
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}

function SeasonCalendar({ year, selectedId, onSelect, filter }) {
  const dispatch = useDispatch();
  const [pages, setPages] = useState([{}]);
  const query = useGetCalendarQuery({ year, ...pages.at(-1) });
  const data = query.currentData;
  const visibleEvents = filterCalendarEvents(data?.items, filter);
  const selectedEvent = data?.items.find((event) => event.id === selectedId);
  const selectedCircuitId = selectedEvent?.circuit?.id;
  const selectedProfile = useGetProfileQuery(
    {
      kind: "circuit",
      id: selectedCircuitId,
      snapshotId: data?.meta?.snapshotId,
    },
    { skip: !selectedCircuitId },
  );
  const selectedLayouts = useGetLayoutsQuery(
    { id: selectedCircuitId, snapshotId: data?.meta?.snapshotId },
    { skip: !selectedCircuitId },
  );
  const selectedLayout = selectLayout(
    selectedLayouts.currentData?.items,
    selectedEvent?.year,
  );
  const selectedCountry = selectedProfile.currentData?.profile?.country;
  const selectedEventDetailQuery = useGetEventQuery(
    { eventId: selectedId, snapshotId: data?.meta?.snapshotId },
    { skip: !selectedId || !selectedEvent || !data?.meta?.snapshotId },
  );
  const latestResult = (data?.items || [])
    .filter((event) => event.status === "completed")
    .sort((a, b) => (b.round ?? 0) - (a.round ?? 0))[0];
  const nextRace = (data?.items || [])
    .filter((event) => ["scheduled", "upcoming"].includes(event.status))
    .sort((a, b) =>
      String(a.schedule.date || "").localeCompare(String(b.schedule.date || "")),
    )[0];
  const completedEvents = (data?.items || []).filter(
    (event) => event.status === "completed",
  );
  const upcomingEvents = (data?.items || []).filter((event) =>
    ["scheduled", "upcoming"].includes(event.status),
  );
  const totalEvents = data?.page.total ?? data?.items?.length ?? 0;
  const completionPercent = totalEvents
    ? Math.round((completedEvents.length / totalEvents) * 100)
    : 0;
  const filterCounts = {
    all: totalEvents,
    completed: completedEvents.length,
    upcoming: upcomingEvents.length,
  };
  const restart = () => {
    if (pages.length > 1) {
      setPages([{}]);
      dispatch(archiveApi.util.invalidateTags([{ type: "Season", id: year }]));
    } else query.refetch();
  };
  return (
    <>
      <div className="calendar-toolbar">
        <p>{year} season</p>
        <div className="calendar-toolbar-actions">
          <Button variant="quiet" disabled={query.isFetching} onClick={restart}>
            Refresh calendar
          </Button>
        </div>
      </div>
      <section className="calendar-season-context" aria-label={`${year} season context`}>
        <div className="calendar-season-progress">
          <div className="calendar-season-progress-heading">
            <div>
              <p className="eyebrow">SEASON PROGRESS</p>
              <strong>
                {completedEvents.length} <span>of {totalEvents}</span>
              </strong>
            </div>
            <p>
              {latestResult
                ? `Through ${latestResult.name}`
                : "No completed rounds published"}
            </p>
          </div>
          <div
            className="calendar-progress-track"
            role="progressbar"
            aria-label="Completed events"
            aria-valuemin="0"
            aria-valuemax={totalEvents}
            aria-valuenow={completedEvents.length}
            style={{ "--calendar-progress": `${completionPercent}%` }}
          >
            <span />
          </div>
        </div>
        <div className="calendar-context-events">
          {latestResult && (
            <div className="calendar-context-event calendar-context-event--latest">
              <p>Latest completed</p>
              <strong>{latestResult.name}</strong>
              <span>
                {latestResult.circuit?.displayName || "Circuit not supplied"} ·{" "}
                {dateLabel(latestResult.schedule.date)}
              </span>
              <ActionLink
                variant="quiet"
                to={`/events/${encodeURIComponent(latestResult.id)}?season=${year}`}
              >
                View result
              </ActionLink>
            </div>
          )}
          {nextRace && (
            <div className="calendar-context-event calendar-context-event--next">
              <p>Next race</p>
              <strong>{nextRace.name}</strong>
              <span>
                {nextRace.circuit?.displayName || "Circuit not supplied"} ·{" "}
                {dateLabel(nextRace.schedule.date)}
              </span>
              <ActionLink
                variant="quiet"
                to={`/events/${encodeURIComponent(nextRace.id)}?season=${year}`}
              >
                View race
              </ActionLink>
            </div>
          )}
        </div>
      </section>
      <Panel title={`${year} race calendar`}>
        <p className="calendar-explainer">
          Select a round to view its circuit, result and available data.
        </p>
        <DataBoundary
          query={query}
          empty={query.isSuccess && !data?.items.length}
          onRetry={query.error?.status === 409 ? restart : query.refetch}
        >
          {data && (
            <>
              <div className="calendar-filter" aria-label="Filter calendar rounds">
                <span className="calendar-filter-label">Show</span>
                <div
                  className="calendar-filter-options"
                  role="group"
                  aria-label="Round status"
                >
                  {calendarFilters.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={
                        filter === option.value
                          ? "calendar-filter-option is-active"
                          : "calendar-filter-option"
                      }
                      aria-pressed={filter === option.value}
                      onClick={() => onSelect(null, option.value)}
                    >
                      {option.label}
                      <span>{filterCounts[option.value]}</span>
                    </button>
                  ))}
                </div>
              </div>
              {selectedId &&
                !visibleEvents.some((event) => event.id === selectedId) && (
                  <p className="calendar-explainer" role="status">
                    The selected event is outside this filter. Choose All rounds
                    to return to it.
                  </p>
                )}
              {visibleEvents.length ? (
                <CalendarEvents
                  events={visibleEvents}
                  selectedId={selectedId}
                  onSelect={(id) =>
                    onSelect(id === selectedId ? null : id, filter)
                  }
                  selectedLayout={selectedLayout}
                  selectedCountry={selectedCountry}
                  latestResultId={latestResult?.id}
                  nextRaceId={nextRace?.id}
                  eventDetail={selectedEventDetailQuery.currentData?.detail}
                  eventDetailFetching={selectedEventDetailQuery.isFetching}
                  eventDetailError={selectedEventDetailQuery.isError}
                />
              ) : (
                <EmptyState
                  title={`No ${filter} rounds published`}
                  description="Try another calendar filter or check the source coverage note below."
                />
              )}
              {(data.page.hasMore || pages.length > 1) && (
                <Pagination
                  page={pages.length}
                  total={data.page.total}
                  hasMore={data.page.hasMore}
                  busy={query.isFetching}
                  onPrevious={() => setPages(pages.slice(0, -1))}
                  onNext={() =>
                    setPages([
                      ...pages,
                      {
                        cursor: data.page.nextCursor,
                        snapshotId: data.meta.snapshotId,
                      },
                    ])
                  }
                />
              )}
            </>
          )}
        </DataBoundary>
      </Panel>
      <SourceNote meta={data?.meta} />
    </>
  );
}

export default function Calendar() {
  const [params, setParams] = useSeasonSearch();
  const review = import.meta.env.DEV ? params.get("reviewState") : null;
  const simulated =
    import.meta.env.DEV && ["loading", "empty", "error"].includes(review);
  const catalogue = useGetSeasonsQuery(undefined, { skip: simulated });
  const year = selectedSeason(
    catalogue.currentData?.items,
    params.get("season"),
  );
  const filter = calendarFilters.some(
    (option) => option.value === params.get("status"),
  )
    ? params.get("status")
    : "all";
  const options = selectSeasonOptions(catalogue.currentData);
  const exitReview = () => {
    const next = new URLSearchParams(params);
    next.delete("reviewState");
    setParams(next);
  };
  return (
    <>
      <PageHeading
        eyebrow="THE SEASON, ROUND BY ROUND"
        title="Season calendar"
        description="The venues, dates and available history of each Grand Prix."
        actions={
          options.length > 0 && (
            <Select
              label="Season"
              value={year ? String(year) : ""}
              options={
                year
                  ? options
                  : [{ value: "", label: "Choose a season" }, ...options]
              }
              onChange={(e) => setParams({ season: e.target.value })}
            />
          )
        }
      />
      {simulated ? (
        <Panel title="Development state review">
          <p className="calendar-explainer">
            State simulation only. No race data or actual service failure is
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
            (year &&
            catalogue.currentData.items.some(
              (season) => season.year === year,
            ) ? (
              <SeasonCalendar
                key={`${year}:${filter}`}
                year={year}
                selectedId={params.get("event")}
                filter={filter}
                onSelect={(id, nextFilter = filter) => {
                  const next = new URLSearchParams(params);
                  next.set("season", String(year));
                  if (id) next.set("event", id);
                  else next.delete("event");
                  if (nextFilter === "all") next.delete("status");
                  else next.set("status", nextFilter);
                  setParams(next);
                }}
              />
            ) : (
              <SeasonUnavailable
                year={year}
                seasons={catalogue.currentData.items}
              />
            ))}
        </DataBoundary>
      )}
    </>
  );
}
