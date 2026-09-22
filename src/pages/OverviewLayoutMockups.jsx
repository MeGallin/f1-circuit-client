import { ArrowRightIcon, CalendarBlankIcon } from "@phosphor-icons/react";
import { CircuitName, DriverNumber, RaceStatus } from "../components/ui";
import "../styles/overview-layout-mockups.css";

const standings = [
  ["01", "12", "Andrea Kimi Antonelli", "Mercedes", "292"],
  ["02", "63", "George Russell", "Mercedes", "211"],
  ["03", "44", "Lewis Hamilton", "Ferrari", "191"],
  ["04", "1", "Lando Norris", "McLaren", "186"],
  ["05", "16", "Charles Leclerc", "Ferrari", "167"],
  ["06", "3", "Max Verstappen", "Red Bull", "145"],
  ["07", "81", "Oscar Piastri", "McLaren", "120"],
  ["08", "6", "Isack Hadjar", "Red Bull", "71"],
  ["09", "30", "Liam Lawson", "RB F1 Team / Red Bull", "59"],
  ["10", "10", "Pierre Gasly", "Alpine F1 Team", "41"],
];

const layoutVariants = [
  {
    id: "countdown-hero",
    label: "OPTION 01 · COUNTDOWN HERO",
    title: "Make the start time the first thing seen",
    summary:
      "Lead with the live countdown, then anchor it to the race name, circuit, and start date. The primary question is answered immediately: when does it begin?",
  },
  {
    id: "split-header",
    label: "OPTION 02 · SPLIT HEADER",
    title: "Balance time and identity in one read",
    summary:
      "Keep the event identity on the left and give the countdown a dedicated right-hand stage. The action stays visible without competing with the time.",
  },
  {
    id: "command-strip",
    label: "OPTION 03 · COMMAND STRIP",
    title: "Make the next race scan like a control strip",
    summary:
      "Put the event name first, then expose the start date, status, and countdown as a compact operational rail. It uses the available width without adding vertical bulk.",
  },
  {
    id: "integrated-event",
    label: "OPTION 04 · INTEGRATED EVENT",
    title: "Let the countdown finish the event story",
    summary:
      "Use a single event band with a clear identity row and a restrained countdown footer. The next block feels complete before the latest result begins.",
  },
  {
    id: "race-ticket",
    label: "OPTION 05 · RACE TICKET",
    title: "Treat the next race like a start pass",
    summary:
      "Create a clear ticket-like hierarchy: event on the left, time in the middle, and one obvious calendar action on the right. The information remains grounded, not decorative.",
  },
  {
    id: "countdown-band",
    label: "OPTION 06 · COUNTDOWN BAND",
    title: "Give the countdown a full-width stage",
    summary:
      "Keep the race identity compact at the top, then let the countdown run across the available width as the visual anchor of the block.",
  },
  {
    id: "light-board",
    label: "OPTION 07 · LIGHT BOARD",
    title: "Read it like a race-control display",
    summary:
      "Use disciplined columns and hard alignment to make the start time feel operational. Every value has a place, and the action is immediately understood.",
  },
  {
    id: "number-rail",
    label: "OPTION 08 · NUMBER RAIL",
    title: "Let round 15 orient the story",
    summary:
      "Use the round as a strong visual rail, then place the race identity and countdown alongside it. This makes the season position and the next action legible together.",
  },
  {
    id: "focus-card",
    label: "OPTION 09 · FOCUS CARD",
    title: "Frame the countdown as the decision point",
    summary:
      "Keep the countdown in a distinct, high-contrast module and let the event details explain what it refers to. The calendar action follows the same reading path.",
  },
  {
    id: "start-line",
    label: "OPTION 10 · START LINE",
    title: "Put the race name under the clock",
    summary:
      "Start with the time and start date, then reveal the event identity beneath it. This is the strongest countdown-led direction for a race-week mindset.",
  },
];

function MockupAction({ children, primary = false }) {
  return (
    <span
      className={
        primary ? "mockup-action mockup-action--primary" : "mockup-action"
      }
    >
      {children}
      <ArrowRightIcon size={16} aria-hidden />
    </span>
  );
}

function MockupPodium() {
  const podium = [
    ["Max Verstappen", "3", "Red Bull", "2", "18 PTS", "second"],
    ["Andrea Kimi Antonelli", "12", "Mercedes", "1", "25 PTS", "winner"],
    ["Lando Norris", "1", "McLaren", "3", "15 PTS", "third"],
  ];

  return (
    <section className="mockup-podium-section" aria-label="Race result preview">
      <div className="mockup-section-heading">
        <span>RACE RESULT</span>
        <small>Top three</small>
      </div>
      <div className="mockup-podium">
        {podium.map(([name, number, team, position, points, place]) => (
          <div
            className={`mockup-podium-item mockup-podium-item--${place}`}
            key={position}
          >
            <div className="mockup-podium-driver">
              <div className="mockup-podium-driver-line">
                <DriverNumber number={number} />
                <strong>{name}</strong>
              </div>
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
        <b>
          <RaceStatus status="completed">completed</RaceStatus>
        </b>
      </div>
      <div className="mockup-race-identity">
        <div className="mockup-race-copy">
          <span className="mockup-round">ROUND 14 OF 23</span>
          <h3>Spanish Grand Prix</h3>
          <CircuitName name="Madring" />
        </div>
        <div className="mockup-track-state">
          <div className="mockup-track-placeholder">
            Track layout not supplied
          </div>
          <span>Madring circuit visual</span>
        </div>
      </div>
      <MockupPodium />
      <div className="mockup-race-actions">
        <MockupAction>Open race detail</MockupAction>
        <span>
          <CalendarBlankIcon size={16} aria-hidden /> 13 Sept 2026
        </span>
      </div>
    </section>
  );
}

function MockupEventStrip() {
  return (
    <section
      className="mockup-event-progress"
      aria-label="Season progress preview"
    >
      <div className="mockup-event-progress-heading">
        <div>
          <span>SEASON PROGRESS</span>
          <strong>
            14 <small>of 23 events</small>
          </strong>
        </div>
        <span className="mockup-event-progress-note">
          Results through Spanish Grand Prix
        </span>
      </div>
      <div className="mockup-event-strip" aria-hidden="true">
        {Array.from({ length: 23 }, (_, index) => (
          <i className={index < 14 ? "is-complete" : ""} key={index} />
        ))}
      </div>
      <div className="mockup-event-legend">
        <span>
          <i className="is-complete" /> Completed
        </span>
        <span>
          <i /> Upcoming
        </span>
        <b>Tap or click a marker to inspect that round.</b>
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
    <section
      className={`mockup-adjacent-event ${className}`}
      aria-label={label}
    >
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
        <small>
          <RaceStatus status={status}>{status}</RaceStatus>
        </small>
      </div>
      {action && <MockupAction>{action}</MockupAction>}
    </section>
  );
}

function MockupNextEvent({ variant }) {
  const eventIdentity = (className = "") => (
    <div className={`mockup-next-event-identity ${className}`.trim()}>
      <b className="mockup-adjacent-event-round">15</b>
      <div className="mockup-adjacent-event-copy">
        <strong>Azerbaijan Grand Prix</strong>
        <p>Baku City Circuit</p>
      </div>
    </div>
  );

  const eventDate = () => (
    <div className="mockup-adjacent-event-date">
      <b>26 Sept 2026 · 11:00 UTC</b>
      <small>
        <RaceStatus status="scheduled">scheduled</RaceStatus>
      </small>
    </div>
  );

  const countdown = (className = "") => (
    <div className={`mockup-next-event-countdown ${className}`.trim()}>
      <span>COUNTDOWN TO RACE START</span>
      <b>
        04 <small>days</small> 04 <small>H</small> 06 <small>M</small> 11{" "}
        <small>S</small>
      </b>
    </div>
  );

  const action = <MockupAction>Explore the calendar</MockupAction>;

  if (variant === "countdown-hero") {
    return (
      <section
        className="mockup-next-event mockup-next-event--countdown-hero"
        aria-label="Next event"
      >
        {countdown("mockup-next-event-countdown--hero")}
        <div className="mockup-next-event-hero-copy">
          <div className="mockup-next-event-heading">
            <span>NEXT EVENT</span>
          </div>
          {eventIdentity()}
        </div>
        <div className="mockup-next-event-hero-meta">
          {eventDate()}
          {action}
        </div>
      </section>
    );
  }

  if (variant === "command-strip") {
    return (
      <section
        className="mockup-next-event mockup-next-event--command"
        aria-label="Next event"
      >
        <div className="mockup-next-event-heading">
          <span>NEXT EVENT</span>
        </div>
        {eventIdentity()}
        {eventDate()}
        {countdown()}
        {action}
      </section>
    );
  }

  if (variant === "integrated-event") {
    return (
      <section
        className="mockup-next-event mockup-next-event--integrated"
        aria-label="Next event"
      >
        <div className="mockup-next-event-topline">
          <div className="mockup-next-event-heading">
            <span>NEXT EVENT</span>
          </div>
          {eventDate()}
          {action}
        </div>
        {eventIdentity()}
        <div className="mockup-next-event-countdown-row">
          {countdown()}
          <span>Race start is the next meaningful moment in the season.</span>
        </div>
      </section>
    );
  }

  if (variant === "race-ticket") {
    return (
      <section
        className="mockup-next-event mockup-next-event--ticket"
        aria-label="Next event"
      >
        <div className="mockup-next-event-ticket-copy">
          <div className="mockup-next-event-heading">
            <span>NEXT EVENT</span>
          </div>
          {eventIdentity()}
        </div>
        {countdown("mockup-next-event-countdown--ticket")}
        <div className="mockup-next-event-ticket-meta">
          {eventDate()}
          {action}
        </div>
      </section>
    );
  }

  if (variant === "countdown-band") {
    return (
      <section
        className="mockup-next-event mockup-next-event--countdown-band"
        aria-label="Next event"
      >
        <div className="mockup-next-event-band-topline">
          <div className="mockup-next-event-heading">
            <span>NEXT EVENT</span>
          </div>
          {eventIdentity()}
          {eventDate()}
          {action}
        </div>
        {countdown("mockup-next-event-countdown--hero")}
      </section>
    );
  }

  if (variant === "light-board") {
    return (
      <section
        className="mockup-next-event mockup-next-event--light-board"
        aria-label="Next event"
      >
        <div className="mockup-next-event-board-label">
          <span>NEXT EVENT</span>
          <b>15</b>
        </div>
        <div className="mockup-next-event-board-copy">
          <strong>Azerbaijan Grand Prix</strong>
          <p>Baku City Circuit</p>
        </div>
        {countdown("mockup-next-event-countdown--hero")}
        <div className="mockup-next-event-board-meta">
          {eventDate()}
          {action}
        </div>
      </section>
    );
  }

  if (variant === "number-rail") {
    return (
      <section
        className="mockup-next-event mockup-next-event--number-rail"
        aria-label="Next event"
      >
        <div className="mockup-next-event-number-rail">
          <span>ROUND</span>
          <b>15</b>
          <i>of 23</i>
        </div>
        <div className="mockup-next-event-number-copy">
          <div className="mockup-next-event-heading">
            <span>NEXT EVENT</span>
          </div>
          {eventIdentity("mockup-next-event-identity--no-round")}
        </div>
        {countdown("mockup-next-event-countdown--hero")}
        <div className="mockup-next-event-number-meta">
          {eventDate()}
          {action}
        </div>
      </section>
    );
  }

  if (variant === "focus-card") {
    return (
      <section
        className="mockup-next-event mockup-next-event--focus-card"
        aria-label="Next event"
      >
        <div className="mockup-next-event-focus-copy">
          <div className="mockup-next-event-heading">
            <span>NEXT EVENT</span>
          </div>
          {eventIdentity()}
          {eventDate()}
        </div>
        <div className="mockup-next-event-focus-countdown">
          {countdown("mockup-next-event-countdown--hero")}
          {action}
        </div>
      </section>
    );
  }

  if (variant === "start-line") {
    return (
      <section
        className="mockup-next-event mockup-next-event--start-line"
        aria-label="Next event"
      >
        <div className="mockup-next-event-start-topline">
          <div className="mockup-next-event-heading">
            <span>NEXT EVENT</span>
          </div>
          {eventDate()}
        </div>
        {countdown("mockup-next-event-countdown--hero")}
        <div className="mockup-next-event-start-identity">
          {eventIdentity()}
          {action}
        </div>
      </section>
    );
  }

  return (
    <section
      className="mockup-next-event mockup-next-event--split"
      aria-label="Next event"
    >
      <div className="mockup-next-event-main">
        <div className="mockup-next-event-heading">
          <span>NEXT EVENT</span>
        </div>
        {eventIdentity()}
      </div>
      <div className="mockup-next-event-schedule">
        {eventDate()}
        {countdown()}
      </div>
      {action}
    </section>
  );
}

function MockupPreviousEvent() {
  return (
    <MockupAdjacentEvent
      className="mockup-previous-event"
      label="PREVIOUS EVENT"
      round="13"
      name="Italian Grand Prix"
      track="Autodromo Nazionale di Monza"
      date="06 Sept 2026"
      status="completed"
    />
  );
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
        {standings.map(([rank, number, name, team, points]) => (
          <li key={rank}>
            <span>{rank}</span>
            <div>
              <div className="mockup-standings-driver-line">
                <DriverNumber number={number} />
                <strong>{name}</strong>
              </div>
              <small>{team}</small>
            </div>
            <b>
              {points}
              <small>PTS</small>
            </b>
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
    <section
      className={`overview-mockup-frame overview-mockup-frame--${variant.id}`}
    >
      <header className="overview-mockup-frame-heading">
        <div>
          <span>{variant.label}</span>
          <h2>{variant.title}</h2>
        </div>
        <p>{variant.summary}</p>
      </header>
      <div className="overview-mockup-surface">
        <div className="mockup-surface-freshness">
          Results through Spanish Grand Prix · 2026-09-13
        </div>
        <MockupNextEvent variant={variant.id} />
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
          Ten distinct directions for the same season overview. The data and
          supporting sections stay constant so the decision is about hierarchy,
          attention, and how quickly the next race can be understood.
        </p>
      </header>
      <div className="overview-mockup-list">
        {layoutVariants.map((variant) => (
          <LayoutFrame key={variant.id} variant={variant} />
        ))}
      </div>
    </div>
  );
}
