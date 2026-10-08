import { APEX_SIZES } from "../../../design-system/apex.tokens";
import {
  BuildingsIcon,
  ChartLineUpIcon,
  MedalIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";

const percentage = (value) =>
  value == null ? null : `${Math.round(Number(value) * 1000) / 10}%`;

export function buildAnalyticsFormInsightsModel({
  leader,
  comparison,
  constructors = [],
} = {}) {
  const leaderMetrics = comparison?.drivers?.find(
    (driver) => driver.id === leader?.driverId,
  )?.metrics;
  const podiumRate = leaderMetrics?.races
    ? (leaderMetrics.podiums / leaderMetrics.races) * 100
    : null;
  const constructorGap =
    constructors.length > 1 &&
    constructors[0].totalPoints != null &&
    constructors[1].totalPoints != null
      ? Number(constructors[0].totalPoints || 0) -
        Number(constructors[1].totalPoints || 0)
      : null;
  return {
    leaderName: leader?.driverName || "Leader not supplied",
    form: (leader?.recentForm || leaderMetrics?.recentForm || [])
      .filter((position) => position != null)
      .slice(-5),
    podiumRate: {
      value: podiumRate == null ? "—" : `${Math.round(podiumRate * 10) / 10}%`,
      detail: leaderMetrics?.races
        ? `${leaderMetrics.podiums} podiums / ${leaderMetrics.races} starts`
        : "Published starts not supplied",
    },
    retirementRate: {
      value: percentage(leaderMetrics?.retirementRate),
      detail: "Of known finished/retired starts in selected results",
    },
    constructorGap: {
      value:
        constructorGap == null
          ? "—"
          : `${constructorGap >= 0 ? "+" : ""}${constructorGap} pts`,
      detail:
        constructors.length > 1
          ? `${constructors[0].constructorName} over ${constructors[1].constructorName}`
          : "Second constructor not supplied",
    },
  };
}

function InsightMetric({ icon: Icon, label, value, detail }) {
  return (
    <article className="analytics-form-insight-metric">
      <Icon size={APEX_SIZES.icon} aria-hidden />
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </article>
  );
}

export default function AnalyticsFormInsights({
  leader,
  comparison,
  constructors,
}) {
  const model = buildAnalyticsFormInsightsModel({
    leader,
    comparison,
    constructors,
  });
  return (
    <div className="analytics-form-insights">
      <section className="analytics-form-card">
        <div className="analytics-form-heading">
          <div>
            <p className="eyebrow">RECENT FORM</p>
            <h3>{model.leaderName}</h3>
            <p className="muted">Latest published race finishes</p>
          </div>
          <ChartLineUpIcon size={APEX_SIZES.iconLarge} aria-hidden />
        </div>
        {model.form.length ? (
          <ol
            className="analytics-form-sequence"
            aria-label={`${model.leaderName} recent form`}
          >
            {model.form.map((position, index) => (
              <li key={`${position}-${index}`}>{position}</li>
            ))}
          </ol>
        ) : (
          <p className="muted">
            Recent form is not supplied for this selection.
          </p>
        )}
      </section>
      <div className="analytics-form-metrics">
        <InsightMetric
          icon={MedalIcon}
          label="Podium conversion"
          value={model.podiumRate.value}
          detail={model.podiumRate.detail}
        />
        <InsightMetric
          icon={WarningCircleIcon}
          label="Retirement rate"
          value={model.retirementRate.value || "—"}
          detail={model.retirementRate.detail}
        />
        <InsightMetric
          icon={BuildingsIcon}
          label="Constructor gap"
          value={model.constructorGap.value}
          detail={model.constructorGap.detail}
        />
      </div>
    </div>
  );
}
