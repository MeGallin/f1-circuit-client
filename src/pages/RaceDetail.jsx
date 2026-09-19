import { EntityLink } from "../features/entities/shared";
import { useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  archiveApi,
  useGetEventQuery,
  useGetSessionDataQuery,
} from "../api/archiveApi";
import {
  PageHeading,
  Panel,
  Metric,
  SourceNote,
  DataBoundary,
  EmptyState,
  ErrorState,
  Skeleton,
  Button,
  ActionLink,
  Select,
  Input,
  Tabs,
  DataTable,
} from "../components/ui";
import { dateLabel } from "../features/season/selectors";
import {
  duration,
  entryName,
  gapLabel,
  gridLabel,
  missing,
} from "../features/season/raceFormat";
import "../styles/race.css";

const views = [
  { value: "results", label: "Results" },
  { value: "qualifying", label: "Qualifying" },
  { value: "laps", label: "Laps" },
  { value: "pit-stops", label: "Pit stops" },
  { value: "stints", label: "Stints" },
  { value: "weather", label: "Weather" },
  { value: "race-control", label: "Race control" },
  { value: "penalties", label: "Penalties" },
  { value: "positions", label: "Positions" },
  { value: "intervals", label: "Intervals" },
  { value: "overtakes", label: "Overtakes" },
  { value: "radio", label: "Radio" },
  { value: "telemetry", label: "Telemetry" },
  { value: "locations", label: "Locations" },
];

const SERIES_DATASETS = new Set(["telemetry", "locations"]);
const SERIES_RESOLUTIONS = [
  { value: "1s", label: "1 second" },
  { value: "100ms", label: "100 milliseconds" },
  { value: "raw", label: "Raw observations" },
];
const SERIES_WINDOW_MS = 120 * 1000;

const advancedDatasetDefinitions = {
  stints: {
    caption: "Published tyre stints",
    columns: [
      ["entryId", "Entry", (row, names) => names[row.entryId] || row.entryId],
      ["sequence", "Stint"],
      [
        "laps",
        "Lap range",
        (row) => `${row.startLap ?? missing} – ${row.endLap ?? "ongoing"}`,
      ],
      ["compound", "Compound", (row) => row.compoundLabel || row.compoundClass],
      ["tyreState", "Tyre state"],
      ["tyreAgeAtStart", "Age at start"],
    ],
  },
  weather: {
    caption: "Published weather observations",
    columns: [
      ["timestamp", "Time", dateTimeLabel],
      ["observationKind", "Observation"],
      [
        "airTemperatureC",
        "Air",
        (row) => numberWithUnit(row.airTemperatureC, "°C"),
      ],
      [
        "trackTemperatureC",
        "Track",
        (row) => numberWithUnit(row.trackTemperatureC, "°C"),
      ],
      [
        "humidityPercent",
        "Humidity",
        (row) => numberWithUnit(row.humidityPercent, "%"),
      ],
      ["rainfall", "Rainfall", (row) => booleanLabel(row)],
      ["windSpeedMs", "Wind", (row) => numberWithUnit(row.windSpeedMs, "m/s")],
    ],
  },
  "race-control": {
    caption: "Race control messages",
    columns: [
      ["timestamp", "Time", dateTimeLabel],
      ["lap", "Lap"],
      ["category", "Category"],
      ["flag", "Flag"],
      ["message", "Message"],
      ["scope", "Scope"],
    ],
  },
  penalties: {
    caption: "Published penalties",
    columns: [
      ["entryIds", "Entries", (row, names) => entryList(row.entryIds, names)],
      ["type", "Type"],
      [
        "amount",
        "Amount",
        (row) => `${row.amount ?? missing}${row.unit ? ` ${row.unit}` : ""}`,
      ],
      ["appliesTo", "Applies to"],
      ["status", "Status"],
      ["issuedAt", "Issued", dateTimeLabel],
    ],
  },
  positions: {
    caption: "Published position timeline",
    columns: [
      ["entryId", "Entry", (row, names) => names[row.entryId] || row.entryId],
      ["timestamp", "Time", dateTimeLabel],
      ["position", "Position"],
    ],
  },
  intervals: {
    caption: "Published intervals",
    columns: [
      ["entryId", "Entry", (row, names) => names[row.entryId] || row.entryId],
      ["timestamp", "Time", dateTimeLabel],
      ["gapToLeader", "Gap to leader", (row) => gapLabel(row.gapToLeader)],
      ["intervalAhead", "Interval ahead", (row) => gapLabel(row.intervalAhead)],
    ],
  },
  overtakes: {
    caption: "Published overtakes",
    columns: [
      ["timestamp", "Time", dateTimeLabel],
      ["lap", "Lap"],
      [
        "passingEntryId",
        "Passing entry",
        (row, names) => names[row.passingEntryId] || row.passingEntryId,
      ],
      [
        "passedEntryId",
        "Passed entry",
        (row, names) => names[row.passedEntryId] || row.passedEntryId,
      ],
      ["definitionVersion", "Definition"],
    ],
  },
  radio: {
    caption: "Published radio references",
    columns: [
      ["entryId", "Entry", (row, names) => names[row.entryId] || row.entryId],
      ["timestamp", "Time", dateTimeLabel],
      ["title", "Reference", radioReference],
      ["publicationPermission", "Permission"],
      ["attribution", "Attribution"],
    ],
  },
  telemetry: {
    caption: "Published telemetry samples",
    columns: [
      ["timestamp", "Time", dateTimeLabel],
      ["speedKph", "Speed", (row) => numberWithUnit(row.speedKph, "km/h")],
      [
        "throttlePercent",
        "Throttle",
        (row) => numberWithUnit(row.throttlePercent, "%"),
      ],
      ["brakePressed", "Brake", (row) => booleanLabel(row, "brakePressed")],
      ["gear", "Gear"],
      ["rpm", "RPM"],
      ["drs", "DRS"],
    ],
  },
  locations: {
    caption: "Published location samples",
    columns: [
      ["timestamp", "Time", dateTimeLabel],
      ["x", "X", (row) => numberWithUnit(row.x, row.unit)],
      ["y", "Y", (row) => numberWithUnit(row.y, row.unit)],
      ["z", "Z", (row) => numberWithUnit(row.z, row.unit)],
      ["coordinateSystem", "Coordinate system"],
    ],
  },
};

function dateTimeLabel(row) {
  if (!row.timestamp) return missing;
  const value = new Date(row.timestamp);
  return Number.isNaN(value.valueOf())
    ? missing
    : `${value.toLocaleString("en-GB", { timeZone: "UTC" })} UTC`;
}

function numberWithUnit(value, unit) {
  return value == null ? missing : `${value} ${unit}`;
}

function booleanLabel(row, key = "rainfall") {
  return row[key] == null ? missing : row[key] ? "Yes" : "No";
}

function entryList(ids, names) {
  return ids?.length ? ids.map((id) => names[id] || id).join(" / ") : missing;
}

function radioReference(row) {
  if (!row.title) return missing;
  if (row.publicationPermission !== "approved" || !row.referenceUrl)
    return row.title;
  try {
    const url = new URL(row.referenceUrl);
    if (!["http:", "https:"].includes(url.protocol)) return row.title;
    return (
      <a href={url.toString()} target="_blank" rel="noreferrer">
        {row.title}
      </a>
    );
  } catch {
    return row.title;
  }
}

export function AdvancedRecords({ rows, dataset, names }) {
  const definition = advancedDatasetDefinitions[dataset];
  if (!definition) return null;
  return (
    <DataTable
      caption={definition.caption}
      rows={rows}
      rowKey={(row) => row.id}
      columns={definition.columns.map(([key, label, render]) => ({
        key,
        label,
        render: render
          ? (row) => render(row, names)
          : (row) => row[key] ?? missing,
      }))}
    />
  );
}

export function toUtcIso(value) {
  const input = String(value || "").trim();
  if (!input) return null;
  const withZone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(input)
    ? input
    : `${input}:00Z`;
  const timestamp = Date.parse(withZone);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
}

function dateTimeInputValue(value) {
  const timestamp = value ? new Date(value) : null;
  if (!timestamp || Number.isNaN(timestamp.valueOf())) return "";
  return (
    [
      timestamp.getUTCFullYear(),
      String(timestamp.getUTCMonth() + 1).padStart(2, "0"),
      String(timestamp.getUTCDate()).padStart(2, "0"),
    ].join("-") +
    `T${String(timestamp.getUTCHours()).padStart(2, "0")}:${String(timestamp.getUTCMinutes()).padStart(2, "0")}`
  );
}

export function seriesWindowError(driverId, from, to) {
  if (!driverId) return "Choose a driver before requesting a series.";
  if (!from || !to) return "Enter both UTC start and end times.";
  const start = Date.parse(from);
  const end = Date.parse(to);
  if (!Number.isFinite(start) || !Number.isFinite(end))
    return "Use valid UTC date and time values.";
  if (end <= start) return "The end time must be after the start time.";
  if (end - start > SERIES_WINDOW_MS)
    return "Choose a window of 120 seconds or less.";
  return "";
}

function SeriesWindowControls({
  dataset,
  params,
  setParams,
  drivers,
  identities,
}) {
  const driver = params.get("driver") || "";
  const from = params.get("from") || "";
  const to = params.get("to") || "";
  const resolution = params.get("resolution") || "1s";
  const [error, setError] = useState("");
  const currentError = seriesWindowError(driver, toUtcIso(from), toUtcIso(to));
  const options = drivers.length
    ? [
        { value: "", label: "Choose a driver" },
        ...drivers.map((item) => ({ value: item.id, label: item.name })),
      ]
    : [{ value: "", label: "No driver entries supplied" }];
  return (
    <form
      key={`${dataset}:${driver}:${from}:${to}:${resolution}`}
      className="series-controls"
      onSubmit={(event) => {
        event.preventDefault();
        const values = new FormData(event.currentTarget);
        const nextDriver = String(values.get("driver") || "");
        const nextFrom = toUtcIso(values.get("from"));
        const nextTo = toUtcIso(values.get("to"));
        const nextError = seriesWindowError(nextDriver, nextFrom, nextTo);
        setError(nextError);
        if (nextError) return;
        const next = new URLSearchParams(params);
        next.set("driver", nextDriver);
        next.set("from", nextFrom);
        next.set("to", nextTo);
        next.set("resolution", String(values.get("resolution") || "1s"));
        next.delete("cursor");
        setParams(next);
      }}
    >
      <div className="series-controls-heading">
        <strong>Bounded series window</strong>
        <span>UTC · maximum 120 seconds · no interpolation</span>
      </div>
      <div className="series-controls-fields">
        <Select
          label="Driver"
          name="driver"
          defaultValue={driver}
          options={options}
        />
        <Input
          label="From (UTC)"
          name="from"
          type="datetime-local"
          defaultValue={dateTimeInputValue(from)}
          required
        />
        <Input
          label="To (UTC)"
          name="to"
          type="datetime-local"
          defaultValue={dateTimeInputValue(to)}
          required
        />
        <Select
          label="Resolution"
          name="resolution"
          defaultValue={resolution}
          options={SERIES_RESOLUTIONS}
        />
      </div>
      <Button type="submit" variant="secondary" disabled={!drivers.length}>
        Load {dataset}
      </Button>
      {(error || currentError) && (
        <p className="series-controls-error" role="status">
          {error || currentError}
        </p>
      )}
      {!drivers.length && !identities.isFetching && (
        <p className="series-controls-note">
          No driver identity is published for this session, so a series cannot
          be requested safely.
        </p>
      )}
    </form>
  );
}

function sessionDrivers(items) {
  const drivers = new Map();
  for (const row of items || []) {
    for (const driver of row.entry?.drivers || []) {
      if (!drivers.has(driver.id))
        drivers.set(driver.id, {
          id: driver.id,
          name: driver.displayName || driver.id,
        });
    }
  }
  return [...drivers.values()];
}
function Facts({ items }) {
  return (
    <dl className="race-facts">
      {items.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value ?? missing}</dd>
        </div>
      ))}
    </dl>
  );
}
export function RaceRecords({ rows, dataset, names = {} }) {
  return (
    <ol className="race-records">
      {rows.map((row) => (
        <li key={row.id}>
          <div className="race-record-heading">
            <strong>
              {row.entry
                ? row.entry.drivers.map((driver, index) => (
                    <span key={driver.id}>
                      {index > 0 ? " / " : ""}
                      <EntityLink entity={driver} kind="driver" />
                    </span>
                  ))
                : names[row.entryId] || "Driver name not supplied"}
            </strong>
            <span>
              {(row.entry?.constructor ? (
                <EntityLink entity={row.entry.constructor} kind="constructor" />
              ) : null) || (row.entry ? "Constructor not supplied" : "")}
            </span>
          </div>
          {dataset === "results" && (
            <Facts
              items={[
                ["Position", row.position],
                ["Grid", gridLabel(row.grid)],
                ["Status", row.statusLabel],
                ["Laps", row.lapsCompleted],
                ["Points", row.points],
                ["Gap", gapLabel(row.gap)],
                ["Elapsed", duration(row.elapsedMs)],
                ["Fastest lap", duration(row.fastestLap?.durationMs)],
                ["Fastest lap number", row.fastestLap?.lapNumber],
                ["Fastest lap rank", row.fastestLap?.rank],
              ]}
            />
          )}
          {dataset === "qualifying" && (
            <Facts
              items={[
                ["Position", row.position],
                ...row.phases.map((phase) => [
                  phase.label,
                  `${duration(phase.bestTimeMs)} · ${phase.participation.replaceAll("-", " ")}`,
                ]),
              ]}
            />
          )}
          {dataset === "laps" && (
            <Facts
              items={[
                ["Lap", row.lapNumber],
                ["Time", duration(row.durationMs)],
                ["Validity", row.validity],
                [
                  "Pit in",
                  row.isPitInLap == null
                    ? missing
                    : row.isPitInLap
                      ? "Yes"
                      : "No",
                ],
                [
                  "Pit out",
                  row.isPitOutLap == null
                    ? missing
                    : row.isPitOutLap
                      ? "Yes"
                      : "No",
                ],
                ...row.sectors.map((sector) => [
                  `Sector ${sector.index}`,
                  duration(sector.durationMs),
                ]),
              ]}
            />
          )}
          {dataset === "pit-stops" && (
            <Facts
              items={[
                ["Stop", row.sequence],
                ["Lap", row.lap],
                ["Pit lane duration", duration(row.laneDurationMs)],
                ["Stationary duration", duration(row.stationaryDurationMs)],
              ]}
            />
          )}
        </li>
      ))}
    </ol>
  );
}
function SessionData({
  session,
  dataset,
  snapshotId,
  params,
  setParams,
  onSnapshotReset,
}) {
  const cursor = params.get("cursor") || undefined;
  const isSeries = SERIES_DATASETS.has(dataset);
  const driverId = params.get("driver") || "";
  const from = toUtcIso(params.get("from"));
  const to = toUtcIso(params.get("to"));
  const seriesError = isSeries ? seriesWindowError(driverId, from, to) : "";
  const seriesReady = !isSeries || !seriesError;
  const query = useGetSessionDataQuery(
    {
      sessionId: session.id,
      dataset,
      snapshotId,
      cursor,
      driverId: isSeries ? driverId : undefined,
      from: isSeries ? from : undefined,
      to: isSeries ? to : undefined,
      resolution: isSeries ? params.get("resolution") || "1s" : undefined,
      limit: isSeries ? 1000 : undefined,
    },
    { skip: !seriesReady },
  );
  const identities = useGetSessionDataQuery(
    { sessionId: session.id, dataset: "results", snapshotId, limit: 200 },
    {
      skip: ![
        "laps",
        "pit-stops",
        "stints",
        "penalties",
        "positions",
        "intervals",
        "overtakes",
        "radio",
        "telemetry",
        "locations",
      ].includes(dataset),
    },
  );
  const drivers = sessionDrivers(identities.currentData?.items);
  const names = Object.fromEntries(
    (identities.currentData?.items || []).map((row) => [
      row.entry?.id,
      entryName(row.entry),
    ]),
  );
  const data = query.currentData;
  const first = () => {
    const next = new URLSearchParams(params);
    next.delete("cursor");
    setParams(next);
  };
  const nextPage = () => {
    const next = new URLSearchParams(params);
    next.set("cursor", data.page.nextCursor);
    next.set("snapshot", data.meta.snapshotId);
    next.set("session", session.id);
    next.set("view", dataset);
    setParams(next);
  };
  return (
    <>
      <p className="race-note">
        {session.label} · {dateLabel(session.schedule.date)} ·{" "}
        {session.status === "unknown" ? "Status not supplied" : session.status}
      </p>
      {isSeries && (
        <SeriesWindowControls
          dataset={dataset}
          params={params}
          setParams={setParams}
          drivers={drivers}
          identities={identities}
        />
      )}
      <SourceNote meta={data?.meta} />
      {isSeries && !seriesReady ? (
        <EmptyState
          title="Choose a bounded window"
          description="Select a driver and a UTC window of 120 seconds or less before requesting this series."
        />
      ) : (
        <DataBoundary
          query={query}
          empty={query.isSuccess && !data?.items.length}
          onRetry={
            query.error?.status === 409 ? onSnapshotReset : query.refetch
          }
        >
          {data &&
            (["results", "qualifying", "laps", "pit-stops"].includes(
              dataset,
            ) ? (
              <RaceRecords rows={data.items} dataset={dataset} names={names} />
            ) : (
              <AdvancedRecords
                rows={data.items}
                dataset={dataset}
                names={names}
              />
            ))}
        </DataBoundary>
      )}
      {data && (
        <nav className="race-pagination" aria-label="Session data pages">
          <Button
            variant="quiet"
            disabled={!cursor || query.isFetching}
            onClick={first}
          >
            First page
          </Button>
          <span>
            {data.items.length} shown · {data.page.total ?? "Unknown total"}{" "}
            records
          </span>
          <Button
            disabled={!data.page.hasMore || query.isFetching}
            onClick={nextPage}
          >
            Next page
          </Button>
        </nav>
      )}
    </>
  );
}

function Detail({ data, params, setParams, refresh }) {
  const { detail, meta } = data;
  const { event, sessions } = detail;
  const fastestEntries = useGetSessionDataQuery(
    {
      sessionId: detail.fastestLap?.sessionId,
      dataset: "results",
      snapshotId: meta.snapshotId,
      limit: 200,
    },
    { skip: !detail.fastestLap },
  );
  const fastestEntry = fastestEntries.currentData?.items.find(
    (row) => row.entry.id === detail.fastestLap?.entryId,
  )?.entry;
  const requestedView = params.get("view") || "results";
  const validView = views.some((view) => view.value === requestedView);
  const session = params.has("session")
    ? sessions.find((item) => item.id === params.get("session"))
    : sessions.find(
        (item) =>
          item.kind ===
          (requestedView === "qualifying" ? "qualifying" : "race"),
      ) || sessions[0];
  const update = (values) => {
    const next = new URLSearchParams({ season: String(event.year), ...values });
    setParams(next);
  };
  const changeView = (view) => {
    const preferred =
      view === "qualifying"
        ? sessions.find((item) =>
            ["qualifying", "sprint-qualifying"].includes(item.kind),
          )
        : session?.kind === "qualifying"
          ? sessions.find((item) => item.kind === "race")
          : session;
    update({ view, ...(preferred ? { session: preferred.id } : {}) });
  };
  return (
    <>
      <PageHeading
        eyebrow={`ROUND ${event.round ?? "NOT SUPPLIED"} / ${event.year}`}
        title={event.name}
        description={`${event.circuit?.displayName || "Circuit not supplied"} · ${dateLabel(event.schedule.date)}`}
        actions={
          <ActionLink
            to={`/calendar?season=${event.year}&event=${encodeURIComponent(event.id)}`}
          >
            Back to calendar
          </ActionLink>
        }
      />
      <div className="race-summary">
        <Metric
          label="Event status"
          value={event.status === "unknown" ? missing : event.status}
        />
        <Metric
          label="Winner"
          value={detail.winner ? entryName(detail.winner) : missing}
        />
        <Metric
          label="Fastest lap supplied"
          value={duration(detail.fastestLap?.durationMs)}
          detail={
            detail.fastestLap
              ? `${fastestEntry ? entryName(fastestEntry) : "Driver name not supplied"} · ${detail.fastestLap.lapNumber == null ? "Lap number not supplied" : `Lap ${detail.fastestLap.lapNumber}`} · validity ${detail.fastestLap.validity}`
              : "No fastest lap supplied"
          }
        />
      </div>
      <SourceNote meta={meta} />
      <details className="race-coverage">
        <summary>Event coverage and session schedule</summary>
        <ul>
          {event.features.map((feature) => (
            <li key={feature.key}>
              {feature.key.replaceAll("-", " ")}: {feature.coverage}
            </li>
          ))}
        </ul>
        {!event.features.length && <p>No dataset coverage supplied.</p>}
        <ul>
          {sessions.map((item) => (
            <li key={item.id}>
              {item.label} · {dateLabel(item.schedule.date)} ·{" "}
              {item.status === "unknown" ? "Status not supplied" : item.status}
            </li>
          ))}
        </ul>
      </details>
      <Panel
        title="Session archive"
        action={
          <Button variant="quiet" onClick={refresh}>
            Refresh event
          </Button>
        }
      >
        {sessions.length ? (
          <>
            <div className="race-session-picker">
              <Select
                label="Session"
                value={session?.id || ""}
                options={[
                  ...(!session
                    ? [{ value: "", label: "Choose a session" }]
                    : []),
                  ...sessions.map((item) => ({
                    value: item.id,
                    label: item.label,
                  })),
                ]}
                onChange={(e) =>
                  update({ session: e.target.value, view: requestedView })
                }
              />
            </div>
            <Tabs
              label="Session datasets"
              items={views}
              value={validView ? requestedView : ""}
              onChange={changeView}
            >
              {!validView ? (
                <EmptyState
                  title="Unknown dataset selection"
                  description="Choose one of the available dataset tabs."
                />
              ) : !session ? (
                <EmptyState
                  title="This session is not available"
                  description="Choose a session supplied for this event. No other session has been substituted."
                />
              ) : (
                <SessionData
                  key={`${session.id}:${requestedView}`}
                  session={session}
                  dataset={requestedView}
                  snapshotId={meta.snapshotId}
                  params={params}
                  setParams={setParams}
                  onSnapshotReset={refresh}
                />
              )}
            </Tabs>
          </>
        ) : (
          <EmptyState
            title="No sessions in this archive"
            description="The event is known, but session data has not been published."
          />
        )}
      </Panel>
    </>
  );
}

export default function RaceDetail() {
  const dispatch = useDispatch();
  const { eventId } = useParams();
  const [params, setParams] = useSearchParams();
  const review = import.meta.env.DEV ? params.get("reviewState") : null;
  const simulated =
    import.meta.env.DEV && ["loading", "empty", "error"].includes(review);
  const query = useGetEventQuery(
    { eventId, snapshotId: params.get("snapshot") || undefined },
    { skip: simulated },
  );
  const eventYear = query.currentData?.detail?.event.year;
  useEffect(() => {
    if (eventYear && !params.has("season")) {
      const next = new URLSearchParams(params);
      next.set("season", String(eventYear));
      setParams(next, { replace: true });
    }
  }, [eventYear, params, setParams]);
  const refresh = () => {
    const next = new URLSearchParams(params);
    next.delete("snapshot");
    next.delete("cursor");
    next.delete("reviewState");
    setParams(next);
    if (!simulated && params.has("snapshot"))
      dispatch(
        archiveApi.util.invalidateTags([{ type: "Event", id: eventId }]),
      );
    if (!simulated && !params.has("snapshot")) query.refetch();
  };
  if (simulated)
    return (
      <>
        <PageHeading
          title="Race detail"
          eyebrow="DEVELOPMENT STATE REVIEW"
          description="State simulation only. No race data or actual service failure is represented."
        />
        <Panel title="Event request state">
          {review === "loading" ? (
            <Skeleton />
          ) : review === "error" ? (
            <ErrorState onRetry={refresh} />
          ) : (
            <EmptyState />
          )}
          <Button variant="quiet" onClick={refresh}>
            Return to real data
          </Button>
        </Panel>
      </>
    );
  return (
    <>
      {!query.currentData?.detail && (
        <PageHeading
          title="Race detail"
          description="Event and session records from the historical archive."
        />
      )}
      <DataBoundary
        query={query}
        empty={query.isSuccess && !query.currentData?.detail}
        onRetry={query.error?.status === 409 ? refresh : query.refetch}
      >
        {eventYear &&
        params.has("season") &&
        params.get("season") !== String(eventYear) ? (
          <>
            <PageHeading
              title="Event and season do not match"
              description={`This event belongs to ${eventYear}. No results have been shown for the selected season.`}
            />
            <ActionLink
              to={`/calendar?season=${encodeURIComponent(params.get("season"))}`}
            >
              Return to selected season
            </ActionLink>
            <ActionLink
              to={`/events/${encodeURIComponent(eventId)}?season=${eventYear}`}
            >
              Open this event in {eventYear}
            </ActionLink>
          </>
        ) : (
          query.currentData?.detail && (
            <Detail
              data={query.currentData}
              params={params}
              setParams={setParams}
              refresh={refresh}
            />
          )
        )}
      </DataBoundary>
      {!query.currentData?.detail && (
        <SourceNote meta={query.currentData?.meta} />
      )}
    </>
  );
}
