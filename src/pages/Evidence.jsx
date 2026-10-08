import { useParams, useSearchParams } from "react-router-dom";
import { FileTextIcon } from "@phosphor-icons/react";
import {
  ActionLink,
  DataBoundary,
  EmptyState,
  PageHeading,
  Panel,
  SourceNote,
} from "../components/ui";
import { useGetEvidenceQuery, useGetEventQuery } from "../api/archiveApi";
import "../styles/evidence.css";

const missing = "Not supplied";

const fieldLabels = {
  points: "Points",
  position: "Position",
  statusLabel: "Status",
  status: "Status code",
  classified: "Classification supplied",
  lapsCompleted: "Completed laps",
  lapNumber: "Lap number",
  lap: "Lap",
  sequence: "Stop number",
  durationMs: "Time (milliseconds)",
  validity: "Validity",
  laneDurationMs: "Pit lane duration (milliseconds)",
  stationaryDurationMs: "Stationary duration (milliseconds)",
  isPitInLap: "Pit entry lap",
  isPitOutLap: "Pit exit lap",
  elapsedMs: "Elapsed time (milliseconds)",
  "grid/position": "Grid position",
  "grid/kind": "Grid type",
  "gap/kind": "Gap type",
  "gap/laps": "Gap (laps)",
  "gap/milliseconds": "Gap (milliseconds)",
  "fastestLap/rank": "Fastest lap rank",
  "fastestLap/lapNumber": "Fastest lap number",
  "fastestLap/durationMs": "Fastest lap (milliseconds)",
  "entry/number": "Driver number",
  "entry/constructor/displayName": "Constructor",
};
function humanLabel(path) {
  const relative = path.replace(/^\/items\/\d+\//, "");
  return (
    fieldLabels[relative] ||
    (/^entry\/drivers\/\d+\/displayName$/.test(relative) ? "Driver" : null)
  );
}

export function buildEvidenceViewModel(evidence, recordId, requestedField) {
  const fields = evidence?.fields || [];
  const ids = fields.filter(
    (field) =>
      /^\/items\/\d+\/id$/.test(field.path) && field.selectedValue === recordId,
  );
  const recordFound = !recordId || ids.length === 1;
  const prefix = recordId && recordFound ? ids[0].path.slice(0, -3) : null;
  const recordFields = !recordFound
    ? []
    : prefix
      ? fields.filter((field) => field.path.startsWith(`${prefix}/`))
      : fields;
  const humanFields = recordFields
    .filter((field) => humanLabel(field.path))
    .map((field) => ({ ...field, label: humanLabel(field.path) }));
  const focusedField =
    requestedField && prefix
      ? humanFields.find(
          (field) => field.path === `${prefix}/${requestedField}`,
        ) || null
      : null;
  const names = recordFields
    .filter((field) => /\/entry\/drivers\/\d+\/displayName$/.test(field.path))
    .map((field) => field.selectedValue)
    .filter((value) => typeof value === "string" && value);
  return {
    recordFound,
    fieldFound: !requestedField || Boolean(focusedField),
    focusedField,
    humanFields,
    technicalFields: fields,
    name: names.join(" / ") || "Driver name not supplied",
    sessionId: recordFields.find(
      (field) => field.path === `${prefix}/sessionId`,
    )?.selectedValue,
  };
}

function displayValue(value) {
  if (value == null) return missing;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function safeReference(value) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

function EvidenceField({ field, technical = false }) {
  return (
    <li className="evidence-field">
      <div className="evidence-field-heading">
        <strong>
          {technical
            ? field.path
            : field.label || humanLabel(field.path) || "Published field"}
        </strong>
        <span>
          {field.verification} · {field.coverage}
        </span>
      </div>
      <dl className="evidence-facts">
        <div>
          <dt>Selected value</dt>
          <dd>{displayValue(field.selectedValue)}</dd>
        </div>
      </dl>
      <details>
        <summary>Technical field details</summary>
        <dl className="evidence-facts">
          <div>
            <dt>Path</dt>
            <dd>{field.path}</dd>
          </div>
          <div>
            <dt>Reason</dt>
            <dd>{field.reasonCode || field.selectionReason || missing}</dd>
          </div>
          <div>
            <dt>Rule</dt>
            <dd>{field.ruleVersion || missing}</dd>
          </div>
        </dl>
      </details>
      {field.assertions?.length ? (
        <details>
          <summary>{field.assertions.length} source assertions</summary>
          <ul className="evidence-assertions">
            {field.assertions.map((assertion, index) => {
              const reference = safeReference(assertion.referenceUrl);
              return (
                <li key={`${assertion.sourceId}:${index}`}>
                  <strong>{assertion.sourceId}</strong>
                  <span>Value: {displayValue(assertion.value)}</span>
                  <span>Retrieved: {assertion.retrievedAt || missing}</span>
                  {assertion.sourceVersion && (
                    <span>Version: {assertion.sourceVersion}</span>
                  )}
                  {reference && (
                    <a href={reference} target="_blank" rel="noreferrer">
                      Open source reference
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </details>
      ) : (
        <p className="muted">No source assertions supplied.</p>
      )}
    </li>
  );
}

export default function Evidence() {
  const { evidenceId } = useParams();
  const [params] = useSearchParams();
  const requestedBackPath = params.get("from");
  const backPath =
    requestedBackPath?.startsWith("/") &&
    !requestedBackPath.startsWith("//") &&
    !requestedBackPath.includes("\\") &&
    !Array.from(requestedBackPath).some(
      (character) =>
        character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127,
    )
      ? requestedBackPath
      : "/sources";
  const query = useGetEvidenceQuery({
    evidenceId,
    snapshotId: params.get("snapshot") || undefined,
  });
  const evidence = query.currentData?.evidence;
  const model = buildEvidenceViewModel(
    evidence,
    params.get("recordId"),
    params.get("field"),
  );
  const eventQuery = useGetEventQuery(
    {
      eventId: params.get("event"),
      snapshotId: params.get("snapshot") || undefined,
    },
    { skip: !params.get("event") },
  );
  const detail = eventQuery.currentData?.detail;
  const event =
    model.sessionId &&
    model.sessionId === params.get("session") &&
    detail?.event?.id === params.get("event") &&
    detail?.sessions?.some(
      (session) =>
        session.id === model.sessionId && session.eventId === detail.event.id,
    )
      ? detail.event
      : null;
  return (
    <>
      <PageHeading
        eyebrow="PROVENANCE RECORD"
        title="Evidence detail"
        description="Field-level source assertions for a published archive record. Verification and coverage remain exactly as supplied."
        icon={FileTextIcon}
        actions={
          <ActionLink to={backPath}>
            {requestedBackPath ? "Back to selected record" : "Back to sources"}
          </ActionLink>
        }
      />
      <DataBoundary query={query} onRetry={query.refetch}>
        {evidence ? (
          <>
            <Panel title="Selected record evidence" role="region">
              <p className="evidence-summary">
                {params.get("recordId")
                  ? model.recordFound
                    ? model.name
                    : "Selected record not found in this publication."
                  : "Dataset evidence; no individual record selected."}
                {event
                  ? ` · ${event.name} · ${event.year}`
                  : " · Event context not supplied in the selected evidence."}
              </p>
              {params.get("field") && (
                <p className="evidence-summary">
                  {model.focusedField
                    ? `${model.focusedField.label}: ${displayValue(model.focusedField.selectedValue)}`
                    : "Requested field not found for the selected record. No other record or field has been substituted."}
                </p>
              )}
              {model.focusedField && (
                <p className="evidence-summary">
                  Sources:{" "}
                  {(model.focusedField.assertions || [])
                    .map(
                      (assertion) =>
                        `${assertion.sourceId || missing} (retrieved ${assertion.retrievedAt || missing})`,
                    )
                    .join(" · ") || "No source assertions supplied"}{" "}
                  · {model.focusedField.verification} ·{" "}
                  {model.focusedField.coverage}
                </p>
              )}
              <p className="evidence-summary">
                Source-only: no cross-source check. Partial: records or fields
                may be missing. Assertions are not an independent accuracy
                guarantee.
              </p>
              <details className="evidence-technical">
                <summary>Technical publication details</summary>
                <dl className="evidence-facts evidence-publication">
                  <div>
                    <dt>Evidence ID</dt>
                    <dd>{evidence.evidenceId}</dd>
                  </div>
                  <div>
                    <dt>Snapshot</dt>
                    <dd>{evidence.snapshotId}</dd>
                  </div>
                  <div>
                    <dt>Resource</dt>
                    <dd>{evidence.resourceId}</dd>
                  </div>
                  <div>
                    <dt>Derivation</dt>
                    <dd>{evidence.derivationVersion || missing}</dd>
                  </div>
                </dl>
              </details>
            </Panel>
            <Panel title="Selected record fields">
              {model.humanFields.length ? (
                <ol className="evidence-fields">
                  {[
                    ...(model.focusedField ? [model.focusedField] : []),
                    ...model.humanFields.filter(
                      (field) => field.path !== model.focusedField?.path,
                    ),
                  ].map((field) => (
                    <EvidenceField key={field.path} field={field} />
                  ))}
                </ol>
              ) : (
                <EmptyState
                  title={
                    model.recordFound
                      ? "No human-facing field assertions supplied"
                      : "Selected record not found"
                  }
                />
              )}
            </Panel>
            <details className="evidence-technical">
              <summary>Complete technical assertions</summary>
              <p>
                All dataset records, internal identifiers and JSON paths remain
                available here.
              </p>
              <ol className="evidence-fields">
                {model.technicalFields.map((field) => (
                  <EvidenceField key={field.path} field={field} technical />
                ))}
              </ol>
            </details>
          </>
        ) : (
          <EmptyState
            title="Evidence record unavailable"
            description="The referenced provenance record is not published in this snapshot."
          />
        )}
      </DataBoundary>
      <SourceNote meta={query.currentData?.meta} />
    </>
  );
}
