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
import { useGetEvidenceQuery } from "../api/archiveApi";
import "../styles/evidence.css";

const missing = "Not supplied";

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

function EvidenceField({ field }) {
  return (
    <li className="evidence-field">
      <div className="evidence-field-heading">
        <strong>{field.path}</strong>
        <span>
          {field.verification} · {field.coverage}
        </span>
      </div>
      <dl className="evidence-facts">
        <div>
          <dt>Selected value</dt>
          <dd>{displayValue(field.selectedValue)}</dd>
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
      {field.assertions.length ? (
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
    requestedBackPath?.startsWith("/") && !requestedBackPath.startsWith("//")
      ? requestedBackPath
      : "/sources";
  const query = useGetEvidenceQuery({
    evidenceId,
    snapshotId: params.get("snapshot") || undefined,
  });
  const evidence = query.currentData?.evidence;
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
            <Panel title="Publication context">
              <p className="evidence-summary">
                This record shows the source assertions behind the published
                values. Verification and coverage are not upgraded by this
                page.
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
            <Panel title="Field assertions">
              {evidence.fields.length ? (
                <ol className="evidence-fields">
                  {evidence.fields.map((field) => (
                    <EvidenceField key={field.path} field={field} />
                  ))}
                </ol>
              ) : (
                <EmptyState title="No field assertions supplied" />
              )}
            </Panel>
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
