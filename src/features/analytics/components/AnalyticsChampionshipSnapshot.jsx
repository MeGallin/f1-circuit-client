import { TrophyIcon, UsersThreeIcon } from "@phosphor-icons/react";

export function buildChampionshipSnapshotModel({
  comparison,
  constructors,
  driverSeries,
  limit = 5,
} = {}) {
  const numberByDriver = new Map(
    (driverSeries || []).map((driver) => [driver.driverId, driver.number]),
  );
  const drivers = [...(comparison?.drivers || [])]
    .filter((driver) => Number.isFinite(Number(driver.metrics?.points)))
    .sort((a, b) => Number(b.metrics.points) - Number(a.metrics.points))
    .slice(0, limit)
    .map((driver, index) => ({
      rank: index + 1,
      id: driver.id,
      name: driver.name,
      number: numberByDriver.get(driver.id) || null,
      value: Number(driver.metrics.points),
      detail: `${driver.metrics.wins ?? 0} wins · ${driver.metrics.podiums ?? 0} podiums`,
    }));
  const teams = [...(constructors || [])]
    .filter((constructor) => Number.isFinite(Number(constructor.totalPoints)))
    .sort((a, b) => Number(b.totalPoints) - Number(a.totalPoints))
    .slice(0, limit)
    .map((constructor, index) => ({
      rank: index + 1,
      id: constructor.constructorId,
      name: constructor.constructorName,
      value: Number(constructor.totalPoints),
      detail: `${constructor.drivers?.length || 0} published drivers`,
    }));
  return { drivers, teams };
}

function SnapshotRows({ rows, kind, showNumber = false }) {
  return (
    <ol
      className={`analytics-championship-rows analytics-championship-rows--${kind.toLowerCase()}${showNumber ? " analytics-championship-rows--numbered" : ""}`}
      aria-label={`${kind} standings`}
    >
      {rows.map((row) => (
        <li key={row.id} className="analytics-championship-row">
          <span className="analytics-championship-rank">{row.rank}</span>
          {showNumber && row.number && (
            <span className="analytics-championship-number" aria-label={`Driver number ${row.number}`}>
              {row.number}
            </span>
          )}
          <span className="analytics-championship-copy">
            <strong>{row.name || "Not supplied"}</strong>
            <small>{row.detail}</small>
          </span>
          <span className="analytics-championship-value">
            <strong>{row.value}</strong>
            <small>PTS</small>
          </span>
        </li>
      ))}
    </ol>
  );
}

export default function AnalyticsChampionshipSnapshot({
  comparison,
  constructors,
  driverSeries,
}) {
  const model = buildChampionshipSnapshotModel({
    comparison,
    constructors,
    driverSeries,
  });
  if (!model.drivers.length && !model.teams.length) return null;

  return (
    <div className="analytics-championship-snapshot">
      <section className="analytics-championship-group" aria-labelledby="analytics-driver-standings">
        <div className="analytics-championship-heading">
          <TrophyIcon size={20} aria-hidden />
          <h3 id="analytics-driver-standings">Driver standings</h3>
        </div>
        {model.drivers.length ? (
          <SnapshotRows
            rows={model.drivers}
            kind="Driver"
            showNumber={model.drivers.some((row) => row.number)}
          />
        ) : (
          <p className="muted">No driver points are published for this selection.</p>
        )}
      </section>
      <section className="analytics-championship-group" aria-labelledby="analytics-constructor-standings">
        <div className="analytics-championship-heading">
          <UsersThreeIcon size={20} aria-hidden />
          <h3 id="analytics-constructor-standings">Constructor standings</h3>
        </div>
        {model.teams.length ? (
          <SnapshotRows rows={model.teams} kind="Constructor" />
        ) : (
          <p className="muted">No constructor points are published for this selection.</p>
        )}
      </section>
    </div>
  );
}
