import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  useSearchEntitiesQuery,
  useGetComparisonQuery,
  useGetSeasonsQuery,
} from "../api/archiveApi";
import {
  PageHeading,
  Panel,
  Select,
  Input,
  Button,
  DataBoundary,
  EmptyState,
  SourceNote,
  DataTable,
  ActionLink,
} from "../components/ui";
import { changeFilters, refreshSelection } from "../features/entities/shared";
import "../styles/entities.css";
const kinds = ["driver", "constructor", "circuit", "season"];
const metrics = [
  "starts",
  "wins",
  "podiums",
  "poles",
  "fastest-laps",
  "points",
];
function Picker({ side, kind, selected, name, onSelect }) {
  const [term, setTerm] = useState("");
  const [search, setSearch] = useState("");
  const query = useSearchEntitiesQuery(
    { q: search, kind },
    { skip: search.length < 2 },
  );
  return (
    <fieldset className="entity-picker">
      <legend>
        {side} {kind}
      </legend>
      <p>{selected ? `Selected: ${name || selected}` : "No selection"}</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSearch(term.trim());
        }}
      >
        <Input
          label={`Find ${side.toLowerCase()} ${kind}`}
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          minLength={2}
          maxLength={100}
          required
        />
        <Button type="submit" variant="secondary">
          Search {side.toLowerCase()}
        </Button>
      </form>
      {search.length >= 2 && (
        <DataBoundary
          query={query}
          empty={query.isSuccess && !query.currentData?.items.length}
        >
          <ul>
            {query.currentData?.items.map((row) => (
              <li key={row.id}>
                <Button variant="quiet" onClick={() => onSelect(row.entity)}>
                  {row.entity.displayName}
                </Button>
              </li>
            ))}
          </ul>
          {query.currentData?.page.hasMore && (
            <p>More matches exist. Refine the name to narrow your search.</p>
          )}
        </DataBoundary>
      )}
    </fieldset>
  );
}
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
    Number(y) >= 1950 &&
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
    ...(seasons.currentData?.items || []).map((s) => ({
      value: String(s.year),
      label: String(s.year),
    })),
  ];
  return (
    <div className="entity-stack">
      <PageHeading
        eyebrow="HISTORICAL COMPARISON"
        title="Compare the record"
        description="Compare matching entity types over an explicit season range. Audited metrics may be unavailable even when individual results exist."
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
                .map((value) => ({ value, label: value.replaceAll("-", " ") })),
            ]}
            onChange={(e) => update({ metric: e.target.value })}
          />
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
                <Picker
                  key={`${side}:${kind}`}
                  side={side}
                  kind={kind}
                  selected={params.get(`${key}Id`)}
                  name={params.get(`${key}Name`)}
                  onSelect={(entity) =>
                    update({
                      [`${key}Id`]: entity.id,
                      [`${key}Name`]: entity.displayName,
                    })
                  }
                />
              );
            })}
          </div>
        )}
        {!valid && (
          <p role="status">
            Choose two different records of the same type, a supported metric,
            and a valid season range with the start no later than the end.
          </p>
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
