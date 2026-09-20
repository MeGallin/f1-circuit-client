import { useCallback, useState } from "react";
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
import { MIN_ARCHIVE_YEAR } from "../features/season/selectors";
import EntityPicker from "../components/EntityPicker";
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

function setFilterParams(params, values) {
  const next = new URLSearchParams(params);
  Object.entries(values).forEach(([key, value]) => {
    if (value == null || value === "") next.delete(key);
    else next.set(key, String(value));
  });
  next.delete("cursor");
  next.delete("snapshot");
  return next;
}

function setPageParams(params, values) {
  const next = new URLSearchParams(params);
  Object.entries(values).forEach(([key, value]) => {
    if (value == null || value === "") next.delete(key);
    else next.set(key, String(value));
  });
  return next;
}

function evidencePath(row, snapshotId, from) {
  if (!row.evidenceId) return null;
  const query = new URLSearchParams();
  if (snapshotId) query.set("snapshot", snapshotId);
  if (from) query.set("from", from);
  return `/evidence/${encodeURIComponent(row.evidenceId)}${query.size ? `?${query}` : ""}`;
}

function scopeLabel(scope) {
  return recordScopes.find((item) => item.value === scope)?.label || scope;
}

function metricLabel(metric) {
  return recordMetrics.find((item) => item.value === metric)?.label || metric;
}

function coverageLabel(coverage) {
  if (!coverage) return "Coverage not supplied";
  const labels = {
    complete: "Complete coverage",
    partial: "Partial coverage",
    unavailable: "Coverage unavailable",
    "not-applicable": "Not applicable",
    unknown: "Coverage not supplied",
  };
  return labels[coverage] || coverage.replaceAll("-", " ");
}

function coverageTone(coverage) {
  return coverage === "complete" ? "success" : "warning";
}

function recordTargetLabel({ scope, year, entity }) {
  if (scope === "season") return year ? `${year} season` : "Season not selected";
  return entity?.entity?.displayName || entity?.id || `${scopeLabel(scope)} not selected`;
}

function warningFor(data) {
  return data?.meta?.warnings?.find((warning) => warning?.code) || null;
}

function RecordState({ data, scope, metric, year, entity }) {
  const warning = warningFor(data);
  if (warning?.code === "HISTORICAL_METRIC_NOT_QUALIFIED") {
    return (
      <EmptyState
        title="This metric is not published yet"
        description={`The published archive does not have this ${metricLabel(metric).toLowerCase()} result yet. Try another metric or review source coverage; this view will not fill the gap with an estimate.`}
      />
    );
  }
  if (warning?.code === "SOURCE_COVERAGE_UNAVAILABLE") {
    return (
      <EmptyState
        title="No published coverage for this selection"
        description={warning.message}
      />
    );
  }
  return (
    <EmptyState
      title={`No published ${metricLabel(metric).toLowerCase()} record`}
      description={`There is no published result for ${recordTargetLabel({ scope, year, entity })}. Check the scope, metric and period, or review source coverage.`}
    />
  );
}

function RecordEvidence({ row, metric, targetLabel, periodLabel, snapshotId, from }) {
  const path = evidencePath(row, snapshotId, from);
  if (!path) return "Not supplied";
  const rowLabel = row.key || metricLabel(metric);
  return (
    <TextLink to={path} aria-label={`View ${rowLabel} evidence for ${targetLabel}, ${periodLabel}`}>
      View {rowLabel} evidence
    </TextLink>
  );
}

function RecordMobileList({ rows, metric, targetLabel, periodLabel, snapshotId, from }) {
  return (
    <ul className="records-mobile-list" aria-label={`${metricLabel(metric)} records`}>
      {rows.map((row) => (
        <li className="records-mobile-card" key={row.id || `${row.key}:${row.value}`}>
          <div className="records-mobile-card__headline">
            <span>{row.key || metricLabel(metric)}</span>
            <strong>{row.value ?? "Not available"}</strong>
          </div>
          <dl>
            <div>
              <dt>Unit</dt>
              <dd>{row.unit || "Not supplied"}</dd>
            </div>
            <div>
              <dt>Coverage</dt>
              <dd>
                <StatusBadge tone={coverageTone(row.coverage)}>
                  {coverageLabel(row.coverage)}
                </StatusBadge>
              </dd>
            </div>
            <div>
              <dt>Definition</dt>
              <dd>{row.definitionVersion || "Not supplied"}</dd>
            </div>
            <div>
              <dt>Evidence</dt>
              <dd>
                <RecordEvidence
                  row={row}
                  metric={metric}
                  targetLabel={targetLabel}
                  periodLabel={periodLabel}
                  snapshotId={snapshotId}
                  from={from}
                />
              </dd>
            </div>
          </dl>
        </li>
      ))}
    </ul>
  );
}

function RecordResults({ rows, metric, targetLabel, periodLabel, snapshotId, from }) {
  const caption = `${metricLabel(metric)} for ${targetLabel}, ${periodLabel}`;
  return (
    <div className="records-results">
      <div className="records-desktop-table">
        <DataTable
          caption={caption}
          rows={rows}
          rowKey={(row) => row.id || `${row.key}:${row.value}`}
          columns={[
            { key: "key", label: "Metric" },
            {
              key: "value",
              label: "Value",
              numeric: true,
              render: (row) => row.value ?? "Not available",
            },
            { key: "unit", label: "Unit", render: (row) => row.unit || "Not supplied" },
            {
              key: "coverage",
              label: "Coverage",
              render: (row) => (
                <StatusBadge tone={coverageTone(row.coverage)}>
                  {coverageLabel(row.coverage)}
                </StatusBadge>
              ),
            },
            {
              key: "definitionVersion",
              label: "Definition",
              render: (row) => row.definitionVersion || "Not supplied",
            },
            {
              key: "evidenceId",
              label: "Evidence",
              render: (row) => (
                <RecordEvidence
                  row={row}
                  metric={metric}
                  targetLabel={targetLabel}
                  periodLabel={periodLabel}
                  snapshotId={snapshotId}
                  from={from}
                />
              ),
            },
          ]}
        />
      </div>
      <div className="records-mobile-table">
        <RecordMobileList
          rows={rows}
          metric={metric}
          targetLabel={targetLabel}
          periodLabel={periodLabel}
          snapshotId={snapshotId}
          from={from}
        />
      </div>
    </div>
  );
}

function RecordsFilters({
  scope,
  metric,
  entityId,
  year,
  navigationSeason,
  onSubmit,
  onResolvedEntity,
}) {
  const [formScope, setFormScope] = useState(scope);
  const [formMetric, setFormMetric] = useState(metric);
  const [formEntityId, setFormEntityId] = useState(entityId);
  const [formEntity, setFormEntity] = useState(null);
  const [formYear, setFormYear] = useState(
    year || (scope === "season" ? navigationSeason : ""),
  );
  const [formError, setFormError] = useState("");
  const handleResolvedEntity = useCallback(
    (entity) => {
      setFormEntity(entity);
      if (entityId && formEntityId === entityId && formScope === scope) {
        onResolvedEntity(entity);
      }
    },
    [entityId, formEntityId, formScope, onResolvedEntity, scope],
  );
  const submit = (event) => {
    event.preventDefault();
    const selectedYear = formYear.trim();
    const selectedYearNumber = Number(selectedYear);
    const targetValid =
      formScope === "season"
        ? Number.isInteger(selectedYearNumber) && selectedYearNumber >= MIN_ARCHIVE_YEAR
        : formEntityId.trim().length > 0 && formEntityId.length <= 160;
    if (!targetValid) {
      setFormError(
        formScope === "season"
          ? `Enter a season year from ${MIN_ARCHIVE_YEAR} onward.`
          : `Choose a ${scopeLabel(formScope).toLowerCase()} before showing a record.`,
      );
      return;
    }
    setFormError("");
    onSubmit({
      scope: formScope,
      metric: formMetric,
      entityId: formScope === "season" ? "" : formEntityId.trim(),
      year: formScope === "season" ? selectedYear : "",
      entity: formEntity,
    });
  };

  return (
    <>
      <form className="records-filters" onSubmit={submit}>
        <Select
          label="Scope"
          name="scope"
          value={formScope}
          onChange={(event) => {
            const nextScope = event.target.value;
            setFormScope(nextScope);
            setFormEntityId("");
            setFormEntity(null);
            setFormYear(nextScope === "season" ? year || navigationSeason : "");
            setFormError("");
          }}
          options={recordScopes}
        />
        <Select
          label="Metric"
          name="metric"
          value={formMetric}
          onChange={(event) => {
            setFormMetric(event.target.value);
            setFormError("");
          }}
          options={recordMetrics}
        />
        {formScope === "season" ? (
          <Input
            label="Season year"
            name="year"
            type="number"
            min={MIN_ARCHIVE_YEAR}
            max="2100"
            inputMode="numeric"
            value={formYear}
            onChange={(event) => {
              setFormYear(event.target.value);
              setFormError("");
            }}
            placeholder="e.g. 2024"
            required
          />
        ) : (
          <EntityPicker
            key={formScope}
            label={`${scopeLabel(formScope)} target`}
            kind={formScope}
            value={formEntityId}
            onChange={(value, item) => {
              setFormEntityId(value);
              setFormEntity(item);
              setFormError("");
            }}
            onResolvedChange={handleResolvedEntity}
            placeholder={`Search ${scopeLabel(formScope).toLowerCase()}s by name`}
          />
        )}
        <Button type="submit">Show record</Button>
      </form>
      {formError && (
        <p className="records-form-error" role="alert">
          {formError}
        </p>
      )}
    </>
  );
}

export default function Records() {
  const [params, setParams] = useSearchParams();
  const scope = params.get("scope") || "driver";
  const metric = params.get("metric") || "starts";
  const entityId = params.get("entityId") || "";
  const year = params.get("year") || "";
  const navigationSeason = params.get("season") || "";
  const seasonScope = scope === "season";
  const yearNumber = Number(year);
  const validScope = recordScopes.some((item) => item.value === scope);
  const validMetric = recordMetrics.some((item) => item.value === metric);
  const validTarget = seasonScope
    ? Number.isInteger(yearNumber) && yearNumber >= MIN_ARCHIVE_YEAR
    : entityId.trim().length > 0 && entityId.length <= 160;
  const valid = validScope && validMetric && validTarget;
  const [committedEntity, setCommittedEntity] = useState(null);

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
  const resultFrom = `/records?${params}`;
  const handleCommittedEntity = useCallback((entity) => {
    setCommittedEntity(entity);
  }, []);
  const reset = () => {
    const next = new URLSearchParams(params);
    next.delete("cursor");
    next.delete("snapshot");
    setParams(next);
  };
  const submit = ({ scope: nextScope, metric: nextMetric, entityId: nextEntityId, year: nextYear, entity }) => {
    setCommittedEntity(nextScope === "season" ? null : entity);
    setParams(
      setFilterParams(params, {
        scope: nextScope,
        metric: nextMetric,
        entityId: nextScope === "season" ? undefined : nextEntityId,
        year: nextScope === "season" ? nextYear : undefined,
      }),
    );
  };

  const committedTarget =
    committedEntity?.id === entityId
      ? committedEntity
      : entityId
        ? { id: entityId }
        : null;
  const entityLabel = recordTargetLabel({ scope, year, entity: committedTarget });
  const selectionPeriod = seasonScope
    ? year
      ? `Season ${year}`
      : "Season not selected"
    : "All published archive records";

  return (
    <>
      <PageHeading
        eyebrow="HISTORY & TRUST"
        title="Records"
        description="Published metrics are shown with their definition, coverage and evidence. A missing or unqualified metric remains explicit; the archive never fills it with an invented aggregate."
        actions={
          <ActionLink
            to={
              navigationSeason
                ? `/sources?season=${encodeURIComponent(navigationSeason)}`
                : "/sources"
            }
          >
            View source coverage
          </ActionLink>
        }
      />
      <Panel title="Find a published record">
        <RecordsFilters
          key={`${scope}:${metric}:${entityId}:${year}:${navigationSeason}`}
          scope={scope}
          metric={metric}
          entityId={entityId}
          year={year}
          navigationSeason={navigationSeason}
          onSubmit={submit}
          onResolvedEntity={handleCommittedEntity}
        />
        <section className="records-query-summary" aria-labelledby="records-query-heading">
          <div>
            <p className="records-query-kicker">Current selection</p>
            <h3 id="records-query-heading">
              {metricLabel(metric)} for {entityLabel}
            </h3>
          </div>
          <dl>
            <div>
              <dt>Scope</dt>
              <dd>{scopeLabel(scope)}</dd>
            </div>
            <div>
              <dt>Period</dt>
              <dd>{selectionPeriod}</dd>
            </div>
            <div>
              <dt>Publication</dt>
              <dd>Published archive only</dd>
            </div>
          </dl>
        </section>
        {!valid ? (
          <EmptyState
            title={seasonScope ? "Choose a season" : "Choose an entity"}
            description={
              seasonScope
                ? `Enter a season year from ${MIN_ARCHIVE_YEAR} onward to request a published metric.`
                : `Choose a ${scopeLabel(scope).toLowerCase()} by name, then choose a metric.`
            }
          />
        ) : (
          <DataBoundary
            query={query}
            loadingLabel="Loading the published record"
            onRetry={query.error?.status === 409 ? reset : query.refetch}
          >
            {data?.items?.length ? (
              <RecordResults
                rows={data.items}
                metric={metric}
                targetLabel={entityLabel}
                periodLabel={selectionPeriod}
                snapshotId={snapshotId}
                from={resultFrom}
              />
            ) : (
              <RecordState
                data={data}
                scope={scope}
                metric={metric}
                year={year}
                entity={committedTarget}
              />
            )}
            {data && (data.page.hasMore || params.has("cursor")) && (
              <nav className="pagination records-pagination" aria-label="Record pages">
                <Button
                  variant="quiet"
                  disabled={!params.has("cursor") || query.isFetching}
                  onClick={reset}
                >
                  First page
                </Button>
                <span role="status">
                  {data.page.total != null
                    ? `${data.page.total} ${data.page.total === 1 ? "record" : "records"}`
                    : "Published records"}
                </span>
                <Button
                  variant="secondary"
                  disabled={!data.page.hasMore || query.isFetching}
                  onClick={() =>
                    setParams(
                      setPageParams(params, {
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
