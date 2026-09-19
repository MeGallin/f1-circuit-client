import useSeasonSearch from "../features/season/useSeasonSearch";
import { ArrowClockwiseIcon, RankingIcon } from "@phosphor-icons/react";
import {
  useGetSeasonsQuery,
  useGetSeasonSummaryQuery,
} from "../api/archiveApi";
import {
  selectSeasonOptions,
  selectedSeason,
  focusEvent,
} from "../features/season/selectors";
import {
  ArchiveProgress,
  RaceFocus,
  CalendarPreview,
  StandingsPreview,
} from "../features/season/SeasonPanels";
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
  FreshnessSummary,
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
              <FreshnessSummary
                meta={data.meta}
                cutoff={
                  summary.latestCompletedEvent
                    ? {
                        eventName: summary.latestCompletedEvent.name,
                        date: summary.latestCompletedEvent.schedule?.date,
                      }
                    : null
                }
              />
              <div className="season-grid">
                <RaceFocus
                  summary={summary}
                  snapshotId={data.meta.snapshotId}
                />
                <ArchiveProgress season={summary.season} />
              </div>
              <div className="overview-jump">
                <p>
                  Every result has a source. Explore what is available for this
                  season.
                </p>
                <a className="text-link" href="#season-standings">
                  <RankingIcon size={19} aria-hidden />
                  View championship leaders
                </a>
              </div>
              <div className="season-grid season-grid--data">
                <CalendarPreview
                  key={`calendar-${year}`}
                  year={year}
                  snapshotId={data.meta.snapshotId}
                  eventId={focusEvent(summary)?.id}
                  onSnapshotReset={query.refetch}
                />
                <StandingsPreview key={`standings-${year}`} summary={summary} />
              </div>
              <SourceNote meta={data.meta} />
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
