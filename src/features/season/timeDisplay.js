import { useSyncExternalStore } from "react";
import { toUtcIso } from "./timeParsing";
const key = "apex-time-display";
const eventName = "apex-time-display-change";
let fallback = "local";
let memoryOverride = null;
function readPreference() {
  if (memoryOverride != null) return memoryOverride;
  try {
    return localStorage.getItem(key) === "utc" ? "utc" : "local";
  } catch {
    return fallback;
  }
}
function subscribe(notify) {
  const storageChanged = (event) => {
    if (event.key === key || event.key == null) {
      memoryOverride = null;
      notify();
    }
  };
  window.addEventListener(eventName, notify);
  window.addEventListener("storage", storageChanged);
  return () => {
    window.removeEventListener(eventName, notify);
    window.removeEventListener("storage", storageChanged);
  };
}
export function setTimeDisplayPreference(value) {
  fallback = value === "utc" ? "utc" : "local";
  try {
    localStorage.setItem(key, fallback);
    memoryOverride = null;
  } catch {
    /* Persistence is optional. */
    memoryOverride = fallback;
  }
  window.dispatchEvent(new Event(eventName));
}
export function useTimeDisplayPreference() {
  return useSyncExternalStore(subscribe, readPreference, () => "local");
}
export function viewerTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    return null;
  }
}
export function validTimeZone(zone) {
  if (typeof zone !== "string" || !zone) return false;
  try {
    new Intl.DateTimeFormat("en-GB", { timeZone: zone }).format(0);
    return true;
  } catch {
    return false;
  }
}
export function formatCalendarDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return null;
  const date = new Date(`${value}T00:00:00Z`);
  if (
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  )
    return null;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
export function formatScheduleTime(
  schedule = {},
  { mode = "local", timeZone = viewerTimeZone() } = {},
) {
  const instant = toUtcIso(schedule?.startsAt, { requireZone: true });
  const precise =
    Boolean(instant) &&
    ["minute", "second"].includes(schedule?.timePrecision) &&
    Number.isFinite(Date.parse(instant));
  if (!precise)
    return {
      primary: formatCalendarDate(schedule?.date) || "Date not supplied",
      utc: null,
      instant: null,
      precise: false,
      zone: null,
    };
  const date = new Date(instant);
  const options = {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  };
  const utc = new Intl.DateTimeFormat("en-GB", {
    ...options,
    timeZone: "UTC",
  }).format(date);
  let zone = mode === "utc" ? "UTC" : timeZone;
  let primary;
  try {
    if (!zone) throw new Error("No viewer zone");
    primary = new Intl.DateTimeFormat("en-GB", {
      ...options,
      timeZone: zone,
    }).format(date);
  } catch {
    zone = null;
    primary = utc;
  }
  return { primary, utc, instant: date.toISOString(), precise: true, zone };
}
