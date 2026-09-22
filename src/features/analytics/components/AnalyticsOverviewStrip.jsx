import {
  DatabaseIcon,
  FlagCheckeredIcon,
  MedalIcon,
  TrophyIcon,
  UsersThreeIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";

export function formatAnalyticsFreshness(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function freshnessLabel(value) {
  if (value === "fresh") return "Current snapshot";
  if (value === "stale") return "Review freshness";
  return "Freshness unknown";
}

export function buildAnalyticsOverviewModel({
  quickStats = {},
  seasonIntelligence = {},
  meta = {},
} = {}) {
  const progress = seasonIntelligence.progress || {};
  const leader = seasonIntelligence.championshipLeader;
  const constructorLeader = seasonIntelligence.constructorLeader;
  return {
    progress: {
      icon: FlagCheckeredIcon,
      label: "Races completed",
      value:
        quickStats.completedEvents != null && quickStats.totalEvents != null
          ? `${quickStats.completedEvents} / ${quickStats.totalEvents}`
          : "Not available",
      detail:
        progress.percentage != null
          ? `${progress.percentage}% of season`
          : null,
    },
    leader: {
      icon: TrophyIcon,
      label: "Current leader",
      value: leader?.driverName || "Not available",
      detail: leader?.points != null ? `${leader.points} pts` : null,
    },
    constructorLeader: {
      icon: UsersThreeIcon,
      label: "Constructor leader",
      value: constructorLeader?.constructorName || "Not available",
      detail:
        constructorLeader?.points != null
          ? `${constructorLeader.points} pts`
          : null,
    },
    podiumRate: {
      icon: MedalIcon,
      label: "Podium rate",
      value:
        quickStats.podiumRate != null
          ? `${quickStats.podiumRate}%`
          : "Not available",
      detail: quickStats.podiumRate != null ? "of published starts" : null,
    },
    dnfRate: {
      icon: WarningCircleIcon,
      label: "DNF rate",
      value:
        quickStats.dnfRate != null ? `${quickStats.dnfRate}%` : "Not available",
      detail: quickStats.dnfRate != null ? "of published starts" : null,
    },
    freshness: {
      icon: DatabaseIcon,
      label: "Data freshness",
      value: formatAnalyticsFreshness(meta.lastSuccessfulRetrieval),
      detail: freshnessLabel(meta.freshness),
    },
  };
}

function OverviewMetric({ metric }) {
  const Icon = metric.icon;
  return (
    <article className="analytics-overview-metric" role="listitem">
      <Icon size={22} aria-hidden />
      <div>
        <span>{metric.label}</span>
        <strong>{metric.value}</strong>
        {metric.detail && <small>{metric.detail}</small>}
      </div>
    </article>
  );
}

export default function AnalyticsOverviewStrip({
  quickStats,
  seasonIntelligence,
  meta,
}) {
  const model = buildAnalyticsOverviewModel({
    quickStats,
    seasonIntelligence,
    meta,
  });
  return (
    <div
      className="analytics-overview-strip"
      role="list"
      aria-label="Season summary"
    >
      {Object.values(model).map((metric) => (
        <OverviewMetric key={metric.label} metric={metric} />
      ))}
    </div>
  );
}
