const decimal = (value, signed = false) =>
  typeof value === "string" &&
  (signed ? /^-?(0|[1-9]\d*)(\.\d+)?$/ : /^(0|[1-9]\d*)(\.\d+)?$/).test(value);
const nullable = (value, check) => value === null || check(value);
const text = (value) => typeof value === "string";
const event = (value) =>
  value &&
  text(value.eventId) &&
  text(value.name) &&
  Number.isSafeInteger(value.round) &&
  value.round > 0 &&
  value.round <= 64 &&
  ["race", "sprint"].includes(value.kind) &&
  /^\d{4}-\d{2}-\d{2}$/.test(value.date) &&
  decimal(value.maximum);
const condition = (value) =>
  value &&
  nullable(value.entityId, text) &&
  text(value.name) &&
  nullable(value.maximumPoints, decimal) &&
  nullable(
    value.finishAtOrBelow,
    (n) => Number.isSafeInteger(n) && n >= 1 && n <= 10,
  ) &&
  [null, "wins-countback"].includes(value.tieResolution);
const path = (value, statuses, eventCheck) =>
  value &&
  statuses.includes(value.status) &&
  nullable(value.event, eventCheck) &&
  nullable(value.leaderPoints, (n) => decimal(n, true)) &&
  nullable(value.strongestRivalCeiling, (n) => decimal(n, true));
const pathEvidence = (value, proven) =>
  proven.includes(value.status)
    ? [value.event, value.leaderPoints, value.strongestRivalCeiling].every(
        (field) => field !== null,
      )
    : [value.event, value.leaderPoints, value.strongestRivalCeiling].every(
        (field) => field === null,
      );

// Standings-only whitelist; optional on legacy publications.
export function validatedTitleScenarios(value, outlook) {
  if (value === null) return null;
  const ownedEvent = (row) => {
    if (
      !event(row) ||
      row.round <= outlook.round ||
      !row.date.startsWith(`${outlook.year}-`) ||
      /^0(?:\.0+)?$/.test(row.maximum)
    )
      return false;
    const date = new Date(`${row.date}T00:00:00Z`);
    return (
      Number.isFinite(date.getTime()) &&
      date.toISOString().slice(0, 10) === row.date
    );
  };
  const fields = ["now", "next", "earliest", "constantGap", "winningPattern"];
  if (
    !value ||
    value.snapshotId !== outlook.snapshotId ||
    value.standingSnapshotId !== outlook.standingSnapshotId ||
    !["conditional", "unavailable"].includes(value.coverage) ||
    !nullable(value.reasonCode, text)
  )
    throw new Error("Unexpected title scenarios");
  if (value.coverage === "unavailable") {
    if (!fields.every((key) => value[key] === null))
      throw new Error("Unexpected title scenarios");
  } else {
    const { now, next, earliest, constantGap, winningPattern } = value;
    if (
      outlook.coverage !== "conditional" ||
      !now ||
      !["secured", "not-secured", "tie-unresolved"].includes(now.status) ||
      ![null, "strict-points", "wins-countback"].includes(now.method) ||
      !next ||
      !["possible", "not-proven", "no-opportunities"].includes(next.status) ||
      !nullable(next.event, ownedEvent) ||
      !nullable(next.leaderGain, decimal) ||
      !nullable(next.remainingAfter, decimal) ||
      !Array.isArray(next.conditions) ||
      next.conditions.length > 256 ||
      !next.conditions.every(condition) ||
      !nullable(next.unlistedCondition, condition) ||
      !path(
        earliest,
        ["possible", "proven-path", "already-secured", "not-proven"],
        ownedEvent,
      ) ||
      !text(earliest.witness) ||
      !constantGap ||
      constantGap.status !== "hypothetical" ||
      !nullable(constantGap.event, ownedEvent) ||
      !nullable(constantGap.remainingAfter, decimal) ||
      !path(
        winningPattern,
        ["guaranteed-path", "already-secured", "not-proven"],
        ownedEvent,
      ) ||
      !text(winningPattern.outcome)
    )
      throw new Error("Unexpected title scenarios");
    const conditions = [
      ...next.conditions,
      ...(next.unlistedCondition ? [next.unlistedCondition] : []),
    ];
    if (
      (now.status === "secured") !== (now.method !== null) ||
      (next.status === "no-opportunities"
        ? [
            next.event,
            next.leaderGain,
            next.remainingAfter,
            next.unlistedCondition,
          ].some((field) => field !== null) || next.conditions.length > 0
        : [next.event, next.leaderGain, next.remainingAfter].some(
            (field) => field === null,
          )) ||
      (next.status === "possible" &&
        conditions.some((row) => row.maximumPoints === null)) ||
      conditions.some(
        (row) =>
          row.maximumPoints === null &&
          (row.finishAtOrBelow !== null || row.tieResolution !== null),
      ) ||
      !pathEvidence(earliest, ["possible", "proven-path"]) ||
      !pathEvidence(winningPattern, ["guaranteed-path"]) ||
      ((earliest.status === "already-secured" ||
        winningPattern.status === "already-secured") &&
        now.status !== "secured") ||
      (constantGap.event === null) !== (constantGap.remainingAfter === null)
    )
      throw new Error("Unexpected title scenario evidence");
  }
  const pick = (row, keys) =>
    row === null
      ? null
      : Object.fromEntries(keys.map((key) => [key, row[key]]));
  const eventKeys = ["eventId", "name", "round", "kind", "date", "maximum"];
  const conditionKeys = [
    "entityId",
    "name",
    "maximumPoints",
    "finishAtOrBelow",
    "tieResolution",
  ];
  const eventPath = (row, extra) =>
    row === null
      ? null
      : {
          ...pick(row, [
            "status",
            "leaderPoints",
            "strongestRivalCeiling",
            extra,
          ]),
          event: pick(row.event, eventKeys),
        };
  return {
    ...pick(value, [
      "snapshotId",
      "standingSnapshotId",
      "coverage",
      "reasonCode",
    ]),
    now: pick(value.now, ["status", "method"]),
    next:
      value.next === null
        ? null
        : {
            ...pick(value.next, ["status", "leaderGain", "remainingAfter"]),
            event: pick(value.next.event, eventKeys),
            conditions: value.next.conditions.map((row) =>
              pick(row, conditionKeys),
            ),
            unlistedCondition: pick(
              value.next.unlistedCondition,
              conditionKeys,
            ),
          },
    earliest: eventPath(value.earliest, "witness"),
    constantGap:
      value.constantGap === null
        ? null
        : {
            ...pick(value.constantGap, ["status", "remainingAfter"]),
            event: pick(value.constantGap.event, eventKeys),
          },
    winningPattern: eventPath(value.winningPattern, "outcome"),
  };
}
