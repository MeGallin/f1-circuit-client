import {
  ChartLineUpIcon,
  FlagCheckeredIcon,
  TrophyIcon,
} from "@phosphor-icons/react";

const insightIcons = [TrophyIcon, ChartLineUpIcon, FlagCheckeredIcon];

function resultCount(race) {
  return race?.results?.length || race?.podium?.length || 0;
}

function coverageLabel(dataset) {
  if (!dataset || dataset.coverage === "unavailable") return "Not published";
  return dataset.coverage === "partial" ? "Published subset" : "Published";
}

function formatTemperatureRange(range) {
  if (!range) return null;
  if (range.min === range.max) return `${range.min}°C`;
  return `${range.min} to ${range.max}°C`;
}

function pluralize(value, singular, plural = `${singular}s`) {
  return `${value} ${value === 1 ? singular : plural}`;
}

function formatLapDuration(durationMs) {
  if (!Number.isFinite(durationMs)) return null;
  const totalSeconds = durationMs / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds - minutes * 60).toFixed(3).padStart(6, "0");
  return `${minutes}:${seconds}`;
}

export function buildAnalyticsSessionReadoutModel({
  race,
  insights = [],
  latestSessionHighlights,
} = {}) {
  const winner = (race?.results || race?.podium || []).find(
    (result) => result.position === 1,
  );
  const fastestLap = race?.fastestLap;
  const session = latestSessionHighlights || {};
  const weather = session.weather || {};
  const tyres = session.tyres || {};
  const pitStops = session.pitStops || {};
  const overtakes = session.overtakes || {};
  const raceControl = session.raceControl || {};
  const weatherRange = formatTemperatureRange(weather.airTemperatureC);
  const fastestLapDuration = formatLapDuration(fastestLap?.durationMs);
  const sessionCards = [
    {
      label: "Weather",
      value:
        weatherRange ||
        (weather.observations
          ? pluralize(weather.observations, "observation")
          : "Not published"),
      detail: weatherRange
        ? `${pluralize(weather.observations || 0, "observation")} · ${pluralize(weather.rainfallObservations || 0, "rainfall observation")}`
        : coverageLabel(weather),
    },
    {
      label: "Tyre strategy",
      value: tyres.count ? pluralize(tyres.count, "stint") : "Not published",
      detail: tyres.drivers?.length
        ? `${pluralize(tyres.drivers.length, "driver")} covered`
        : coverageLabel(tyres),
    },
    {
      label: "Pit stops",
      value:
        pitStops.coverage === "unavailable"
          ? "Not published"
          : String(pitStops.count || 0),
      detail: coverageLabel(pitStops),
    },
    {
      label: "Overtakes",
      value:
        overtakes.coverage === "unavailable"
          ? "Not published"
          : String(overtakes.count || 0),
      detail: coverageLabel(overtakes),
    },
    {
      label: "Race control",
      value:
        raceControl.coverage === "unavailable"
          ? "Not published"
          : raceControl.events
            ? pluralize(raceControl.events, "event")
            : "0 events",
      detail:
        raceControl.coverage === "unavailable"
          ? coverageLabel(raceControl)
          : pluralize(raceControl.flagEvents || 0, "flag event"),
    },
  ];
  return {
    race: {
      title: race?.name || "Latest race not supplied",
      context: race
        ? `Round ${race.round ?? "—"} · ${race.circuit?.displayName || "Circuit not supplied"}`
        : "No completed race is published for this selection.",
      winner: winner?.driverName || "Winner not supplied",
      winnerConstructor: winner?.constructorName || "Constructor not supplied",
      fastestLap: fastestLap?.driverName
        ? `${fastestLap.driverName}${fastestLap.lapNumber ? ` · Lap ${fastestLap.lapNumber}` : ""}${fastestLapDuration ? ` · ${fastestLapDuration}` : ""}`
        : "Not supplied",
      resultCount: resultCount(race),
    },
    session: {
      cards: sessionCards,
      available: sessionCards.some((card) => card.value !== "Not published"),
      strategyDrivers: tyres.drivers || [],
      overtakeLeaders: overtakes.leaders || [],
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

export default function AnalyticsSessionReadout({
  race,
  insights,
  latestSessionHighlights,
}) {
  const model = buildAnalyticsSessionReadoutModel({
    race,
    insights,
    latestSessionHighlights,
  });
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
        <div className="analytics-session-evidence-grid">
          {model.session.cards.map((card) => (
            <div className="analytics-session-evidence" key={card.label}>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              <small>{card.detail}</small>
            </div>
          ))}
        </div>
        {model.session.available && (
          <details className="analytics-session-details">
            <summary>View published session detail</summary>
            <div className="analytics-session-detail-grid">
              <section>
                <h4>Tyre strategy</h4>
                {model.session.strategyDrivers.length ? (
                  <ul className="analytics-session-detail-list">
                    {model.session.strategyDrivers.map((driver) => (
                      <li key={driver.driverId || driver.driverName}>
                        <strong>{driver.driverName}</strong>
                        <span>
                          {driver.compounds?.join(" · ") ||
                            "Compound not supplied"}{" "}
                          · {pluralize(driver.stintCount, "stint")}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="muted">Tyre-stint detail is not published.</p>
                )}
              </section>
              <section>
                <h4>Overtake leaders</h4>
                {model.session.overtakeLeaders.length ? (
                  <ul className="analytics-session-detail-list">
                    {model.session.overtakeLeaders.map((driver) => (
                      <li key={driver.driverId || driver.driverName}>
                        <strong>{driver.driverName}</strong>
                        <span>
                          {pluralize(driver.count, "published overtake")}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="muted">Overtake detail is not published.</p>
                )}
              </section>
            </div>
          </details>
        )}
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
          <p className="muted">
            No archive insights are available for this selection.
          </p>
        )}
      </section>
    </div>
  );
}
