import { useEffect, useMemo, useState } from "react";
import "../styles/race-countdown.css";

const PRECISE_TIME = new Set(["minute", "second"]);
const MONTHS_IN_YEAR = 12;
const MILLISECONDS = {
  week: 7 * 24 * 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
  hour: 60 * 60 * 1000,
  minute: 60 * 1000,
  second: 1000,
};

function addUtcMonths(date, months) {
  const result = new Date(date);
  const day = result.getUTCDate();
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + months);
  const lastDay = new Date(
    Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0),
  ).getUTCDate();
  result.setUTCDate(Math.min(day, lastDay));
  return result;
}

function calendarMonthsBetween(start, end) {
  let months =
    (end.getUTCFullYear() - start.getUTCFullYear()) * MONTHS_IN_YEAR +
    end.getUTCMonth() -
    start.getUTCMonth();
  if (months > 0 && addUtcMonths(start, months) > end) months -= 1;
  return Math.max(0, months);
}

function unitName(unit) {
  return `${unit}s`;
}

function unitLabel(value, unit) {
  return `${value} ${unitName(unit)}`;
}

export function getCountdownParts(startsAt, now = Date.now()) {
  const targetMs = Date.parse(startsAt || "");
  const nowMs = typeof now === "number" ? now : Date.parse(now);
  if (!Number.isFinite(targetMs) || !Number.isFinite(nowMs) || targetMs <= nowMs)
    return [];

  const target = new Date(targetMs);
  let cursor = new Date(nowMs);
  const months = calendarMonthsBetween(cursor, target);
  cursor = addUtcMonths(cursor, months);
  let remaining = targetMs - cursor.getTime();
  const weeks = Math.floor(remaining / MILLISECONDS.week);
  remaining -= weeks * MILLISECONDS.week;
  const days = Math.floor(remaining / MILLISECONDS.day);
  remaining -= days * MILLISECONDS.day;
  const hours = Math.floor(remaining / MILLISECONDS.hour);
  remaining -= hours * MILLISECONDS.hour;
  const minutes = Math.floor(remaining / MILLISECONDS.minute);
  remaining -= minutes * MILLISECONDS.minute;
  let seconds = Math.floor(remaining / MILLISECONDS.second);
  if (!months && !weeks && !days && !hours && !minutes && !seconds)
    seconds = 1;

  return [
    [months, "month"],
    [weeks, "week"],
    [days, "day"],
    [hours, "hour"],
    [minutes, "minute"],
    [seconds, "second"],
  ]
    .filter(([value]) => value > 0)
    .map(([value, unit]) => ({ value, unit, label: unitLabel(value, unit) }));
}

function targetTimeLabel(startsAt) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(new Date(startsAt));
}

export function RaceCountdown({ startsAt, timePrecision, now, variant = "default" }) {
  const [currentTime, setCurrentTime] = useState(() => now ?? Date.now());
  useEffect(() => {
    if (now != null) return undefined;
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [now]);

  const targetMs = Date.parse(startsAt || "");
  const parts = useMemo(
    () => getCountdownParts(startsAt, currentTime),
    [startsAt, currentTime],
  );
  const hasPreciseTime = PRECISE_TIME.has(timePrecision) && Number.isFinite(targetMs);

  if (!hasPreciseTime)
    return (
      <p className="race-countdown race-countdown--unavailable">
        Race start time not supplied by the schedule.
      </p>
    );

  if (!parts.length)
    return (
      <p className="race-countdown race-countdown--elapsed">
        Race start time has passed; waiting for the archive to update.
      </p>
    );

  const accessibleLabel = parts.map((part) => part.label).join(", ");
  return (
    <div
      className={`race-countdown${variant === "wide" ? " race-countdown--wide" : ""}`}
      role="timer"
      aria-label={`Race starts in ${accessibleLabel}`}
    >
      {variant === "wide" ? (
        <div className="race-countdown-meta">
          <p className="race-countdown-heading">COUNTDOWN TO NEXT RACE START</p>
          <time dateTime={new Date(targetMs).toISOString()}>
            Starts {targetTimeLabel(startsAt)}
          </time>
        </div>
      ) : (
        <p className="race-countdown-heading">COUNTDOWN TO NEXT RACE START</p>
      )}
      <p className="race-countdown-sentence">Race starts in {accessibleLabel}</p>
      <div className="race-countdown-parts" aria-hidden="true">
        {parts.map((part) => (
          <span className="race-countdown-part" key={part.unit}>
            <strong>{String(part.value).padStart(2, "0")}</strong>
            <span>{unitName(part.unit)}</span>
          </span>
        ))}
      </div>
      {variant !== "wide" && (
        <time dateTime={new Date(targetMs).toISOString()}>
          Starts {targetTimeLabel(startsAt)}
        </time>
      )}
    </div>
  );
}
