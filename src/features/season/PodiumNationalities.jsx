import { useGetProfileQuery } from "../../api/archiveApi";
import { CountryFlag, countryCode } from "../../components/visuals";
import { countryFlagAssets } from "../../components/countryFlags";

function DriverNationality({ driver, snapshotId }) {
  const id = driver?.id;
  const query = useGetProfileQuery(
    { kind: "driver", id, snapshotId },
    {
      skip: !snapshotId || typeof id !== "string" || !id.startsWith("driver:"),
    },
  );
  const data = query.currentData;
  const profile = data?.profile;
  const valid =
    Boolean(snapshotId) &&
    profile?.id === id &&
    data?.meta?.snapshotId === snapshotId &&
    ["complete", "partial"].includes(data?.meta?.coverage);
  const nationality =
    valid && typeof profile.nationality === "string"
      ? profile.nationality.trim()
      : "";
  const name = driver?.displayName || "this driver";
  if (nationality && countryFlagAssets[countryCode(nationality)])
    return <CountryFlag country={nationality} label="Nationality" />;
  return (
    <span className="race-podium-nationality-missing">
      <span aria-hidden="true">—</span>
      <span className="sr-only">
        {query.isFetching
          ? `Loading nationality for ${name}`
          : `Nationality not available for ${name}`}
        {nationality ? `; supplied nationality: ${nationality}` : ""}
      </span>
    </span>
  );
}

export function PodiumNationalities({ entry, snapshotId }) {
  // Shared-car entries retain each distinct source driver; duplicate IDs must
  // neither repeat a flag nor cause extra profile subscriptions. RTK Query also
  // shares a profile request if the same driver appears in another result.
  const drivers = [
    ...new Map(
      (Array.isArray(entry?.drivers) ? entry.drivers : []).map(
        (driver, index) => [driver?.id || `missing:${index}`, driver],
      ),
    ).values(),
  ];
  return (
    <div className="race-podium-nationalities">
      <span className="sr-only">Driver nationality: </span>
      {(drivers.length ? drivers : [null]).map((driver, index) => (
        <DriverNationality
          key={driver?.id || `missing:${index}`}
          driver={driver}
          snapshotId={snapshotId}
        />
      ))}
    </div>
  );
}
