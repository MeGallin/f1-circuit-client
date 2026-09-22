import { ChartLineUpIcon, GaugeIcon, TrophyIcon } from "@phosphor-icons/react";
import AnalyticsRaceBreakdown from "./AnalyticsRaceBreakdown";

export function buildDriverSpotlightModel(leader) {
  return {
    name: leader?.driverName || "Leader not supplied",
    constructor: leader?.constructor?.displayName || "Constructor not supplied",
    position: leader?.position ?? null,
    number: leader?.number ?? null,
    form: (leader?.recentForm || []).filter((position) => position != null).slice(-5),
    positionsGained: leader?.positionsGained ?? null,
  };
}

function SnapshotValue({ label, value, detail }) {
  return (
    <div className="analytics-snapshot-value">
      <span>{label}</span>
      <strong>{value ?? "—"}</strong>
      {detail && <small>{detail}</small>}
    </div>
  );
}

export default function AnalyticsPerformanceSnapshot({ intelligence }) {
  const leader = intelligence?.championshipLeader;
  const breakdown = intelligence?.raceBreakdown || {};
  if (!leader && !Object.keys(breakdown).length) return null;
  const spotlight = buildDriverSpotlightModel(leader);

  return (
    <div className="analytics-performance-snapshot">
      <section className="analytics-snapshot-card">
        <div className="analytics-snapshot-heading">
          <div>
            <p className="eyebrow">DRIVER SPOTLIGHT</p>
            <div className="analytics-spotlight-identity">
              {spotlight.number && (
                <span className="driver-number" aria-label={`Driver number ${spotlight.number}`}>
                  {spotlight.number}
                </span>
              )}
              <h3>{leader?.driverName || "Leader not supplied"}</h3>
            </div>
            <p className="muted">
              {leader?.constructor?.displayName || "Constructor not supplied"}
            </p>
          </div>
          <div className="analytics-spotlight-rank">
            {spotlight.position != null && <strong>P{spotlight.position}</strong>}
            <ChartLineUpIcon size={24} aria-hidden />
          </div>
        </div>
        <div className="analytics-snapshot-value-grid">
          <SnapshotValue label="Points" value={leader?.points} />
          <SnapshotValue label="Wins" value={leader?.wins} />
          <SnapshotValue label="Podiums" value={leader?.podiums} />
          <SnapshotValue
            label="Average finish"
            value={
              leader?.averageFinish == null
                ? null
                : leader.averageFinish.toFixed(1)
            }
          />
        </div>
        {spotlight.form.length ? (
          <div className="analytics-spotlight-form">
            <div>
              <span>Recent form</span>
              <small>Last {spotlight.form.length} races</small>
            </div>
            <ol aria-label={`${spotlight.name} recent form`}>
              {spotlight.form.map((position, index) => (
                <li key={`${position}-${index}`}>{position}</li>
              ))}
            </ol>
            {spotlight.positionsGained != null && (
              <small>
                {spotlight.positionsGained >= 0 ? "+" : ""}
                {spotlight.positionsGained} positions gained
              </small>
            )}
          </div>
        ) : null}
      </section>
      <section className="analytics-snapshot-card">
        <div className="analytics-snapshot-heading">
          <div>
            <p className="eyebrow">RACE BREAKDOWN</p>
            <h3>Published outcomes</h3>
            <p className="muted">
              Calculated from {breakdown.entries ?? "—"} published entries.
            </p>
          </div>
          <TrophyIcon size={24} aria-hidden />
        </div>
        <AnalyticsRaceBreakdown breakdown={breakdown} />
      </section>
      <p className="analytics-snapshot-note">
        <GaugeIcon size={16} aria-hidden />
        Metrics stay empty when the published archive does not supply the
        underlying result.
      </p>
    </div>
  );
}
