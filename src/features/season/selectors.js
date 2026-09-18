import { createSelector } from "@reduxjs/toolkit";
export const runtimeYear = () => new Date().getUTCFullYear();
export const selectSeasonOptions = createSelector(
  [(data) => data?.items, () => runtimeYear()],
  (items, currentYear) => {
    if (!items) return [];
    const options = items
      .slice()
      .sort((a, b) => b.year - a.year)
      .map((s) => ({
        value: String(s.year),
        label: `${s.year}${s.year === currentYear ? " · Current year" : ""} · ${s.coverage === "unavailable" ? "Not imported" : s.coverage ? `${s.coverage} coverage` : "Coverage not supplied"}`,
      }));
    if (!items.some((s) => s.year === currentYear))
      options.push({
        value: String(currentYear),
        label: `${currentYear} · Current year · Not in catalogue`,
      });
    return options.sort((a, b) => Number(b.value) - Number(a.value));
  },
);
export function selectedSeason(items, requested, currentYear = runtimeYear()) {
  if (!items) return null;
  if (
    requested != null &&
    (items.some((s) => String(s.year) === requested) ||
      requested === String(currentYear))
  )
    return Number(requested);
  if (requested != null) return null;
  return currentYear;
}
export function focusEvent(summary) {
  return summary?.nextEvent || summary?.latestCompletedEvent || null;
}
export function previewCalendar(events, eventId) {
  const index = events.findIndex((e) => e.id === eventId);
  return events.slice(Math.max(0, index - 1), Math.max(0, index - 1) + 4);
}
export function dateLabel(value) {
  if (!value) return "Date not supplied";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00Z`));
}
