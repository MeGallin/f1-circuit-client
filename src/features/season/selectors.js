import { createSelector } from "@reduxjs/toolkit";
export const MIN_ARCHIVE_YEAR = 2000;
export const runtimeYear = () => new Date().getUTCFullYear();
export function isScopedSeason(year) {
  return Number.isInteger(Number(year)) && Number(year) >= MIN_ARCHIVE_YEAR;
}
export function seasonImportStatus(season) {
  const total = Number(season?.eventCount);
  const completed = Number(season?.completedCount);
  if (Number.isFinite(total) && total > 0) {
    if (!Number.isFinite(completed) || completed <= 0)
      return `Not imported · 0/${total} rounds`;
    if (completed < total)
      return `Partial import · ${completed}/${total} rounds`;
    return `Imported · ${completed}/${total} rounds`;
  }
  return season?.coverage === "unavailable"
    ? "Not imported"
    : "Import status not supplied";
}
export function seasonOptionLabel(season, currentYear = runtimeYear()) {
  const current = season.year === currentYear ? " · Current year" : "";
  return `${season.year}${current} · ${seasonImportStatus(season)}`;
}
export const selectSeasonOptions = createSelector(
  [(data) => data?.items, () => runtimeYear()],
  (items, currentYear) => {
    if (!items) return [];
    const options = items
      .slice()
      .filter((season) => isScopedSeason(season.year))
      .sort((a, b) => b.year - a.year)
      .map((s) => ({
        value: String(s.year),
        label: seasonOptionLabel(s, currentYear),
      }));
    if (
      isScopedSeason(currentYear) &&
      !items.some((s) => s.year === currentYear)
    )
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
    isScopedSeason(requested) &&
    (items.some(
      (s) => isScopedSeason(s.year) && String(s.year) === requested,
    ) ||
      requested === String(currentYear))
  )
    return Number(requested);
  if (requested != null) return null;
  return isScopedSeason(currentYear) ? currentYear : null;
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
