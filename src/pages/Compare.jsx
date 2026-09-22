import { useSearchParams } from "react-router-dom";
import { ArrowsLeftRightIcon } from "@phosphor-icons/react";
import {
  useGetComparisonQuery,
  useGetSeasonsQuery,
} from "../api/archiveApi";
import {
  PageHeading,
  Panel,
  Select,
  Button,
  DataBoundary,
  EmptyState,
  SourceNote,
  DataTable,
  ActionLink,
} from "../components/ui";
import EntityPicker from "../components/EntityPicker";
import { changeFilters, refreshSelection } from "../features/entities/shared";
import {
  isScopedSeason,
  seasonOptionLabel,
} from "../features/season/selectors";
import "../styles/entities.css";
const kinds = ["driver", "constructor", "circuit", "season"];
const metricDefinitions = {
  starts: "Published race starts in the selected season range.",
  wins: "Published race wins in the selected season range.",
  podiums: "Published top-three race finishes in the selected season range.",
  poles: "Published pole positions in the selected season range.",
  "fastest-laps": "Published fastest race laps in the selected season range.",
  points: "Published championship points in the selected season range.",
};
const metrics = Object.keys(metricDefinitions);
export function ComparisonResult({ data }) {
  const result = data?.comparison;
  return (
    <>
      <SourceNote meta={data?.meta} />
      {!result || !result.rows.length ? (
        <EmptyState
          title="Comparison metrics unavailable"
          description="The archive has not published qualified metrics for this selection. Missing values are not zero, and no winner has been inferred."
        />
      ) : (
        <DataTable
          caption={`${result.left.displayName} and ${result.right.displayName} · ${result.fromYear}–${result.toYear}`}
          rows={result.rows}
          rowKey={(r) => r.metricKey}
          columns={[
            { key: "metricKey", label: "Metric" },
            {
              key: "left",
              label: result.left.displayName,
              render: (r) =>
                `${r.left.value ?? "Not supplied"} · ${r.left.unit} · ${r.left.coverage} coverage`,
            },
            {
              key: "right",
              label: result.right.displayName,
              render: (r) =>
                `${r.right.value ?? "Not supplied"} · ${r.right.unit} · ${r.right.coverage} coverage`,
            },
          ]}
        />
      )}
    </>
  );
}
export default function Compare() {
  const [params, setParams] = useSearchParams();
  const seasons = useGetSeasonsQuery();
  const kind = params.get("kind") || "driver",
    metric = params.get("metric") || "wins";
  const from = params.get("fromYear") || params.get("season") || "",
    to = params.get("toYear") || from;
  const leftId = params.get("leftId") || "",
    rightId = params.get("rightId") || "";
  const validKind = kinds.includes(kind),
    validMetric =
      metrics.includes(metric) && !(kind === "circuit" && metric === "points");
  const knownYear = (y) =>
    /^\d{4}$/.test(y) &&
    isScopedSeason(y) &&
    seasons.currentData?.items.some((s) => s.year === Number(y));
  const valid =
    validKind &&
    validMetric &&
    leftId &&
    rightId &&
    leftId !== rightId &&
    knownYear(from) &&
    knownYear(to) &&
    Number(from) <= Number(to);
  const validationMessages = [];
  if (!validKind) validationMessages.push("Choose a supported record type.");
  if (!validMetric) validationMessages.push("Choose a supported metric for that record type.");
  if (!leftId || !rightId)
    validationMessages.push("Choose both records by name.");
  else if (leftId === rightId)
    validationMessages.push("Choose two different records to compare.");
  if (!knownYear(from) || !knownYear(to))
    validationMessages.push("Choose two imported seasons.");
  else if (Number(from) > Number(to))
    validationMessages.push("The start season must be no later than the end season.");
  const query = useGetComparisonQuery(
    {
      kind,
      leftId,
      rightId,
      fromYear: Number(from),
      toYear: Number(to),
      metric,
      snapshotId: params.get("snapshot") || undefined,
    },
    { skip: !valid || params.get("run") !== "1" },
  );
  const update = (values) =>
    setParams(changeFilters(params, { ...values, run: null }));
  const yearOptions = [
    { value: "", label: "Choose season" },
    ...(seasons.currentData?.items || [])
      .filter((s) => isScopedSeason(s.year))
      .map((s) => ({
        value: String(s.year),
        label: seasonOptionLabel(s),
      })),
  ];
  return (
    <div className="entity-stack">
      <PageHeading
        eyebrow="HISTORICAL COMPARISON"
        title="Compare the record"
        description="Compare matching entity types over an explicit season range. Audited metrics may be unavailable even when individual results exist."
        icon={ArrowsLeftRightIcon}
        actions={
          <ActionLink
            to={`/explore?${new URLSearchParams({ season: params.get("season") || "2024" })}`}
          >
            Explore profiles
          </ActionLink>
        }
      />
      <Panel title="Choose a comparison">
        <div className="entity-filters">
          <Select
            label="Compare type"
            value={validKind ? kind : ""}
            options={[
              { value: "", label: "Choose type" },
              ...kinds.map((value) => ({
                value,
                label: value[0].toUpperCase() + value.slice(1),
              })),
            ]}
            onChange={(e) =>
              update({
                kind: e.target.value,
                leftId: null,
                rightId: null,
                leftName: null,
                rightName: null,
                metric: "wins",
              })
            }
          />
          <Select
            label="Metric"
            value={validMetric ? metric : ""}
            options={[
              { value: "", label: "Choose metric" },
              ...metrics
                .filter((m) => kind !== "circuit" || m !== "points")
                .map((value) => ({
                  value,
                  label: value.replaceAll("-", " "),
                })),
            ]}
            onChange={(e) => update({ metric: e.target.value })}
          />
          <p className="muted entity-help">
            {metricDefinitions[metric] || "Choose a metric to see its definition."}
          </p>
        </div>
        <DataBoundary query={seasons}>
          {seasons.currentData && (
            <div className="entity-filters">
              <Select
                label="From season"
                value={from}
                options={yearOptions}
                onChange={(e) => update({ fromYear: e.target.value })}
              />
              <Select
                label="To season"
                value={to}
                options={yearOptions}
                onChange={(e) => update({ toYear: e.target.value })}
              />
            </div>
          )}
        </DataBoundary>
        {validKind && (
          <div className="entity-filters">
            {["Left", "Right"].map((side) => {
              const key = side.toLowerCase();
              return kind === "season" ? (
                <Select
                  key={side}
                  label={`${side} season`}
                  value={params.get(`${key}Id`) || ""}
                  options={[
                    { value: "", label: "Choose season" },
                    ...(seasons.currentData?.items || []).map((s) => ({
                      value: s.id,
                      label: String(s.year),
                    })),
                  ]}
                  onChange={(e) => update({ [`${key}Id`]: e.target.value })}
                />
              ) : (
                <EntityPicker
                  key={`${side}:${kind}`}
                  label={`${side} ${kind}`}
                  kind={kind}
                  value={params.get(`${key}Id`) || ""}
                  displayName={params.get(`${key}Name`) || ""}
                  onChange={(id, entity) =>
                    update({
                      [`${key}Id`]: id || null,
                      [`${key}Name`]: entity?.entity?.displayName || null,
                    })
                  }
                />
              );
            })}
          </div>
        )}
        {!valid && (
          <ul className="entity-validation" role="status" aria-live="polite">
            {validationMessages.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        )}
        <Button
          disabled={!valid || query.isFetching}
          onClick={() =>
            setParams(
              changeFilters(params, {
                kind,
                metric,
                fromYear: from,
                toYear: to,
                run: "1",
              }),
            )
          }
        >
          Compare records
        </Button>
      </Panel>
      {valid && params.get("run") === "1" && (
        <Panel title="Published comparison">
          <DataBoundary
            query={query}
            onRetry={() => refreshSelection(params, setParams, query)}
          >
            {query.currentData && <ComparisonResult data={query.currentData} />}
          </DataBoundary>
        </Panel>
      )}
    </div>
  );
}
