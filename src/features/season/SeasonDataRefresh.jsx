import { useEffect, useRef, useState } from "react";
import { ArrowClockwiseIcon } from "@phosphor-icons/react";
import { Button, StatusBadge } from "../../components/ui";
import { useRefreshDataMutation } from "../../api/archiveApi";
import { runtimeYear } from "./selectors";

const outcomeLabels = {
  updated: "Updated",
  unchanged: "Unchanged",
  pending: "Pending",
  busy: "Busy",
  cooldown: "Cooldown",
  "no-race": "No race",
};
const COUNTDOWN_TICK_MS = 1000;
const cooldownOutcomes = new Set([
  "updated",
  "unchanged",
  "pending",
  "cooldown",
  "busy",
]);

function cooldownLabel(milliseconds) {
  const seconds = Math.ceil(milliseconds / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function retryDelayLabel(milliseconds) {
  const seconds = Math.ceil(milliseconds / 1000);
  if (seconds < 60) return `${seconds} seconds`;
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.ceil(minutes / 60);
  return `${hours} hours`;
}

function outcomeMessage(outcome) {
  const message = outcome.message.trim() || "The source check completed.";
  const retry =
    outcome.status === "busy" &&
    Number.isSafeInteger(outcome.retryAfterMs) &&
    outcome.retryAfterMs > 0
      ? ` Try again in ${retryDelayLabel(outcome.retryAfterMs)}.`
      : "";
  const checked = outcome.checkedAt
    ? ` Checked ${new Intl.DateTimeFormat("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "UTC",
      }).format(new Date(outcome.checkedAt))} UTC.`
    : "";
  return `${message}${retry}${checked}`;
}

export function refreshErrorMessage(error) {
  if (error?.status === "TIMEOUT_ERROR")
    return "The source check took too long. Your published data is still available. Try again shortly.";
  const status = Number.isInteger(error?.status) ? ` (${error.status})` : "";
  const message =
    error?.data?.error?.message ||
    error?.data?.message ||
    error?.error ||
    "The source refresh could not be completed. Try again later.";
  return `Source refresh failed${status}: ${message}`;
}

export function SeasonDataRefresh(props) {
  return <SeasonDataRefreshState key={props.year} {...props} />;
}

function SeasonDataRefreshState({
  year,
  archiveIsFetching = false,
  onArchiveRefresh,
}) {
  const [refreshData, refreshState] = useRefreshDataMutation();
  const [feedback, setFeedback] = useState(null);
  const [cooldown, setCooldown] = useState(null);
  const [remainingMs, setRemainingMs] = useState(0);
  const mounted = useRef(true);
  const request = useRef(null);
  const isCurrentSeason = Number(year) === runtimeYear();

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      request.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (cooldown === null) return;
    const ticker = setInterval(() => {
      const remaining = Math.max(0, cooldown - Date.now());
      setRemainingMs(remaining);
      if (remaining === 0) {
        clearInterval(ticker);
        setCooldown(null);
      }
    }, COUNTDOWN_TICK_MS);
    return () => clearInterval(ticker);
  }, [cooldown]);

  async function refresh() {
    setFeedback(null);
    if (!isCurrentSeason) {
      onArchiveRefresh?.();
      return;
    }

    setFeedback({
      type: "progress",
      message: "Checking the source for new race data…",
    });
    try {
      request.current = refreshData({ season: Number(year) });
      const outcome = await request.current.unwrap();
      if (!mounted.current) return;
      if (
        cooldownOutcomes.has(outcome.status) &&
        Number.isSafeInteger(outcome.retryAfterMs) &&
        outcome.retryAfterMs > 0
      ) {
        setRemainingMs(outcome.retryAfterMs);
        setCooldown(Date.now() + outcome.retryAfterMs);
      }
      setFeedback({ type: outcome.status, message: outcomeMessage(outcome) });
    } catch (error) {
      if (mounted.current)
        setFeedback({ type: "error", message: refreshErrorMessage(error) });
    } finally {
      try {
        if (mounted.current) await onArchiveRefresh?.();
      } catch {
        // The archive query owns and displays its own refetch error state.
      }
    }
  }

  const busy = isCurrentSeason ? refreshState.isLoading : archiveIsFetching;
  const feedbackLabel =
    feedback?.type === "progress"
      ? "Checking"
      : feedback?.type === "error"
        ? "Unavailable"
        : outcomeLabels[feedback?.type];
  const feedbackTone =
    feedback?.type === "updated"
      ? "success"
      : ["pending", "busy", "cooldown", "no-race", "error"].includes(
            feedback?.type,
          )
        ? "warning"
        : "neutral";
  return (
    <>
      <div className="overview-toolbar">
        <span>
          {isCurrentSeason ? "Current season" : "Historical archive"} · {year}
        </span>
        {cooldown !== null && remainingMs > 0 ? (
          <span
            role="timer"
            aria-live="off"
            aria-label={`Refresh available in ${cooldownLabel(remainingMs)}`}
          >
            Refresh available in {cooldownLabel(remainingMs)}
          </span>
        ) : (
          <Button variant="quiet" onClick={refresh} disabled={busy}>
            <ArrowClockwiseIcon aria-hidden size={18} />
            {busy
              ? isCurrentSeason
                ? "Checking source…"
                : "Refreshing archive…"
              : "Refresh data"}
          </Button>
        )}
      </div>
      {feedback && feedback.type !== "cooldown" && (
        <p
          className="refresh-note"
          data-state={feedback.type}
          role={feedback.type === "error" ? "alert" : "status"}
        >
          <StatusBadge tone={feedbackTone}>{feedbackLabel}</StatusBadge>{" "}
          {feedback.message}
        </p>
      )}
    </>
  );
}
