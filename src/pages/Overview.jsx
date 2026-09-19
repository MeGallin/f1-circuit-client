import useSeasonSearch from "../features/season/useSeasonSearch";
import { ArrowClockwiseIcon } from "@phosphor-icons/react";
import {
  useGetSeasonsQuery,
  useGetSeasonSummaryQuery,
} from "../api/archiveApi";
import {
  selectSeasonOptions,
  selectedSeason,
} from "../features/season/selectors";
import { SeasonAroundRace } from "../features/season/SeasonPanels";
import {
  PageHeading,
  Select,
  DataBoundary,
  EmptyState,
  Button,
  SourceNote,
  Panel,
  Skeleton,
  ErrorState,
} from "../components/ui";
import "../styles/overview.css";
import SeasonUnavailable from "../features/season/SeasonUnavailable";

function SeasonOverview({ year, seasons }) {
  const query = useGetSeasonSummaryQuery({ year });
  const data = query.currentData;
  const summary = data?.summary;
  return (
    <>
      <div className="overview-toolbar">
        <span>Historical archive · {year}</span>
        <Button
          variant="quiet"
          onClick={query.refetch}
          disabled={query.isFetching}
        >
          <ArrowClockwiseIcon aria-hidden size={18} />
          Refresh data
        </Button>
      </div>
      <DataBoundary query={query} empty={query.isSuccess && !summary}>
        {summary?.season.coverage === "unavailable" ? (
          <>
            <SeasonUnavailable year={year} seasons={seasons} imported />
            <SourceNote meta={data.meta} />
          </>
        ) : (
          summary && (
            <>
              <SeasonAroundRace
                key={`season-around-race-${year}`}
                meta={data.meta}
                onSnapshotReset={query.refetch}
                snapshotId={data.meta.snapshotId}
                summary={summary}
              />
            </>
          )
        )}
      </DataBoundary>
    </>
  );
}
export default function Overview() {
  const [params, setParams] = useSeasonSearch();
  const reviewState = import.meta.env.DEV ? params.get("reviewState") : null;
  const simulated =
    import.meta.env.DEV && ["loading", "error", "empty"].includes(reviewState);
  const catalogue = useGetSeasonsQuery(undefined, { skip: simulated });
  const requested = params.get("season");
  const options = selectSeasonOptions(catalogue.currentData);
  const year = selectedSeason(catalogue.currentData?.items, requested);
  if (simulated)
    return (
      <>
        <PageHeading
          eyebrow="DEVELOPMENT STATE REVIEW"
          title="Season overview"
          description="State simulation only. No race data or actual service failure is represented."
        />
        <Panel title="Overview request state">
          {reviewState === "loading" ? (
            <Skeleton />
          ) : reviewState === "error" ? (
            <ErrorState onRetry={() => setParams({})} />
          ) : (
            <EmptyState />
          )}
          <Button variant="quiet" onClick={() => setParams({})}>
            Return to real data
          </Button>
        </Panel>
      </>
    );
  return (
    <>
      <PageHeading
        eyebrow="THE HISTORICAL ARCHIVE"
        title="Season overview"
        description="Results, context and the story behind each round."
        actions={
          options.length ? (
            <Select
              label="Season"
              value={year ? String(year) : ""}
              onChange={(e) => setParams({ season: e.target.value })}
              options={
                year
                  ? options
                  : [{ value: "", label: "Choose a season" }, ...options]
              }
            />
          ) : null
        }
      />
      <DataBoundary query={catalogue}>
        {catalogue.currentData &&
          (year &&
          catalogue.currentData.items.some((season) => season.year === year) ? (
            <SeasonOverview
              key={year}
              year={year}
              seasons={catalogue.currentData.items}
            />
          ) : (
            <Panel title="Season selection">
              <SeasonUnavailable
                year={year}
                seasons={catalogue.currentData.items}
              />
            </Panel>
          ))}
      </DataBoundary>
    </>
  );
}
