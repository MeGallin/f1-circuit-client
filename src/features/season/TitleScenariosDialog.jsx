import { useId } from "react";
import { XIcon } from "@phosphor-icons/react";
import { ModalShell } from "../../components/ModalShell";
import {
  Button,
  Panel,
  PanelBody,
  Metric,
  StatusBadge,
  EmptyState,
} from "../../components/ui";
import { APEX_SIZES } from "../../design-system/apex.tokens";
import { dateLabel } from "./selectors";

const ordinal = (n) =>
  `${n}${n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th"}`;
const eventLabel = (event) =>
  event ? `${event.name} · ${dateLabel(event.date)}` : null;
function Condition({ condition, team, unlisted = false }) {
  return (
    <li>
      <strong>
        {unlisted ? "Unlisted lower challengers" : condition.name}
      </strong>
      <span>
        {condition.maximumPoints === null ? (
          "Not proven, even with 0 points"
        ) : (
          <>
            {!team && condition.finishAtOrBelow
              ? `${ordinal(condition.finishAtOrBelow)} or lower`
              : `At most ${condition.maximumPoints} points`}
            {condition.tieResolution === "wins-countback" && (
              <small> · wins countback at the limit</small>
            )}
          </>
        )}
      </span>
    </li>
  );
}
export function TitleScenariosDialog({ outlook, kind, onClose }) {
  const titleId = useId();
  const scenarios = outlook.scenarios;
  const available = scenarios?.coverage === "conditional";
  const team = kind === "constructors";
  const { now, next, earliest, constantGap, winningPattern } = available
    ? scenarios
    : {};
  const secured = now?.status === "secured";
  const earliestIsNext =
    next?.status === "possible" &&
    earliest?.status === "possible" &&
    next.event &&
    earliest.event &&
    ["eventId", "round", "kind", "date"].every(
      (key) => next.event[key] === earliest.event[key],
    );
  // A single leader's win already covers nonbinding driver finish limits.
  const binding =
    next?.conditions.filter(
      (row) =>
        team ||
        row.maximumPoints === null ||
        row.finishAtOrBelow === null ||
        row.finishAtOrBelow > 2,
    ) || [];
  const covered = (next?.conditions.length || 0) > binding.length;
  return (
    <ModalShell labelledBy={titleId} onClose={onClose}>
      <header className="event-dialog-header title-scenario-header">
        <div>
          <p className="eyebrow">
            {outlook.year} · Round {outlook.round ?? "not supplied"}
          </p>
          <h2 id={titleId}>Title outlook</h2>
          <p className="event-dialog-meta">
            {outlook.leaderName || "Published leader unavailable"}
          </p>
        </div>
        <Button
          aria-label="Close title outlook"
          className="event-dialog-close"
          variant="quiet"
          onClick={onClose}
        >
          <XIcon aria-hidden size={APEX_SIZES.icon} />
        </Button>
      </header>
      <PanelBody className="title-outlook-content">
        {!available ? (
          <EmptyState
            title="Outlook unavailable"
            description="Verified scenario evidence is not available for this season and publication. No title outcome is inferred."
          />
        ) : (
          <>
            <section className="title-scenario title-outlook-status">
              <StatusBadge tone={secured ? "success" : "neutral"}>
                {secured
                  ? "Already secured"
                  : now.status === "tie-unresolved"
                    ? "Tie unresolved"
                    : "Not yet secured"}
              </StatusBadge>
              <span className="muted">
                Sufficient paths, not predictions or an exact minimum.
              </span>
            </section>
            <Panel className="title-scenario title-outlook-hero">
              <PanelBody>
                <div className="title-outlook-labels">
                  <p className="eyebrow">
                    {secured ? "Title secured" : "Next opportunity"}
                  </p>
                  {!secured && earliestIsNext && (
                    <StatusBadge>Earliest possible</StatusBadge>
                  )}
                </div>
                <h3>
                  {secured
                    ? "No further results needed"
                    : next.event?.name || "No scoring opportunities remain"}
                </h3>
                {secured ? (
                  <p>
                    No further points/results required; title already secured
                    under the stated bounds.
                  </p>
                ) : (
                  <>
                    {next.event && (
                      <>
                        <p className="muted">
                          {next.event.kind === "sprint" ? "Sprint" : "Race"} ·{" "}
                          {dateLabel(next.event.date)}
                        </p>
                        <p className="title-outlook-premise">
                          {next.status === "possible" ? (
                            <>
                              <strong>
                                {team
                                  ? "Leader team finishes 1–2"
                                  : "Leader wins"}
                              </strong>{" "}
                              · Could clinch if:
                            </>
                          ) : (
                            <>
                              A next-event clinch is not proven, even with{" "}
                              {team ? "a leader-team 1–2" : "a leader win"} and
                              challengers scoring zero.
                            </>
                          )}
                        </p>
                        {next.status === "possible" && (
                          <ul className="title-outlook-conditions">
                            {binding.map((row) => (
                              <Condition
                                key={row.entityId}
                                condition={row}
                                team={team}
                              />
                            ))}
                          </ul>
                        )}
                        {next.status === "possible" && covered && (
                          <p className="title-outlook-qualifier">
                            Other listed challengers are covered by the
                            leader-win condition.
                          </p>
                        )}
                        {next.status === "possible" &&
                          next.unlistedCondition && (
                            <div className="title-outlook-partial">
                              <p className="title-outlook-qualifier">
                                Additional condition under partial coverage
                              </p>
                              <ul className="title-outlook-conditions">
                                <Condition
                                  condition={next.unlistedCondition}
                                  team={team}
                                  unlisted
                                />
                              </ul>
                            </div>
                          )}
                      </>
                    )}
                    {earliest.event && !earliestIsNext && (
                      <div className="title-outlook-earliest">
                        <h4>
                          {earliest.status === "possible"
                            ? "Earliest possible"
                            : "Earliest proven path"}
                        </h4>
                        <p>{eventLabel(earliest.event)}</p>
                        {earliest.status === "proven-path" && (
                          <p className="title-outlook-qualifier">
                            Earlier ties unresolved; not an exact earliest date.
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </PanelBody>
            </Panel>
            <div className="title-outlook-cards">
              <Panel className="title-scenario title-scenario-card">
                <PanelBody>
                  <p className="eyebrow">Maintain the lead</p>
                  <h3>Hypothetical constant gap</h3>
                  {secured ? (
                    <p>
                      Current gap already sufficient under the stated
                      points/countback bounds.
                    </p>
                  ) : (
                    <>
                      <p>
                        {eventLabel(constantGap.event) ||
                          "No strict threshold proven"}
                      </p>
                      <Metric
                        label="Points remaining"
                        value={constantGap.remainingAfter}
                      />
                      <p className="title-outlook-qualifier">
                        Assumes the leader maintains at least the current gap
                        over every challenger; the nearest rival may change.
                      </p>
                    </>
                  )}
                </PanelBody>
              </Panel>
              <Panel className="title-scenario title-scenario-card">
                <PanelBody>
                  <p className="eyebrow">Sufficient path</p>
                  <h3>Winning pattern</h3>
                  {secured ? (
                    <p>
                      No future winning pattern is required: the title is
                      already secured under the stated bounds.
                    </p>
                  ) : (
                    <>
                      <p>
                        {eventLabel(winningPattern.event) ||
                          "No clinch proven in the remaining schedule"}
                      </p>
                      <p className="title-outlook-qualifier">
                        {team
                          ? "Finish 1–2 in each race and sprint until then; nearest team 3–4 each time."
                          : "Win each race and sprint until then; nearest challenger second each time."}{" "}
                        Other rivals checked independently.
                      </p>
                      <div className="title-outlook-metrics">
                        <Metric
                          label="Leader points"
                          value={winningPattern.leaderPoints}
                        />
                        <Metric
                          label="Rival final ceiling"
                          value={winningPattern.strongestRivalCeiling}
                        />
                      </div>
                    </>
                  )}
                </PanelBody>
              </Panel>
            </div>
          </>
        )}
      </PanelBody>
      <footer className="event-dialog-footer title-scenario-source">
        <details className="title-outlook-details">
          <summary>Calculation and source details</summary>
          <p>
            The safe target is sufficient, not the exact minimum; its one-point
            margin does not resolve countback. Scenarios resolve ties only
            through proven race-wins dominance. Equal wins and later stages
            remain unresolved.
          </p>
          {available && (
            <>
              {!secured && next.status === "not-proven" && (
                <>
                  <h4>Next-event evidence</h4>
                  <ul className="title-outlook-conditions">
                    {next.conditions.map((row) => (
                      <Condition
                        key={row.entityId}
                        condition={row}
                        team={team}
                      />
                    ))}
                  </ul>
                  {next.unlistedCondition && (
                    <>
                      <p>Additional condition under partial coverage</p>
                      <ul className="title-outlook-conditions">
                        <Condition
                          condition={next.unlistedCondition}
                          team={team}
                          unlisted
                        />
                      </ul>
                    </>
                  )}
                </>
              )}
              <p>
                {now.method === "wins-countback"
                  ? "Current security uses proven wins countback."
                  : "Strict points security is used unless a wins-only tie is proven."}
              </p>
              {!secured && (
                <p>
                  {winningPattern.outcome} These are independent upper bounds,
                  not simultaneous finishing-place allocations.
                </p>
              )}
              <p>
                Constant-gap thresholds assume at least the current lead over
                every challenger, not only today's second place. No forecast or
                invented joint results.
              </p>
              {!secured && earliest.event && (
                <p>
                  Constructive path: {earliest.witness} Leader{" "}
                  {earliest.leaderPoints}; strongest rival final ceiling{" "}
                  {earliest.strongestRivalCeiling}.
                </p>
              )}
              <p>
                Published rank 2 bounds unlisted lower challengers under partial
                coverage. Every listed alive rival is checked.
              </p>
            </>
          )}
          {outlook.assumptions?.map((text) => (
            <p key={text}>{text}</p>
          ))}
          <p>
            Conditional full points, unchanged rules, no new events or
            penalties. Not an exhaustive countback or outcome solver.
          </p>
          {outlook.sourceUrls?.map((url, i) => (
            <p key={url}>
              <a href={url} target="_blank" rel="noreferrer">
                Rule source {i + 1}
              </a>
            </p>
          ))}
          <p>
            Publication: {outlook.snapshotId} · Standing:{" "}
            {outlook.standingSnapshotId || "not supplied"}
          </p>
          {!available && (
            <p>
              Evidence:{" "}
              {scenarios?.reasonCode || outlook.reasonCode || "not supplied"}
            </p>
          )}
        </details>
      </footer>
    </ModalShell>
  );
}
