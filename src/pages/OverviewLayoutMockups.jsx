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

const variants = [
  {
    id: "race-first",
    label: "01 / Race first",
    title: "Answer the immediate question first",
    summary:
      "The latest race owns the full width. Standings and next/previous context follow as supporting evidence.",
  },
  {
    id: "balanced",
    label: "02 / Balanced",
    title: "Give the result and season equal weight",
    summary:
      "The latest race and championship snapshot sit together, making the page useful for both race and season visitors.",
  },
  {
    id: "championship",
    label: "03 / Championship desk",
    title: "Lead with the title picture",
    summary:
      "The championship snapshot is the first reading column, while the latest result remains the strong visual counterpoint.",
  },
  {
    id: "calendar-first",
    label: "04 / Calendar desk",
    title: "Orient the visitor in the season",
    summary:
      "Previous and next events establish where the season is, with the latest result and full standings immediately below.",
  },
];

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
    <section className="mockup-results" aria-label="Race result preview">
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

function MockupEventStrip() {
  return (
    <section className="mockup-event-progress" aria-label="Season progress preview">
      <div className="mockup-event-progress-heading">
        <span>EVENTS</span>
        <strong>14 <small>of 23 events</small></strong>
      </div>
      <div className="mockup-event-guidance">
        <span>ROUND EXPLORER</span>
        <strong>Tap or click a marker to inspect that round.</strong>
      </div>
      <div className="mockup-event-strip" aria-hidden="true">
        {Array.from({ length: 23 }, (_, index) => (
          <i className={index < 14 ? "is-complete" : ""} key={index} />
        ))}
      </div>
      <div className="mockup-event-legend">
        <span><i className="is-complete" /> Completed</span>
        <span><i /> Upcoming</span>
      </div>
    </section>
  );
}

function MockupRaceFocus() {
  return (
    <section className="mockup-race-focus">
      <div className="mockup-race-topline">
        <span>LATEST COMPLETED RACE</span>
        <b>completed</b>
      </div>
      <div className="mockup-race-identity">
        <div>
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
      <MockupEventStrip />
      <div className="mockup-race-footer">
        <MockupAction>Open race detail</MockupAction>
        <span><CalendarBlankIcon size={16} aria-hidden /> 13 Sept 2026</span>
        <MockupAction primary>Explore the calendar</MockupAction>
      </div>
    </section>
  );
}

function MockupStandings() {
  return (
    <section className="mockup-standings">
      <div className="mockup-panel-heading">
        <h3>Championship snapshot</h3>
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
      <p>Leading entries from the latest published standings after Spanish Grand Prix.</p>
      <MockupAction>Open full standings</MockupAction>
    </section>
  );
}

function MockupCalendar() {
  return (
    <section className="mockup-calendar">
      <div className="mockup-panel-heading">
        <h3>Previous and next events</h3>
        <span>Season context</span>
      </div>
      <div className="mockup-calendar-row">
        <span>13</span>
        <div><small>PREVIOUS EVENT</small><strong>Italian Grand Prix</strong><p>Autodromo Nazionale di Monza</p></div>
        <b>06 Sept 2026<small>completed</small></b>
      </div>
      <div className="mockup-calendar-row mockup-calendar-row--next">
        <span>15</span>
        <div><small>NEXT EVENT</small><strong>Azerbaijan Grand Prix</strong><p>Baku City Circuit</p><em>Countdown to race start · 06 days 19 hours</em></div>
        <b>26 Sept 2026<small>scheduled</small></b>
      </div>
      <MockupAction>Open season calendar</MockupAction>
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
      <div className="overview-mockup-grid">
        <div className="overview-mockup-freshness">Results through Spanish Grand Prix · 2026-09-13</div>
        <div className="overview-mockup-race"><MockupRaceFocus /></div>
        <div className="overview-mockup-standings"><MockupStandings /></div>
        <div className="overview-mockup-calendar"><MockupCalendar /></div>
        <div className="overview-mockup-provenance"><MockupProvenance /></div>
      </div>
    </section>
  );
}

export default function OverviewLayoutMockups() {
  return (
    <div className="overview-mockup-page">
      <header className="overview-mockup-intro">
        <p className="eyebrow">OVERVIEW LAYOUT STUDY</p>
        <h1>Four ways to structure the season overview</h1>
        <p>
          Same data, same components and same visual language. Only the reading order changes.
          These are static review mock-ups for the 2026 season surface.
        </p>
      </header>
      <div className="overview-mockup-list">
        {variants.map((variant) => <LayoutFrame key={variant.id} variant={variant} />)}
      </div>
    </div>
  );
}
