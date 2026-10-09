import { APEX_SIZES } from "../../../design-system/apex.tokens";
import { TrophyIcon, UsersThreeIcon } from "@phosphor-icons/react";
import { ConstructorIdentity } from "../../../components/ConstructorIdentity";
import { DriverIdentity } from "../../../components/DriverIdentity";
import "../../../design-system/analytics-scope.css";
import { analyticsCount } from "../labels";
import {
  championshipContextValid,
  publishedChampionshipRows,
} from "../championship";

export function buildChampionshipSnapshotModel({
  championship,
  year = championship?.season,
  snapshotId = championship?.snapshotId,
  limit = 5,
} = {}) {
  const drivers = publishedChampionshipRows(
    championship,
    "drivers",
    year,
    snapshotId,
  )
    .sort((a, b) => a.rank - b.rank)
    .slice(0, limit)
    .map((driver) => ({
      rank: driver.rank,
      id: driver.entity.id,
      name: driver.entity.displayName,
      number: driver.number ?? null,
      value: Number(driver.points),
      detail:
        driver.wins == null
          ? "Wins not supplied"
          : analyticsCount(driver.wins, "published win"),
    }));
  const teams = publishedChampionshipRows(
    championship,
    "constructors",
    year,
    snapshotId,
  )
    .sort((a, b) => a.rank - b.rank)
    .slice(0, limit)
    .map((constructor) => ({
      rank: constructor.rank,
      id: constructor.entity.id,
      name: constructor.entity.displayName,
      value: Number(constructor.points),
      detail:
        constructor.wins == null
          ? "Wins not supplied"
          : analyticsCount(constructor.wins, "published win"),
    }));
  return { drivers, teams };
}

function SnapshotRows({ rows, kind, year }) {
  return (
    <ol
      className={`analytics-championship-rows analytics-championship-rows--${kind.toLowerCase()}`}
      aria-label={`${kind} standings`}
    >
      {rows.map((row) => (
        <li key={row.id} className="analytics-championship-row">
          <span className="analytics-championship-rank">{row.rank}</span>
          <span className="analytics-championship-copy">
            <strong>
              {kind === "Constructor" ? (
                <ConstructorIdentity
                  constructor={{ id: row.id, displayName: row.name }}
                  year={year}
                />
              ) : (
                <DriverIdentity
                  inline
                  stackOnMobile
                  presentation="record"
                  name={row.name || "Not supplied"}
                  number={row.number}
                />
              )}
            </strong>
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
  year,
  championship,
  snapshotId,
}) {
  const model = buildChampionshipSnapshotModel({
    championship,
    year,
    snapshotId: snapshotId || null,
  });
  const valid = championshipContextValid(championship, year, snapshotId);

  return (
    <div className="analytics-championship-snapshot">
      <p className="muted analytics-championship-note">
        {valid
          ? `Published championship standings after round ${championship.round}`
          : "Published championship standings unavailable"}
        . Season {championship?.season || year}; unaffected by analysis filters.
      </p>
      <section
        className="analytics-championship-group"
        aria-labelledby="analytics-driver-standings"
      >
        <div className="analytics-championship-heading">
          <TrophyIcon size={APEX_SIZES.icon} aria-hidden />
          <h3 id="analytics-driver-standings">Driver standings</h3>
        </div>
        {model.drivers.length ? (
          <SnapshotRows rows={model.drivers} kind="Driver" year={year} />
        ) : (
          <p className="muted">
            No driver points are published for this selection.
          </p>
        )}
      </section>
      <section
        className="analytics-championship-group"
        aria-labelledby="analytics-constructor-standings"
      >
        <div className="analytics-championship-heading">
          <UsersThreeIcon size={APEX_SIZES.icon} aria-hidden />
          <h3 id="analytics-constructor-standings">Constructor standings</h3>
        </div>
        {model.teams.length ? (
          <SnapshotRows rows={model.teams} kind="Constructor" year={year} />
        ) : (
          <p className="muted">
            No constructor points are published for this selection.
          </p>
        )}
      </section>
    </div>
  );
}
