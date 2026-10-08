export function championshipContextValid(championship, year, snapshotId) {
  return (
    Boolean(championship && typeof championship === "object") &&
    Number.isInteger(year) &&
    year > 0 &&
    championship?.season === year &&
    Boolean(snapshotId) &&
    championship.snapshotId === snapshotId &&
    Number.isInteger(championship.round) &&
    championship.round > 0
  );
}

export function publishedChampionshipRows(
  championship,
  kind,
  year,
  snapshotId,
) {
  const coverage =
    kind === "drivers"
      ? championship?.driverCoverage
      : championship?.constructorCoverage;
  if (
    !championshipContextValid(championship, year, snapshotId) ||
    !["complete", "partial"].includes(coverage)
  )
    return [];
  const standingId = `standing:${year}:${championship.round}`;
  return (championship[kind] || []).filter(
    (row) =>
      row.standingSnapshotId === standingId &&
      row.entity?.id &&
      Number.isFinite(Number(row.rank)) &&
      Number(row.rank) > 0 &&
      row.points != null &&
      Number.isFinite(Number(row.points)),
  );
}
