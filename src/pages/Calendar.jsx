import { useState } from "react";
import { useDispatch } from "react-redux";
import useSeasonSearch from "../features/season/useSeasonSearch";
import {
  archiveApi,
  useGetCalendarQuery,
  useGetLayoutsQuery,
  useGetProfileQuery,
  useGetSeasonsQuery,
} from "../api/archiveApi";
import {
  selectedSeason,
  selectSeasonOptions,
  dateLabel,
} from "../features/season/selectors";
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
            Round {event.round ?? "not supplied"}
          </span>
          <div className="calendar-event-name">
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
            {event.schedule.startsAt &&
              ["minute", "second"].includes(event.schedule.timePrecision) && (
                <span>
                  {new Intl.DateTimeFormat("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "UTC",
                  }).format(new Date(event.schedule.startsAt))}{" "}
                  UTC
                </span>
              )}
          </div>
          <StatusBadge status={event.status}>
            {event.status === "unknown" ? "Status not supplied" : event.status}
          </StatusBadge>
          <div className="calendar-event-actions">
            <ActionLink
              to={`/events/${encodeURIComponent(event.id)}?season=${event.year}`}
            >
              Open race detail
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
                country={selectedCountry}
                size="compact"
                fallback="message"
              />
              <p>
                Selected round ·{" "}
                {selectedCountry ||
                  "Location not supplied by the calendar source."}
              </p>
              <p>
                {event.schedule.circuitTimeZone
                  ? `Circuit time zone: ${event.schedule.circuitTimeZone}`
                  : "Circuit time zone not supplied."}
              </p>
              {event.features.length ? (
                <ul aria-label="Available datasets">
                  {event.features.map((feature) => (
                    <li key={feature.key}>
                      {feature.key.replaceAll("-", " ")}: {feature.coverage}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No dataset coverage supplied for this event.</p>
              )}
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
  const latestResult = (data?.items || [])
    .filter((event) => event.status === "completed")
    .sort((a, b) => (b.round ?? 0) - (a.round ?? 0))[0];
  const nextRace = (data?.items || [])
    .filter((event) => ["scheduled", "upcoming"].includes(event.status))
    .sort((a, b) =>
      String(a.schedule.date || "").localeCompare(String(b.schedule.date || "")),
    )[0];
  const restart = () => {
    if (pages.length > 1) {
      setPages([{}]);
      dispatch(archiveApi.util.invalidateTags([{ type: "Season", id: year }]));
    } else query.refetch();
  };
  return (
    <>
      <div className="calendar-toolbar">
        <p>
          {year} calendar ·{" "}
          {data?.page.total != null
            ? `${data.page.total} events`
            : query.isLoading || query.isFetching
              ? "Loading event count"
              : "Event count not supplied"}
        </p>
        <div className="calendar-toolbar-actions">
          {latestResult && (
            <ActionLink
              to={`/events/${encodeURIComponent(latestResult.id)}?season=${year}`}
            >
              Open latest result
            </ActionLink>
          )}
          {nextRace && (
            <ActionLink
              to={`/events/${encodeURIComponent(nextRace.id)}?season=${year}`}
            >
              Open next race
            </ActionLink>
          )}
          <Button variant="quiet" disabled={query.isFetching} onClick={restart}>
            Refresh calendar
          </Button>
        </div>
      </div>
      <Panel title="Every round">
        <p className="calendar-explainer">
          Dates and statuses are shown as supplied. An unknown status does not
          mean an event has not happened. Select a round to inspect its dataset
          coverage.
        </p>
        <DataBoundary
          query={query}
          empty={query.isSuccess && !data?.items.length}
          onRetry={query.error?.status === 409 ? restart : query.refetch}
        >
          {data && (
            <>
              <div className="calendar-filter">
                <Select
                  label="Show rounds"
                  value={filter}
                  options={calendarFilters}
                  onChange={(event) => onSelect(null, event.target.value)}
                />
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
