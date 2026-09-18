import { createSelector } from "@reduxjs/toolkit";
export const selectSeasonOptions = createSelector(
  [(data) => data?.items],
  (items) =>
    (items || [])
      .slice()
      .sort((a, b) => b.year - a.year)
      .map((s) => ({
        value: String(s.year),
        label: `${s.year}${s.isCurrent ? " · Current" : ""}`,
      })),
);
export function selectedSeason(items, requested) {
  if (requested && items?.some((s) => String(s.year) === requested))
    return Number(requested);
  if (requested) return null;
  return (
    (items?.find((s) => s.isCurrent)?.year ??
      items?.reduce((latest, s) => Math.max(latest, s.year), 0)) ||
    null
  );
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
