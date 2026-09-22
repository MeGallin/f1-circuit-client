import {
  CalendarBlankIcon,
  FlagCheckeredIcon,
  TrophyIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import { Panel } from "../../../components/ui";
import {
  buildSeasonIntelligenceModel,
  formatAnalyticsDate,
} from "../seasonIntelligence";

function IntelligenceMetric({ icon: Icon, label, value, detail, children }) {
  return (
    <article className="analytics-intelligence-metric">
      <div className="analytics-intelligence-metric-icon" aria-hidden="true">
        <Icon size={20} weight="regular" />
      </div>
      <div className="analytics-intelligence-metric-copy">
        <span>{label}</span>
        <strong>{value ?? "—"}</strong>
        {detail && <small>{detail}</small>}
        {children}
      </div>
    </article>
  );
}

function RaceEntry({ entry }) {
  return (
    <li className={`analytics-podium-entry analytics-podium-entry--p${entry.position}`}>
      <span className="analytics-podium-position">{entry.position}</span>
      <div>
        <strong>{entry.driverName || "Driver not supplied"}</strong>
        <span>{entry.constructorName || "Constructor not supplied"}</span>
      </div>
      {entry.points != null && (
        <small>{entry.points} pts</small>
      )}
    </li>
  );
}

function LatestRace({ race, podium }) {
  if (!race) {
    return (
      <section className="analytics-race-context analytics-race-context--empty">
        <p className="eyebrow">LATEST COMPLETED RACE</p>
        <h3>No completed race published</h3>
        <p className="muted">This selection does not contain a completed race summary.</p>
      </section>
    );
  }
  return (
    <section className="analytics-race-context">
      <div className="analytics-race-context-heading">
        <div>
          <p className="eyebrow">LATEST COMPLETED RACE</p>
          <h3>{race.name}</h3>
          <p className="analytics-race-context-meta">
            Round {race.round} · {race.circuit?.displayName || "Circuit not supplied"}
          </p>
        </div>
        <FlagCheckeredIcon size={24} aria-hidden />
      </div>
      <ol className="analytics-podium" aria-label={`${race.name} podium`}>
        {podium.length ? podium.map((entry) => <RaceEntry entry={entry} key={entry.position} />) : (
          <li className="analytics-race-context-empty-copy">Podium results not supplied.</li>
        )}
      </ol>
      {race.fastestLap?.driverName && (
        <p className="analytics-race-context-footnote">
          Fastest lap · {race.fastestLap.driverName}
          {race.fastestLap.lapNumber ? ` · Lap ${race.fastestLap.lapNumber}` : ""}
        </p>
      )}
    </section>
  );
}

function NextRace({ race }) {
  if (!race) {
    return (
      <section className="analytics-race-context analytics-race-context--empty">
        <p className="eyebrow">NEXT EVENT</p>
        <h3>No scheduled event published</h3>
        <p className="muted">The selected season has no later scheduled event in the archive.</p>
      </section>
    );
  }
  const startsAt = race.schedule?.startsAt || race.schedule?.date;
  const sessionSchedule = race.sessionSchedule || [];
  const sessionTime = (value) => {
    if (!value) return "—";
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    }).format(new Date(value));
  };
  return (
    <section className="analytics-race-context analytics-race-context--next">
      <div className="analytics-race-context-heading">
        <div>
          <p className="eyebrow">NEXT EVENT</p>
          <h3>{race.name}</h3>
          <p className="analytics-race-context-meta">
            Round {race.round} · {race.circuit?.displayName || "Circuit not supplied"}
          </p>
        </div>
        <CalendarBlankIcon size={24} aria-hidden />
      </div>
      <div className="analytics-next-event-detail">
        <span>Race start</span>
        <strong>{formatAnalyticsDate(startsAt) || "Date not supplied"}</strong>
        {race.schedule?.startsAt && (
          <small>
            {new Intl.DateTimeFormat("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "UTC",
              timeZoneName: "short",
            }).format(new Date(race.schedule.startsAt))}
          </small>
        )}
      </div>
      {sessionSchedule.length > 1 && (
        <div className="analytics-weekend-schedule">
          <span>Weekend schedule · UTC</span>
          <ul>
            {sessionSchedule.map((session) => (
              <li key={`${session.kind}-${session.schedule?.startsAt || session.schedule?.date}`}>
                <strong>{session.label || session.kind}</strong>
                <small>{sessionTime(session.schedule?.startsAt || session.schedule?.date)}</small>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export default function AnalyticsIntelligence({ intelligence }) {
  const model = buildSeasonIntelligenceModel(intelligence);
  const leader = model.championshipLeader;
  const constructorLeader = model.constructorLeader;
  return (
    <Panel title="Season intelligence" eyebrow="SEASON CONTEXT">
      <div className="analytics-intelligence-metrics" role="list" aria-label="Season intelligence metrics">
        <IntelligenceMetric
          icon={FlagCheckeredIcon}
          label="Season progress"
          value={model.progressLabel}
          detail={model.progressPercentage ? `${model.progressPercentage} complete` : null}
        />
        <IntelligenceMetric
          icon={TrophyIcon}
          label="Championship leader"
          value={leader?.driverName}
          detail={leader?.points != null ? `${leader.points} pts · ${leader.wins ?? 0} wins` : null}
        />
        <IntelligenceMetric
          icon={UsersThreeIcon}
          label="Constructor leader"
          value={constructorLeader?.constructorName}
          detail={constructorLeader?.points != null ? `${constructorLeader.points} pts` : null}
        />
        <IntelligenceMetric
          icon={TrophyIcon}
          label="Latest winner"
          value={model.latestWinner?.driverName}
          detail={model.latestRace?.name || "No result published"}
        />
      </div>
      <div className="analytics-race-context-grid">
        <LatestRace race={model.latestRace} podium={model.podium} />
        <NextRace race={model.nextRace} />
      </div>
    </Panel>
  );
}
