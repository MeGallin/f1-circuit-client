import { ArrowRightIcon, CalendarBlankIcon } from "@phosphor-icons/react";
import "../styles/overview-layout-mockups.css";

const standings = [
  ["01", "Andrea Kimi Antonelli", "Mercedes", "292"],
  ["02", "George Russell", "Mercedes", "211"],
  ["03", "Lewis Hamilton", "Ferrari", "191"],
  ["04", "Lando Norris", "McLaren", "186"],
  ["05", "Charles Leclerc", "Ferrari", "167"],
  ["06", "Max Verstappen", "Red Bull", "145"],
  ["07", "Oscar Piastri", "McLaren", "120"],
  ["08", "Isack Hadjar", "Red Bull", "71"],
  ["09", "Liam Lawson", "RB F1 Team / Red Bull", "59"],
  ["10", "Pierre Gasly", "Alpine F1 Team", "41"],
];

const focusVariant = {
  id: "race-week",
  label: "Season around the race",
  title: "Put the season around the race",
  summary:
    "The next event is a quiet prompt at the top. The latest race and championship carry the main reading. The previous event closes the story below season progress.",
};

function MockupAction({ children, primary = false }) {
  return (
    <span className={primary ? "mockup-action mockup-action--primary" : "mockup-action"}>
      {children}
      <ArrowRightIcon size={16} aria-hidden />
    </span>
  );
}

function MockupPodium() {
  const podium = [
    ["Max Verstappen", "Red Bull", "2", "18 PTS", "second"],
    ["Andrea Kimi Antonelli", "Mercedes", "1", "25 PTS", "winner"],
    ["Lando Norris", "McLaren", "3", "15 PTS", "third"],
  ];

  return (
    <section className="mockup-podium-section" aria-label="Race result preview">
      <div className="mockup-section-heading">
        <span>RACE RESULT</span>
        <small>Top three</small>
      </div>
      <div className="mockup-podium">
        {podium.map(([name, team, position, points, place]) => (
          <div className={`mockup-podium-item mockup-podium-item--${place}`} key={position}>
            <div className="mockup-podium-driver">
              <strong>{name}</strong>
              <span>{team}</span>
            </div>
            <div className="mockup-podium-block">
              <strong>{position}</strong>
              <span>{points}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function MockupRaceHero() {
  return (
    <section className="mockup-race-hero" aria-label="Latest completed race">
      <div className="mockup-race-topline">
        <span>LATEST COMPLETED RACE</span>
        <b>completed</b>
      </div>
      <div className="mockup-race-identity">
        <div className="mockup-race-copy">
          <span className="mockup-round">ROUND 14 OF 23</span>
          <h3>Spanish Grand Prix</h3>
          <p>Madring</p>
        </div>
        <div className="mockup-track-state">
          <div className="mockup-track-placeholder">Track layout not supplied</div>
          <span>Madring circuit visual</span>
        </div>
      </div>
      <MockupPodium />
      <div className="mockup-race-actions">
        <MockupAction>Open race detail</MockupAction>
        <span><CalendarBlankIcon size={16} aria-hidden /> 13 Sept 2026</span>
      </div>
    </section>
  );
}

function MockupEventStrip() {
  return (
    <section className="mockup-event-progress" aria-label="Season progress preview">
      <div className="mockup-event-progress-heading">
        <div>
          <span>SEASON PROGRESS</span>
          <strong>14 <small>of 23 events</small></strong>
        </div>
        <span className="mockup-event-progress-note">Results through Spanish Grand Prix</span>
      </div>
      <div className="mockup-event-strip" aria-hidden="true">
        {Array.from({ length: 23 }, (_, index) => (
          <i className={index < 14 ? "is-complete" : ""} key={index} />
        ))}
      </div>
      <div className="mockup-event-legend">
        <span><i className="is-complete" /> Completed</span>
        <span><i /> Upcoming</span>
        <b>Round 14 is the latest published result</b>
      </div>
    </section>
  );
}

function MockupAdjacentEvent({
  label,
  round,
  name,
  track,
  date,
  status,
  countdown,
  action,
  className,
}) {
  return (
    <section className={`mockup-adjacent-event ${className}`} aria-label={label}>
      <div className="mockup-adjacent-event-heading">
        <span>{label}</span>
      </div>
      <b className="mockup-adjacent-event-round">{round}</b>
      <div className="mockup-adjacent-event-copy">
        <strong>{name}</strong>
        <p>{track}</p>
        {countdown && <em>{countdown}</em>}
      </div>
      <div className="mockup-adjacent-event-date">
        <b>{date}</b>
        <small>{status}</small>
      </div>
      {action && <MockupAction>{action}</MockupAction>}
    </section>
  );
}

function MockupNextEvent() {
  return <MockupAdjacentEvent
    className="mockup-next-event"
    label="NEXT EVENT"
    round="15"
    name="Azerbaijan Grand Prix"
    track="Baku City Circuit"
    countdown="Countdown to race start · 06 days 19 hours"
    date="26 Sept 2026"
    status="scheduled"
    action="Explore the calendar"
  />;
}

function MockupPreviousEvent() {
  return <MockupAdjacentEvent
    className="mockup-previous-event"
    label="PREVIOUS EVENT"
    round="13"
    name="Italian Grand Prix"
    track="Autodromo Nazionale di Monza"
    date="06 Sept 2026"
    status="completed"
  />;
}

function MockupStandings() {
  return (
    <section className="mockup-standings" aria-label="Championship snapshot">
      <div className="mockup-panel-heading">
        <div>
          <span>CHAMPIONSHIP</span>
          <h3>Championship snapshot</h3>
        </div>
        <span>Drivers / Constructors</span>
      </div>
      <ol>
        {standings.map(([rank, name, team, points]) => (
          <li key={rank}>
            <span>{rank}</span>
            <div><strong>{name}</strong><small>{team}</small></div>
            <b>{points}<small>PTS</small></b>
          </li>
        ))}
      </ol>
      <div className="mockup-standings-footer">
        <p>Leading entries after Spanish Grand Prix.</p>
        <MockupAction>Open full standings</MockupAction>
      </div>
    </section>
  );
}

function MockupProvenance() {
  return (
    <div className="mockup-provenance">
      <span>source only</span>
      <span>partial coverage</span>
      <span>Checked 18/09/2026 UTC</span>
      <span>About the data</span>
    </div>
  );
}

function LayoutFrame({ variant }) {
  return (
    <section className={`overview-mockup-frame overview-mockup-frame--${variant.id}`}>
      <header className="overview-mockup-frame-heading">
        <div>
          <span>{variant.label}</span>
          <h2>{variant.title}</h2>
        </div>
        <p>{variant.summary}</p>
      </header>
      <div className="overview-mockup-surface">
        <div className="mockup-surface-freshness">Results through Spanish Grand Prix · 2026-09-13</div>
        <MockupNextEvent />
        <MockupRaceHero />
        <MockupStandings />
        <MockupEventStrip />
        <MockupPreviousEvent />
        <MockupProvenance />
      </div>
    </section>
  );
}

export default function OverviewLayoutMockups() {
  return (
    <div className="overview-mockup-page">
      <header className="overview-mockup-intro">
        <p className="eyebrow">OVERVIEW LAYOUT STUDY</p>
        <h1>Put the season around the race</h1>
        <p>
          One focused mock-up of the season overview. The next event is visible without competing with the latest result. The previous event closes the story after season progress.
        </p>
      </header>
      <div className="overview-mockup-list">
        <LayoutFrame variant={focusVariant} />
      </div>
    </div>
  );
}
