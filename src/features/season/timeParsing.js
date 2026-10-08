// Strict calendar/clock parsing shared by published schedules and UTC series inputs.
// Unzoned form values are UTC only when the caller explicitly allows them.
export function toUtcIso(value, { requireZone = false } = {}) {
  const input = String(value || "").trim();
  const match = input.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(Z|[+-]\d{2}:?\d{2})?$/i,
  );
  if (!match || (requireZone && !match[8])) return null;
  const date = `${match[1]}-${match[2]}-${match[3]}`;
  const calendar = new Date(`${date}T00:00:00Z`);
  if (
    !Number.isFinite(calendar.valueOf()) ||
    calendar.toISOString().slice(0, 10) !== date ||
    Number(match[4]) > 23 ||
    Number(match[5]) > 59 ||
    Number(match[6] || 0) > 59
  )
    return null;
  const timestamp = Date.parse(
    `${date}T${match[4]}:${match[5]}:${match[6] || "00"}.${(match[7] || "").padEnd(3, "0")}${match[8] || "Z"}`,
  );
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
}
