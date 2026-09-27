import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import {
  archiveApi,
  useGetEventQuery,
  useGetPublicationConfigQuery,
  useGetSessionDataQuery,
} from "../../api/archiveApi";
import { RaceCountdown } from "../../components/RaceCountdown";
import { raceResultStatus } from "./raceResultStatus";

const PUBLICATION_CONFIG_RECOVERY_INTERVAL_MS = 30_000;

function displayUtc(timestamp) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(new Date(timestamp));
}

function durationLabel(milliseconds) {
  const units = [
    [60 * 60 * 1000, "hour"],
    [60 * 1000, "minute"],
    [1000, "second"],
  ];
  const [size, name] =
    units.find(([unit]) => milliseconds % unit === 0) || units[2];
  const amount = milliseconds / size;
  return `${amount} ${name}${amount === 1 ? "" : "s"}`;
}

function publishedState(resultQuery, shouldReadResults, activeWindow) {
  const rows = resultQuery.currentData?.items;
  if (Array.isArray(rows) && rows.length > 0) return "published";
  if (!shouldReadResults || resultQuery.isUninitialized) return "loading";
  if (resultQuery.isError) return activeWindow ? "checking" : "unavailable";
  if (resultQuery.isSuccess && Array.isArray(rows)) return "missing";
  return "loading";
}

function ResultStatusNote({ state }) {
  if (state === "published")
    return (
      <p className="overview-result-status-message overview-result-status-message--published">
        Published race results are now in this archive.
      </p>
    );
  if (state === "missing")
    return (
      <p className="overview-result-status-message">
        No race-result rows are published in this archive yet.
      </p>
    );
  if (state === "checking")
    return (
      <p className="overview-result-status-message">
        The archive has not confirmed race-result rows yet; it will retry during
        this configured window.
      </p>
    );
  if (state === "unavailable")
    return (
      <p className="overview-result-status-message overview-result-status-message--unavailable">
        The archive could not confirm whether race-result rows are published.
      </p>
    );
  return (
    <p className="overview-result-status-message">
      Checking the published race-result data in this archive…
    </p>
  );
}

export function RaceResultStatus({ event, now: suppliedNow }) {
  const [clockNow, setClockNow] = useState(() => Date.now());
  const dispatch = useDispatch();
  const invalidatedEvents = useRef(new Set());
  useEffect(() => {
    if (suppliedNow != null) return undefined;
    const timer = setInterval(() => setClockNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [suppliedNow]);
  const now = suppliedNow ?? clockNow;
  const configQuery = useGetPublicationConfigQuery();
  const configFailed = configQuery.isError;
  const refetchPublicationConfig = configQuery.refetch;
  const automaticConfig = configQuery.currentData?.automaticRaceResults;
  useEffect(() => {
    if (!configFailed) return undefined;
    const timer = setInterval(
      () => void refetchPublicationConfig(),
      PUBLICATION_CONFIG_RECOVERY_INTERVAL_MS,
    );
    return () => clearInterval(timer);
  }, [configFailed, refetchPublicationConfig]);
  const nowMs = typeof now === "number" ? now : Date.parse(now);
  const initialStatus = raceResultStatus(event, now, null, automaticConfig);
  const afterScheduledStart =
    (initialStatus.startsAt != null && nowMs >= initialStatus.startsAt) ||
    (initialStatus.startsAt == null && event?.status === "completed");

  // The normalizer derives this stable id from the published event identity,
  // even when a legacy event-detail fallback contains no session list.
  const canonicalRaceSessionId = event?.id ? `session:${event.id}:race` : null;
  const eventQuery = useGetEventQuery(
    { eventId: event?.id },
    {
      skip: !event?.id,
      pollingInterval:
        initialStatus.phase === "check-window" && initialStatus.automaticEnabled
          ? initialStatus.intervalMs
          : 0,
    },
  );
  const detailRaceSession = eventQuery.currentData?.detail?.sessions?.find(
    (session) => session.kind === "race",
  );
  const raceSessionId = canonicalRaceSessionId || detailRaceSession?.id;
  const shouldReadResults = Boolean(raceSessionId && afterScheduledStart);
  const resultQuery = useGetSessionDataQuery(
    {
      sessionId: raceSessionId,
      dataset: "results",
      limit: 1,
    },
    {
      skip: !shouldReadResults,
      pollingInterval:
        shouldReadResults &&
        initialStatus.phase === "check-window" &&
        initialStatus.automaticEnabled
          ? initialStatus.intervalMs
          : 0,
    },
  );
  const activeWindow =
    initialStatus.phase === "check-window" && initialStatus.automaticEnabled;
  const resultState = publishedState(
    resultQuery,
    shouldReadResults,
    activeWindow,
  );
  const status = raceResultStatus(
    event,
    now,
    resultState === "published" ? resultQuery.currentData.items : null,
    automaticConfig,
  );
  const previousPhase = useRef(status.phase);
  const refetchEvent = eventQuery.refetch;
  const refetchResults = resultQuery.refetch;

  useEffect(() => {
    if (
      resultState === "published" &&
      event?.id &&
      !invalidatedEvents.current.has(event.id)
    ) {
      invalidatedEvents.current.add(event.id);
      const tags = [{ type: "Event", id: event.id }];
      if (event.year != null) tags.push({ type: "Season", id: event.year });
      dispatch(archiveApi.util.invalidateTags(tags));
    }
  }, [dispatch, event?.id, event?.year, resultState]);

  useEffect(() => {
    const enteringCheckWindow =
      previousPhase.current === "grace" && status.phase === "check-window";
    const leavingCheckWindow =
      previousPhase.current === "check-window" &&
      status.phase === "window-ended";
    if (
      (enteringCheckWindow || leavingCheckWindow) &&
      shouldReadResults &&
      resultState !== "published"
    ) {
      void refetchEvent();
      void refetchResults();
    }
    previousPhase.current = status.phase;
  }, [
    refetchEvent,
    refetchResults,
    resultState,
    shouldReadResults,
    status.phase,
  ]);

  if (status.phase === "before-start")
    return (
      <RaceCountdown
        startsAt={event.schedule.startsAt}
        timePrecision={event.schedule.timePrecision}
        now={now}
        variant="wide"
        showTargetTime={false}
      />
    );

  if (status.phase === "published")
    return (
      <div
        className="overview-result-status"
        role="status"
        data-state="published"
      >
        <span className="overview-result-status-label">RACE RESULT</span>
        <ResultStatusNote state="published" />
      </div>
    );

  if (status.phase === "unknown-schedule")
    return (
      <div
        className="overview-result-status"
        role="status"
        data-state="unknown"
      >
        <RaceCountdown
          startsAt={event?.schedule?.startsAt}
          timePrecision={event?.schedule?.timePrecision}
          now={now}
          variant="wide"
          showTargetTime={false}
        />
        <span className="overview-result-status-label">RACE RESULT</span>
        <ResultStatusNote state={resultState} />
        <p className="overview-result-status-detail">
          This calendar entry has no precise scheduled start, so an
          automatic-check window cannot be timed.
        </p>
      </div>
    );

  if (status.phase === "after-start")
    return (
      <div
        className="overview-result-status"
        role="status"
        data-state="timing-unavailable"
      >
        <span className="overview-result-status-label">RACE RESULT</span>
        <ResultStatusNote state={resultState} />
        <p className="overview-result-status-detail">
          The API timing configuration is unavailable; this page does not
          estimate when automatic checks might run.
        </p>
      </div>
    );

  if (!status.automaticEnabled)
    return (
      <div
        className="overview-result-status"
        role="status"
        data-state="disabled"
      >
        <span className="overview-result-status-label">RACE RESULT</span>
        <ResultStatusNote state={resultState} />
        <p className="overview-result-status-detail">
          Automatic race-result checks are not enabled in the API configuration.
          Results may still appear when the provider publishes them.
        </p>
      </div>
    );

  if (status.phase === "grace")
    return (
      <div className="overview-result-status" role="status" data-state="grace">
        <RaceCountdown
          startsAt={new Date(status.activatesAt).toISOString()}
          timePrecision="minute"
          now={now}
          variant="wide"
          showTargetTime={false}
          heading="FIRST AUTOMATIC-CHECK WINDOW"
          countdownPhrase="First check window opens in"
        />
        <ResultStatusNote state={resultState} />
        <p className="overview-result-status-detail">
          When the configured scheduler is available, its first check is
          scheduled for {displayUtc(status.activatesAt)}. The calendar supplies
          no actual finish time, and provider publication timing cannot be
          promised.
        </p>
      </div>
    );

  if (status.phase === "check-window")
    return (
      <div
        className="overview-result-status"
        role="status"
        data-state="checking"
      >
        <span className="overview-result-status-label">RESULT PUBLICATION</span>
        <ResultStatusNote state={resultState} />
        <p className="overview-result-status-detail">
          When the configured scheduler is running, checks are scheduled every{" "}
          {durationLabel(status.intervalMs)} for up to{" "}
          {durationLabel(status.windowMs)}, through {displayUtc(status.endsAt)}.
          This window is anchored to scheduled start (+
          {durationLabel(status.graceMs)}); the calendar has no actual finish
          timestamp. Configuration is not a live scheduler heartbeat, and
          provider publication timing may vary.
        </p>
      </div>
    );

  return (
    <div className="overview-result-status" role="status" data-state="ended">
      <span className="overview-result-status-label">RESULT PUBLICATION</span>
      <ResultStatusNote state={resultState} />
      <p className="overview-result-status-detail">
        The configured scheduled-start-anchored check window ended at{" "}
        {displayUtc(status.endsAt)}. This does not indicate whether the
        scheduler ran or promise provider publication time.
      </p>
    </div>
  );
}
