export const missing = "Not supplied";
export function duration(value) {
  if (value == null) return missing;
  const hours = Math.floor(value / 3600000);
  const minutes = Math.floor(value / 60000) % 60;
  const seconds = ((value % 60000) / 1000).toFixed(3).padStart(6, "0");
  return hours
    ? `${hours}:${String(minutes).padStart(2, "0")}:${seconds}`
    : `${minutes}:${seconds}`;
}
export function entryName(entry) {
  return (
    entry?.drivers?.map((driver) => driver.displayName).join(" / ") || missing
  );
}
export function gapLabel(gap) {
  if (gap?.kind === "leader") return "Leader";
  if (gap?.kind === "laps")
    return `+${gap.laps} ${gap.laps === 1 ? "lap" : "laps"}`;
  if (gap?.kind === "time") return `+${(gap.milliseconds / 1000).toFixed(3)}s`;
  return missing;
}
export function gridLabel(grid) {
  return grid?.kind === "position"
    ? grid.position
    : grid?.kind === "pit-lane"
      ? "Pit lane"
      : missing;
}
