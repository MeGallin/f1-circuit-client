import { APEX_SIZES } from "../../../design-system/apex.tokens";
import { ChartLineUpIcon, GaugeIcon, TrophyIcon } from "@phosphor-icons/react";
import AnalyticsRaceBreakdown from "./AnalyticsRaceBreakdown";
import { ConstructorIdentity } from "../../../components/ConstructorIdentity";
import { DriverIdentity } from "../../../components/DriverIdentity";

export function buildDriverSpotlightModel(leader) {
  return {
    name: leader?.driverName || "Leader not supplied",
    constructor: leader?.constructor?.displayName || "Constructor not supplied",
    position: leader?.position ?? null,
    number: leader?.number ?? null,
    form: (leader?.recentForm || [])
      .filter((position) => position != null)
      .slice(-5),
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

export default function AnalyticsPerformanceSnapshot({
  intelligence,
  year,
  sessionType,
}) {
  const leader = intelligence?.championshipLeader;
  const breakdown = intelligence?.raceBreakdown || {};
  if (!leader && !Object.keys(breakdown).length) return null;
  const spotlight = buildDriverSpotlightModel(leader);

  return (
    <div className="analytics-performance-snapshot">
      <section className="analytics-snapshot-card">
        <p className="muted">
          Season championship leader; points and wins from published standings.
          Other form metrics use published season race results, unaffected by
          analysis filters.
        </p>
        <div className="analytics-snapshot-heading">
          <div>
            <p className="eyebrow">DRIVER SPOTLIGHT</p>
            <div className="analytics-spotlight-identity">
              <h3>
                <DriverIdentity
                  inline
                  stackOnMobile
                  presentation="heading"
                  name={spotlight.name}
                  number={spotlight.number}
                />
              </h3>
            </div>
            <p className="muted">
              <ConstructorIdentity
                constructor={leader?.constructor}
                year={year}
              />
            </p>
          </div>
          <div className="analytics-spotlight-rank">
            {spotlight.position != null && (
              <strong>P{spotlight.position}</strong>
            )}
            <ChartLineUpIcon size={APEX_SIZES.iconLarge} aria-hidden />
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
              Selected result scope: {breakdown.entries ?? "—"} published
              entries; retirement and classification are independent.
            </p>
          </div>
          <TrophyIcon size={APEX_SIZES.iconLarge} aria-hidden />
        </div>
        <AnalyticsRaceBreakdown
          breakdown={breakdown}
          sessionType={sessionType}
        />
      </section>
      <p className="analytics-snapshot-note">
        <GaugeIcon size={APEX_SIZES.iconSmall} aria-hidden />
        Metrics stay empty when the published archive does not supply the
        underlying result.
      </p>
    </div>
  );
}
