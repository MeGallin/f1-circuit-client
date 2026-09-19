import { useSearchParams } from "react-router-dom";
import { useGetRecordsQuery } from "../api/archiveApi";
import {
  ActionLink,
  Button,
  DataBoundary,
  DataTable,
  EmptyState,
  Input,
  PageHeading,
  Panel,
  Select,
  SourceNote,
  StatusBadge,
  TextLink,
} from "../components/ui";
import "../styles/records.css";

export const recordScopes = [
  { value: "driver", label: "Driver" },
  { value: "constructor", label: "Constructor" },
  { value: "circuit", label: "Circuit" },
  { value: "season", label: "Season" },
];
export const recordMetrics = [
  { value: "starts", label: "Starts" },
  { value: "wins", label: "Wins" },
  { value: "podiums", label: "Podiums" },
  { value: "poles", label: "Pole positions" },
  { value: "fastest-laps", label: "Fastest laps" },
  { value: "points", label: "Points" },
];

function updateParams(params, values) {
  const next = new URLSearchParams(params);
  Object.entries(values).forEach(([key, value]) => {
    if (value == null || value === "") next.delete(key);
    else next.set(key, String(value));
  });
  next.delete("cursor");
  return next;
}

function evidencePath(row, snapshotId) {
  if (!row.evidenceId) return null;
  const query = snapshotId
    ? `?${new URLSearchParams({ snapshot: snapshotId })}`
    : "";
  return `/evidence/${encodeURIComponent(row.evidenceId)}${query}`;
}

export default function Records() {
  const [params, setParams] = useSearchParams();
  const scope = params.get("scope") || "driver";
  const metric = params.get("metric") || "starts";
  const entityId = params.get("entityId") || "";
  const year = params.get("year") || "";
  const seasonScope = scope === "season";
  const yearNumber = Number(year);
  const validScope = recordScopes.some((item) => item.value === scope);
  const validMetric = recordMetrics.some((item) => item.value === metric);
  const validTarget = seasonScope
    ? Number.isInteger(yearNumber) && yearNumber >= 1950
    : entityId.trim().length > 0 && entityId.length <= 160;
  const valid = validScope && validMetric && validTarget;
  const query = useGetRecordsQuery(
    {
      scope,
      metric,
      entityId: seasonScope ? undefined : entityId,
      year: seasonScope ? yearNumber : undefined,
      cursor: params.get("cursor") || undefined,
      snapshotId: params.get("snapshot") || undefined,
    },
    { skip: !valid },
  );
  const data = query.currentData;
  const snapshotId = data?.meta?.snapshotId || params.get("snapshot");
  const reset = () => {
    const next = new URLSearchParams(params);
    next.delete("cursor");
    next.delete("snapshot");
    setParams(next);
  };
  const submit = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setParams(
      updateParams(params, {
        scope: form.get("scope"),
        metric: form.get("metric"),
        entityId: form.get("entityId")?.toString().trim(),
        year: form.get("year")?.toString().trim(),
      }),
    );
  };

  return (
    <>
      <PageHeading
        eyebrow="HISTORY & TRUST"
        title="Records"
        description="Published career and season metrics, shown with their definition, coverage and evidence. The archive never fills an unavailable metric with an invented aggregate."
        actions={<ActionLink to="/sources">View source coverage</ActionLink>}
      />
      <Panel title="Find a published record">
        <form className="records-filters" onSubmit={submit}>
          <Select
            label="Scope"
            name="scope"
            value={scope}
            onChange={(event) => {
              const nextScope = event.target.value;
              setParams(
                updateParams(params, {
                  scope: nextScope,
                  entityId: nextScope === "season" ? undefined : entityId,
                  year: nextScope === "season" ? year : undefined,
                }),
              );
            }}
            options={recordScopes}
          />
          <Select
            label="Metric"
            name="metric"
            value={metric}
            onChange={(event) =>
              setParams(updateParams(params, { metric: event.target.value }))
            }
            options={recordMetrics}
          />
          {seasonScope ? (
            <Input
              label="Season year"
              name="year"
              type="number"
              min="1950"
              max="2100"
              inputMode="numeric"
              defaultValue={year}
              placeholder="e.g. 2024"
            />
          ) : (
            <Input
              label="Canonical entity ID"
              name="entityId"
              defaultValue={entityId}
              maxLength={160}
              placeholder="e.g. driver:hamilton"
            />
          )}
          <Button type="submit">Show record</Button>
        </form>
        {!valid ? (
          <EmptyState
            title={seasonScope ? "Choose a season" : "Choose an entity"}
            description={
              seasonScope
                ? "Enter a season year from 1950 onward to request a published metric."
                : "Enter the canonical entity ID used by the archive, then choose a metric."
            }
          />
        ) : (
          <DataBoundary
            query={query}
            onRetry={query.error?.status === 409 ? reset : query.refetch}
          >
            {data?.items?.length ? (
              <DataTable
                caption={`${recordMetrics.find((item) => item.value === metric)?.label || metric} records`}
                rows={data.items}
                columns={[
                  { key: "key", label: "Metric" },
                  {
                    key: "value",
                    label: "Value",
                    numeric: true,
                    render: (row) => row.value ?? "Not available",
                  },
                  { key: "unit", label: "Unit" },
                  {
                    key: "coverage",
                    label: "Coverage",
                    render: (row) => (
                      <StatusBadge tone={row.coverage === "complete" ? "success" : "warning"}>
                        {row.coverage || "unknown"}
                      </StatusBadge>
                    ),
                  },
                  { key: "definitionVersion", label: "Definition" },
                  {
                    key: "evidenceId",
                    label: "Evidence",
                    render: (row) => {
                      const path = evidencePath(row, snapshotId);
                      return path ? (
                        <TextLink to={path}>View evidence</TextLink>
                      ) : (
                        "Not supplied"
                      );
                    },
                  },
                ]}
              />
            ) : (
              <EmptyState
                title="No published record"
                description="This metric is unavailable for the selected scope or does not have qualified historical coverage."
              />
            )}
            {data && (data.page.hasMore || params.has("cursor")) && (
              <nav className="pagination" aria-label="Record pages">
                <Button
                  variant="quiet"
                  disabled={!params.has("cursor") || query.isFetching}
                  onClick={reset}
                >
                  First page
                </Button>
                <Button
                  variant="secondary"
                  disabled={!data.page.hasMore || query.isFetching}
                  onClick={() =>
                    setParams(
                      updateParams(params, {
                        cursor: data.page.nextCursor,
                        snapshot: data.meta.snapshotId,
                      }),
                    )
                  }
                >
                  Next page
                </Button>
              </nav>
            )}
          </DataBoundary>
        )}
        <SourceNote meta={data?.meta} />
      </Panel>
    </>
  );
}
