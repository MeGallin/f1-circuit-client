export function formatAnalyticsDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function buildSeasonIntelligenceModel(intelligence) {
  const progress = intelligence?.progress || {};
  const latestRace = intelligence?.latestRace || null;
  const podium = [...(latestRace?.podium || [])].sort(
    (a, b) => Number(a.position) - Number(b.position),
  );
  const latestWinner = podium.find((entry) => entry.position === 1) || null;

  return {
    progressLabel:
      progress.totalEvents == null || progress.completedEvents == null
        ? "—"
        : `${progress.completedEvents} / ${progress.totalEvents}`,
    progressPercentage:
      progress.percentage == null ? null : `${progress.percentage}%`,
    championshipLeader: intelligence?.championshipLeader || null,
    constructorLeader: intelligence?.constructorLeader || null,
    latestRace,
    latestWinner,
    podium,
    nextRace: intelligence?.nextRace || null,
  };
}
