import { useState } from "react";
import { CalendarBlankIcon } from "@phosphor-icons/react";
import { APEX_ICONS } from "../../design-system/apex.tokens";
import {
  Panel,
  CircuitName,
  RaceStatus,
  EmptyState,
  ActionLink,
} from "../../components/ui";
import {
  useGetProfileQuery,
  useGetLayoutsQuery,
  useGetEventQuery,
  useGetCalendarQuery,
} from "../../api/archiveApi";
import {
  CircuitSilhouette,
  CountryFlag,
  selectLayout,
  countryForCircuit,
} from "../../components/visuals";
import { dateLabel, focusEvent, focusEventKind } from "./selectors";
import { entryName } from "./raceFormat";
import { DriverIdentity } from "../../components/DriverIdentity";
import { PodiumNationalities } from "./PodiumNationalities";
import { EventInsightDialog } from "./EventInsightDialog";
import { SeasonEventStrip } from "./SeasonEventStrip";
import {
  ConstructorIdentity,
  ConstructorIdentities,
} from "../../components/ConstructorIdentity";
export function RaceFocus({
  summary,
  snapshotId,
  includeSeasonProgress = true,
  compact = false,
  showCalendarAction = true,
  selectedEventId: suppliedSelectedEventId,
  onSelectEvent,
  onCloseEvent,
  className = "",
  headerOnly = false,
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
  const selectedEvent = calendarEvents.find(
    (item) => item.id === selectedEventId,
  );
  const layout = selectLayout(circuitLayouts.currentData?.items, event?.year);
  const country = countryForCircuit(
    event,
    circuitProfile.currentData,
    snapshotId,
  );
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
            status={
              focusKind === "next"
                ? "upcoming"
                : event.resultStatus || event.status
            }
          >
            {focusKind === "next"
              ? "upcoming"
              : event.resultStatus || event.status}
          </RaceStatus>
        </b>
      </div>
      <div className="race-focus-content">
        <div className="race-focus-copy">
          <p className="race-round">
            ROUND {event.round ?? "N/A"} OF{" "}
            {summary.season?.eventCount ?? "N/A"}
            {headerOnly && <CountryFlag country={country} image />}
          </p>
          <h2 id="race-focus-title">{event.name}</h2>
          <CircuitName
            name={event.circuit?.displayName || "Circuit not supplied"}
          />
          {headerOnly && (
            <p className="home-completed-date">
              <CalendarBlankIcon size={APEX_ICONS.action} aria-hidden />
              <time dateTime={event.schedule?.date || undefined}>
                {dateLabel(event.schedule?.date)}
              </time>
            </p>
          )}
          {compact && (
            <ActionLink
              to={`/events/${encodeURIComponent(event.id)}?${new URLSearchParams({ season: String(event.year), ...(headerOnly && snapshotId ? { snapshot: snapshotId } : {}) })}`}
            >
              Open race detail
            </ActionLink>
          )}
        </div>
        {focusKind === "latest" && !headerOnly && (
          <RacePodium
            detail={eventDetail.currentData?.detail}
            isFetching={eventDetail.isFetching}
            isError={eventDetail.isError}
            year={event.year}
          />
        )}
        <CircuitSilhouette
          compactLabel={headerOnly}
          layout={layout}
          circuitName={event.circuit?.displayName}
          country={country}
          size="hero"
          fallback="message"
        />
      </div>
      {includeSeasonProgress && (
        <SeasonEventStrip
          key={summary.season?.year}
          events={calendarEvents}
          selectedEventId={selectedEventId}
          onSelect={(selected) => {
            if (!isControlled) setInternalSelectedEventId(selected.id);
            onSelectEvent?.(selected);
          }}
        />
      )}
      {(!headerOnly || showCalendarAction) && (
        <div className="race-focus-bottom">
          {!compact && (
            <ActionLink
              to={`/events/${encodeURIComponent(event.id)}?season=${event.year}`}
            >
              Open race detail
            </ActionLink>
          )}
          <span>
            <CalendarBlankIcon size={APEX_ICONS.action} aria-hidden />
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
      )}
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

export function RacePodium({
  detail,
  isFetching,
  isError,
  year,
  aligned = false,
  headerAction,
  nationalityFlags = false,
  snapshotId,
}) {
  const podium = (detail?.podium || [])
    .filter((row) => row?.position >= 1 && row.position <= 3)
    .sort((a, b) => a.position - b.position);

  return (
    <section className="race-focus-results" aria-labelledby="race-result-title">
      <div className="race-focus-results-heading">
        <h3 className="eyebrow" id="race-result-title">
          RACE RESULT
        </h3>
        {headerAction === undefined ? (
          <span className="race-focus-results-note">
            {isFetching && !detail ? "Loading" : "Top three"}
          </span>
        ) : (
          headerAction
        )}
      </div>
      {podium.length ? (
        <ol
          className={`race-podium${aligned ? " race-podium--aligned" : ""}${nationalityFlags ? " race-podium--nationalities" : ""}`}
        >
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
                <DriverIdentity
                  number={row.entry?.number ?? row.entry?.driverNumber}
                  name={entryName(row.entry)}
                  presentation={aligned ? "home" : "record"}
                  team={
                    <ConstructorIdentity
                      constructor={row.entry?.constructor}
                      year={year}
                      presentation={aligned ? "championship" : "compact"}
                    />
                  }
                  stackOnMobile
                />
              </div>
              <div className="race-podium-block">
                <span className="race-podium-position">
                  <span className="sr-only">{`Position ${row.position}`}</span>
                  <span aria-hidden="true">{row.position}</span>
                </span>
                {nationalityFlags ? (
                  <PodiumNationalities
                    entry={row.entry}
                    snapshotId={snapshotId}
                  />
                ) : (
                  <span className="race-podium-points">
                    {row.points == null ? "—" : `${row.points} PTS`}
                  </span>
                )}
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

export function LeaderList({ entries, kind, year, sharedIdentity = false }) {
  return (
    <ol className={`leader-list leader-list--${kind}`}>
      {entries.map((row) => (
        <li key={row.id}>
          <span className="leader-rank">
            {row.rank == null ? (
              <>
                <span className="sr-only">Rank not supplied</span>
                <span aria-hidden="true">—</span>
              </>
            ) : (
              String(row.rank).padStart(2, "0")
            )}
          </span>
          <div>
            {kind === "drivers" ? (
              <DriverIdentity
                stackOnMobile
                presentation={sharedIdentity ? "home" : "record"}
                number={
                  row.number ?? row.entity?.number ?? row.entity?.driverNumber
                }
                name={row.entity.displayName}
                team={
                  row.constructors?.length > 0 ? (
                    <ConstructorIdentities
                      constructors={row.constructors}
                      year={year}
                      presentation={sharedIdentity ? "championship" : "compact"}
                    />
                  ) : null
                }
              />
            ) : (
              <>
                <div className="leader-driver-line">
                  <strong>
                    {kind === "constructors" ? (
                      <ConstructorIdentity
                        constructor={row.entity}
                        year={year}
                        presentation={
                          sharedIdentity ? "championship" : undefined
                        }
                      />
                    ) : (
                      row.entity.displayName
                    )}
                  </strong>
                </div>
                {row.constructors?.length > 0 && (
                  <p>
                    <ConstructorIdentities
                      constructors={row.constructors}
                      year={year}
                    />
                  </p>
                )}
              </>
            )}
          </div>
          <span className="leader-points">
            <strong>{row.points ?? "Not supplied"}</strong>
            <span>PTS</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
