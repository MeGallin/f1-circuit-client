import { APEX_ICONS } from "../../../design-system/apex.tokens";
import {
  FlagCheckeredIcon,
  GaugeIcon,
  TrophyIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";

const percentage = (value, total) =>
  total && value != null ? Math.round((value / total) * 1000) / 10 : null;

export function buildRaceBreakdownModel(breakdown = {}, sessionType = "race") {
  const starts = breakdown.starts || 0;
  const classified = breakdown.classified;
  return [
    {
      icon: TrophyIcon,
      label: sessionType === "race" ? "Race wins" : "Session P1 results",
      value: breakdown.wins ?? null,
      percentage: percentage(breakdown.wins || 0, starts),
      detail: starts ? `of ${starts} published starts` : "No published starts",
    },
    {
      icon: FlagCheckeredIcon,
      label: sessionType === "qualifying" ? "Top-three results" : "Podiums",
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
      value: breakdown.entries ? (classified ?? null) : null,
      percentage: percentage(classified, breakdown.entries),
      detail: breakdown.entries
        ? `${classified ?? "Unknown"} explicitly classified · ${breakdown.retirements ?? "Unknown"} retired · ${breakdown.classificationUnknown ?? "Unknown"} classification unknown`
        : "No published entries",
    },
  ];
}

function BreakdownMetric({ metric }) {
  const Icon = metric.icon;
  return (
    <article className="analytics-breakdown-metric">
      <div
        className="analytics-breakdown-ring"
        style={{ "--ring-progress": `${metric.percentage ?? 0}%` }}
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
        <Icon size={APEX_ICONS.action} aria-hidden />
        <strong>{metric.label}</strong>
        <small>{metric.detail}</small>
      </div>
    </article>
  );
}

export default function AnalyticsRaceBreakdown({ breakdown, sessionType }) {
  const model = buildRaceBreakdownModel(breakdown, sessionType);
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
