import { useState } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import {
  archiveApi,
  useGetCalendarQuery,
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

export function CalendarEvents({ events, selectedId, onSelect }) {
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
              aria-pressed={event.id === selectedId}
              onClick={() => onSelect(event.id)}
            >
              {event.name}
            </button>
            <p>{event.circuit?.displayName || "Circuit not supplied"}</p>
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
          <StatusBadge>
            {event.status === "unknown" ? "Status not supplied" : event.status}
          </StatusBadge>
          {event.id === selectedId && (
            <div className="calendar-event-detail">
              <p>
                Selected round · Location not supplied by the calendar source.
              </p>
              <ActionLink
                to={`/events/${encodeURIComponent(event.id)}?season=${event.year}`}
              >
                Open race detail
              </ActionLink>
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

function SeasonCalendar({ year, selectedId, onSelect }) {
  const dispatch = useDispatch();
  const [pages, setPages] = useState([{}]);
  const query = useGetCalendarQuery({ year, ...pages.at(-1) });
  const data = query.currentData;
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
          {year} calendar · {data?.page.total ?? "Loading"} events
        </p>
        <Button variant="quiet" disabled={query.isFetching} onClick={restart}>
          Refresh calendar
        </Button>
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
              {selectedId &&
                !data.items.some((event) => event.id === selectedId) && (
                  <p className="calendar-explainer" role="status">
                    The selected event is not on this calendar page. No other
                    event has been selected.
                  </p>
                )}
              <CalendarEvents
                events={data.items}
                selectedId={selectedId}
                onSelect={onSelect}
              />
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
  const [params, setParams] = useSearchParams();
  const review = import.meta.env.DEV ? params.get("reviewState") : null;
  const simulated =
    import.meta.env.DEV && ["loading", "empty", "error"].includes(review);
  const catalogue = useGetSeasonsQuery(undefined, { skip: simulated });
  const year = selectedSeason(
    catalogue.currentData?.items,
    params.get("season"),
  );
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
            (year ? (
              <SeasonCalendar
                key={year}
                year={year}
                selectedId={params.get("event")}
                onSelect={(id) =>
                  setParams({ season: String(year), event: id })
                }
              />
            ) : (
              <EmptyState
                title={
                  params.has("season")
                    ? "This season is not in the archive"
                    : "The archive has no published seasons"
                }
                description="Choose an available season above. No data has been substituted for your selection."
              />
            ))}
        </DataBoundary>
      )}
    </>
  );
}
