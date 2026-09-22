import {
  FlagCheckeredIcon,
  GaugeIcon,
  TrophyIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";

const percentage = (value, total) =>
  total ? Math.round((value / total) * 1000) / 10 : 0;

export function buildRaceBreakdownModel(breakdown = {}) {
  const starts = breakdown.starts || 0;
  const classified = breakdown.classified || 0;
  const dnfs = breakdown.dnfs || 0;
  return [
    {
      icon: TrophyIcon,
      label: "Race wins",
      value: breakdown.wins ?? null,
      percentage: percentage(breakdown.wins || 0, starts),
      detail: starts ? `of ${starts} published starts` : "No published starts",
    },
    {
      icon: FlagCheckeredIcon,
      label: "Podiums",
      value: breakdown.podiums ?? null,
      percentage: percentage(breakdown.podiums || 0, starts),
      detail: starts ? `of ${starts} published starts` : "No published starts",
    },
    {
      icon: GaugeIcon,
      label: "Fastest laps",
      value: breakdown.fastestLaps ?? null,
      percentage: percentage(breakdown.fastestLaps || 0, starts),
      detail: starts ? `of ${starts} published starts` : "No published starts",
    },
    {
      icon: WarningCircleIcon,
      label: "Finishing status",
      value: classified || null,
      percentage: percentage(classified, starts),
      detail: starts
        ? `${classified} classified · ${dnfs} DNF`
        : "No published starts",
    },
  ];
}

function BreakdownMetric({ metric }) {
  const Icon = metric.icon;
  return (
    <article className="analytics-breakdown-metric">
      <div
        className="analytics-breakdown-ring"
        style={{ "--ring-progress": `${metric.percentage}%` }}
        aria-label={`${metric.label}: ${metric.value ?? "not available"}`}
      >
        <div>
          <strong>{metric.value ?? "N/A"}</strong>
          <small>
            {metric.label === "Finishing status" ? "classified" : "total"}
          </small>
        </div>
      </div>
      <div className="analytics-breakdown-copy">
        <Icon size={18} aria-hidden />
        <strong>{metric.label}</strong>
        <small>{metric.detail}</small>
      </div>
    </article>
  );
}

export default function AnalyticsRaceBreakdown({ breakdown }) {
  const model = buildRaceBreakdownModel(breakdown);
  return (
    <div
      className="analytics-race-breakdown"
      role="list"
      aria-label="Race breakdown"
    >
      {model.map((metric) => (
        <BreakdownMetric key={metric.label} metric={metric} />
      ))}
    </div>
  );
}
