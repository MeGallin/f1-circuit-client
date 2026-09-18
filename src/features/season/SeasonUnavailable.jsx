import { useLocation } from "react-router-dom";
import { EmptyState, ActionLink } from "../../components/ui";
import { isScopedSeason } from "./selectors";
export default function SeasonUnavailable({
  year,
  seasons = [],
  imported = false,
}) {
  const { pathname, search } = useLocation();
  const fallback = seasons
    .filter(
      (season) =>
        isScopedSeason(season.year) &&
        season.coverage !== "unavailable" &&
        season.eventCount > 0,
    )
    .sort((a, b) => b.year - a.year)[0];
  const next = new URLSearchParams(search);
  for (const key of [
    "event",
    "round",
    "cursor",
    "snapshot",
    "standingSnapshot",
    "session",
    "view",
  ])
    next.delete(key);
  if (fallback) next.set("season", String(fallback.year));
  return (
    <EmptyState
      title={
        imported
          ? `No race data imported for ${year}`
          : year
            ? `${year} is not in the season catalogue`
            : "This season is not in the season catalogue"
      }
      description={
        imported
          ? "The provider lists this season, but its calendars, results and standings have not been imported. Choose another season to explore available records."
          : "This selection is not reported by the published provider catalogue. No other year has been substituted."
      }
      action={
        fallback && (
          <ActionLink to={`${pathname}?${next}`}>
            Explore imported {fallback.year} data
          </ActionLink>
        )
      }
    />
  );
}
