import { useSearchParams } from "react-router-dom";
import { DatabaseIcon } from "@phosphor-icons/react";
import { useGetSourcesQuery } from "../api/archiveApi";
import {
  PageHeading,
  Panel,
  PanelBody,
  Button,
  DataBoundary,
  SourceNote,
  StatusBadge,
} from "../components/ui";
const timestamp = (value) =>
  value
    ? `${new Date(value).toLocaleString("en-GB", { timeZone: "UTC" })} UTC`
    : "Not supplied";
export default function Sources() {
  const [params, setParams] = useSearchParams();
  const query = useGetSourcesQuery({
    cursor: params.get("cursor") || undefined,
    snapshotId: params.get("snapshot") || undefined,
  });
  const data = query.currentData;
  const reset = () => {
    if (params.has("snapshot") || params.has("cursor")) setParams({});
    else query.refetch();
  };
  return (
    <>
      <PageHeading
        eyebrow="BEHIND THE RECORD"
        title="Sources & coverage"
        description="Published provider status and retrieval history. A healthy provider does not imply complete event coverage."
        icon={DatabaseIcon}
        actions={
          <Button variant="quiet" disabled={query.isFetching} onClick={reset}>
            Refresh status
          </Button>
        }
      />
      <p className="standing-note">
        Coverage describes available records. Source-only data has not been
        independently verified. Freshness describes the archived publication,
        not a live race feed. Each primary view includes its own source
        attribution and retrieval timestamp.
      </p>
      <DataBoundary
        query={query}
        empty={query.isSuccess && !data?.items.length}
        onRetry={query.error?.status === 409 ? reset : query.refetch}
      >
        {data?.items.map((provider) => (
          <Panel key={provider.id} title={provider.name}>
            <PanelBody>
              <StatusBadge>{provider.health}</StatusBadge>
              <p>
                {provider.enabled ? "Provider enabled" : "Provider disabled"}
              </p>
              <p>
                Last successful retrieval: {timestamp(provider.lastSuccess)}
              </p>
              <p>Last recorded failure: {timestamp(provider.lastFailure)}</p>
              <p>
                {provider.capabilities.length} published dataset coverage
                entries. Consult each event or standings view for the relevant
                coverage.
              </p>
            </PanelBody>
          </Panel>
        ))}
      </DataBoundary>
      <SourceNote meta={data?.meta} />
      <Panel title="Constructor marks & rights">
        <PanelBody>
          <p>
            Constructor marks identify teams; no sponsorship or endorsement is
            implied. Copyright labels do not clear trademark or commercial-use
            rights.
          </p>
          <p>
            Some team badges are copyrighted official artwork or non-free
            Wikipedia images. Wikipedia's article-specific rationale does not
            license reuse here; deployment rights remain the operator's
            responsibility.
          </p>
          <p>
            Williams Racing Monogram by{" "}
            <a href="https://commons.wikimedia.org/wiki/User:DJClements">
              DJClements
            </a>
            , via{" "}
            <a href="https://commons.wikimedia.org/wiki/File:Williams_Racing_Monogram.png">
              Wikimedia Commons
            </a>
            , licensed{" "}
            <a href="https://creativecommons.org/licenses/by-sa/4.0/">
              CC BY-SA 4.0
            </a>
            . Original file unchanged; scaled for display.
          </p>
          <p>
            Prost Grand Prix logo, file-page author/source{" "}
            <a href="https://www.freepng.es/png-nrmtnh/">freepng.es</a>, via{" "}
            <a href="https://commons.wikimedia.org/wiki/File:Prost_Grand_Prix_Formula_One_Logo.png">
              Wikimedia Commons
            </a>
            , recorded{" "}
            <a href="https://creativecommons.org/licenses/by-sa/4.0/">
              CC BY-SA 4.0
            </a>
            . Original raster unchanged; scaled for display. Underlying brand
            rights are not cleared by this attribution.
          </p>
        </PanelBody>
      </Panel>
      {data && (data.page.hasMore || params.has("cursor")) && (
        <nav className="pagination" aria-label="Source pages">
          <Button
            disabled={!params.has("cursor") || query.isFetching}
            onClick={reset}
          >
            First page
          </Button>
          <Button
            disabled={!data.page.hasMore || query.isFetching}
            onClick={() =>
              setParams({
                cursor: data.page.nextCursor,
                snapshot: data.meta.snapshotId,
              })
            }
          >
            Next page
          </Button>
        </nav>
      )}
    </>
  );
}
