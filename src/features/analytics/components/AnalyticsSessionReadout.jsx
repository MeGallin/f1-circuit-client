import {
  ChartLineUpIcon,
  FlagCheckeredIcon,
  TrophyIcon,
} from "@phosphor-icons/react";

const insightIcons = [TrophyIcon, ChartLineUpIcon, FlagCheckeredIcon];

function resultCount(race) {
  return race?.results?.length || race?.podium?.length || 0;
}

export function buildAnalyticsSessionReadoutModel({
  race,
  insights = [],
} = {}) {
  const winner = (race?.results || race?.podium || []).find(
    (result) => result.position === 1,
  );
  const fastestLap = race?.fastestLap;
  return {
    race: {
      title: race?.name || "Latest race not supplied",
      context: race
        ? `Round ${race.round ?? "—"} · ${race.circuit?.displayName || "Circuit not supplied"}`
        : "No completed race is published for this selection.",
      winner: winner?.driverName || "Winner not supplied",
      winnerConstructor: winner?.constructorName || "Constructor not supplied",
      fastestLap: fastestLap?.driverName
        ? `${fastestLap.driverName}${fastestLap.lapNumber ? ` · Lap ${fastestLap.lapNumber}` : ""}`
        : "Not supplied",
      resultCount: resultCount(race),
    },
    insights: insights.slice(0, 4).map((text, index) => ({
      text,
      Icon: insightIcons[index % insightIcons.length],
    })),
  };
}

function ReadoutValue({ label, value, detail }) {
  return (
    <div className="analytics-readout-value">
      <dt>{label}</dt>
      <dd>{value}</dd>
      {detail && <small>{detail}</small>}
    </div>
  );
}

export default function AnalyticsSessionReadout({ race, insights }) {
  const model = buildAnalyticsSessionReadoutModel({ race, insights });
  return (
    <div className="analytics-session-readout">
      <section className="analytics-readout-card">
        <div className="analytics-readout-heading">
          <div>
            <p className="eyebrow">LATEST SESSION HIGHLIGHTS</p>
            <h3>{model.race.title}</h3>
            <p className="muted">{model.race.context}</p>
          </div>
          <FlagCheckeredIcon size={24} aria-hidden />
        </div>
        <dl className="analytics-readout-values">
          <ReadoutValue
            label="Winner"
            value={model.race.winner}
            detail={model.race.winnerConstructor}
          />
          <ReadoutValue
            label="Fastest lap"
            value={model.race.fastestLap}
            detail="Published race result"
          />
          <ReadoutValue
            label="Results published"
            value={model.race.resultCount || "—"}
            detail="Leading entries available"
          />
        </dl>
      </section>
      <section className="analytics-readout-card">
        <div className="analytics-readout-heading">
          <div>
            <p className="eyebrow">KEY INSIGHTS</p>
            <h3>What the archive says</h3>
            <p className="muted">A concise readout from this selection.</p>
          </div>
          <ChartLineUpIcon size={24} aria-hidden />
        </div>
        {model.insights.length ? (
          <ul className="analytics-key-insights">
            {model.insights.map(({ text, Icon }) => (
              <li key={text}>
                <Icon size={18} aria-hidden />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">No archive insights are available for this selection.</p>
        )}
      </section>
    </div>
  );
}
