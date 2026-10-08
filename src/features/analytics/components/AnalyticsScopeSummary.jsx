import { ActionLink, Button, DriverNumber } from "../../../components/ui";
import { ConstructorIdentity } from "../../../components/ConstructorIdentity";
import { analyticsCount } from "../labels";
import {
  championshipContextValid,
  publishedChampionshipRows,
} from "../championship";
import "../../../design-system/analytics-scope.css";
import "../../../design-system/analytics-density.css";

export default function AnalyticsScopeSummary({
  year,
  championship,
  snapshotId,
  scope,
  stats,
  sessionType,
  description,
  onReset,
  children,
}) {
  const valid = championshipContextValid(championship, year, snapshotId);
  const driver = publishedChampionshipRows(
    championship,
    "drivers",
    year,
    snapshotId,
  ).find((row) => Number(row.rank) === 1);
  const team = publishedChampionshipRows(
    championship,
    "constructors",
    year,
    snapshotId,
  ).find((row) => Number(row.rank) === 1);
  return (
    <section
      className="analytics-scope-summary analytics-scope-body"
      aria-label="Analysis scope and summary"
    >
      <div className="analytics-scope-summary-heading">
        <h2>Analysis scope</h2>
      </div>
      <div className="analytics-scope-summary-links">
        <ActionLink variant="quiet" to={`/?season=${year}`}>
          Overview
        </ActionLink>
      </div>
      <div className="analytics-scope-summary-values">
        <p>
          <small>Published driver leader</small>
          <strong>
            {driver ? (
              <>
                <DriverNumber number={driver.number} />
                {driver.entity?.displayName || "Name not supplied"} ·{" "}
                {driver.points} championship pts
              </>
            ) : (
              "Not available"
            )}
          </strong>
        </p>
        <p>
          <small>Published constructor leader</small>
          <strong>
            {team ? (
              <>
                <ConstructorIdentity
                  constructor={team.entity}
                  year={championship.season}
                />{" "}
                · {team.points} championship pts
              </>
            ) : (
              "Not available"
            )}
          </strong>
        </p>
        <p>
          <small>Filtered {sessionType} results</small>
          <strong>
            Selected result points: {stats.totalPoints ?? "Not available"}
          </strong>
        </p>
      </div>
      <p className="analytics-scope-summary-caption">
        Season context {year}: published championship after round{" "}
        {valid ? (championship.round ?? "unavailable") : "unavailable"},
        unaffected by analysis filters. Selected {sessionType} result points are
        not championship points. Coverage: {scope?.coverage || "unavailable"};{" "}
        {scope?.matchingEntries == null
          ? "unknown entries"
          : analyticsCount(
              scope.matchingEntries,
              "published entry",
              "published entries",
            )}{" "}
        across{" "}
        {scope?.publishedSessions == null
          ? "unknown sessions"
          : analyticsCount(scope.publishedSessions, "published session")}
        .
      </p>
      {scope?.empty && (
        <p role="status">No published entries for this selection</p>
      )}
      <div className="analytics-scope-summary-actions">
        <details>
          <summary>Scope, coverage and metric definitions</summary>
          <p>{description}</p>
          <p>
            Only selected sessions and filters contribute result totals. Other
            sessions and unpublished records are excluded; missing values are
            unavailable, not zero.
          </p>
          {children}
        </details>
        <Button variant="quiet" onClick={onReset}>
          Reset analysis filters
        </Button>
      </div>
    </section>
  );
}
