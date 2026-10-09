import { APEX_ICONS, APEX_SIZES } from "../design-system/apex.tokens";
import { useId, useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import "../design-system/audit-layout.tokens.css";
import "../design-system/table.css";
import "../design-system/reflow.css";
import "../design-system/ui-consistency.css";
import {
  ArrowRightIcon,
  ArrowClockwiseIcon,
  FlagCheckeredIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";

export function Button({
  variant = "primary",
  children,
  className = "",
  ...props
}) {
  return (
    <button
      className={`button button--${variant} ${className}`}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}
export function ActionLink({ to, children, variant = "secondary", ...props }) {
  return (
    <Link className={`button button--${variant}`} to={to} {...props}>
      {children}
      <ArrowRightIcon aria-hidden size={APEX_ICONS.action} />
    </Link>
  );
}
export function TextLink({ to, children, ...props }) {
  return (
    <Link className="text-link" to={to} {...props}>
      {children}
    </Link>
  );
}
export function Panel({
  title,
  eyebrow,
  icon: Icon,
  action,
  children,
  className = "",
  ...props
}) {
  const id = useId();
  return (
    <section
      className={`panel ${className}`}
      aria-labelledby={title ? id : undefined}
      {...props}
    >
      {title && (
        <div className="panel-heading">
          <div className={Icon ? "panel-heading-copy" : undefined}>
            {Icon && (
              <Icon
                className="panel-heading-icon"
                aria-hidden
                size={APEX_SIZES.icon}
              />
            )}
            <div className="panel-heading-titles">
              {eyebrow && <p className="eyebrow panel-eyebrow">{eyebrow}</p>}
              <h2 id={id}>{title}</h2>
            </div>
          </div>
          {action && <div className="panel-actions">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
export function PanelBody({ children, className = "", ...props }) {
  return (
    <div className={`panel-body ${className}`} {...props}>
      {children}
    </div>
  );
}
export function PageHeading({
  eyebrow,
  title,
  description,
  actions,
  icon: Icon,
}) {
  return (
    <header className="page-heading">
      <div className={Icon ? "page-heading-copy" : undefined}>
        {Icon && (
          <Icon
            className="page-heading-icon"
            aria-hidden
            size={APEX_ICONS.pageHeading}
          />
        )}
        <div>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1 tabIndex={-1}>{title}</h1>
          {description && (
            <p className="muted page-description">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  );
}
export function Select({ label, options, id: supplied, ...props }) {
  const generated = useId();
  const id = supplied || generated;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select id={id} {...props}>
        {options.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
export function Input({ label, id: supplied, ...props }) {
  const generated = useId();
  const id = supplied || generated;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} {...props} />
    </div>
  );
}
export function Tabs({ label, items, value, onChange, children }) {
  const id = useId();
  const selected = items.some((item) => item.value === value);
  return (
    <>
      <div className="tabs" role="tablist" aria-label={label}>
        {items.map((item, index) => (
          <button
            key={item.value}
            id={`${id}-${item.value}`}
            role="tab"
            type="button"
            aria-selected={value === item.value}
            aria-controls={`${id}-panel`}
            tabIndex={
              value === item.value || (!selected && index === 0) ? 0 : -1
            }
            onClick={() => onChange(item.value)}
            onKeyDown={(event) => {
              let next;
              if (event.key === "ArrowRight") next = (index + 1) % items.length;
              if (event.key === "ArrowLeft")
                next = (index - 1 + items.length) % items.length;
              if (event.key === "Home") next = 0;
              if (event.key === "End") next = items.length - 1;
              if (next !== undefined) {
                event.preventDefault();
                onChange(items[next].value);
                document.getElementById(`${id}-${items[next].value}`)?.focus();
              }
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={selected ? `${id}-${value}` : undefined}
        aria-label={selected ? undefined : label}
        tabIndex={0}
      >
        {children}
      </div>
    </>
  );
}
export function RaceStatus({
  status,
  children,
  tone = "neutral",
  badge = false,
  className = "",
}) {
  const label = children ?? status ?? "";
  const statusValue = typeof status === "string" ? status : label;
  const isCompleted =
    typeof statusValue === "string" &&
    statusValue.trim().toLowerCase() === "completed";
  const classes = [
    "race-status",
    badge ? "status" : "",
    badge ? `status--${tone}` : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes}>
      {isCompleted && (
        <FlagCheckeredIcon
          className="race-status-icon"
          size="1em"
          weight="regular"
          aria-hidden
        />
      )}
      <span>{label}</span>
    </span>
  );
}

export function StatusBadge({ children, tone = "neutral", status }) {
  return (
    <RaceStatus status={status} tone={tone} badge>
      {children}
    </RaceStatus>
  );
}
export function CircuitName({ name, className = "" }) {
  return (
    <div className={`circuit-name ${className}`.trim()}>
      <span className="circuit-name-label">Circuit</span>
      <strong>{name}</strong>
    </div>
  );
}
export function DriverNumber({ number, className = "" }) {
  if (number === null || number === undefined || number === "") return null;
  return (
    <span className={`driver-number ${className}`.trim()}>
      <span className="sr-only">{`Driver number ${number}`}</span>
      <span aria-hidden="true">{number}</span>
    </span>
  );
}
const availabilityTone = {
  available: "success",
  complete: "success",
  upcoming: "neutral",
  pending: "warning",
  missing: "warning",
  "optional-unavailable": "warning",
  stale: "warning",
  unavailable: "warning",
  "service-error": "warning",
  unsupported: "neutral",
  "no-match": "neutral",
};
export function AvailabilityBadge({ status = "unknown", children }) {
  const label = children || status.replaceAll("-", " ");
  return (
    <StatusBadge tone={availabilityTone[status] || "neutral"}>
      {label}
    </StatusBadge>
  );
}
function freshnessLabel(meta) {
  const freshness = meta?.freshness;
  if (freshness && typeof freshness === "object") {
    if (freshness.throughEventName && freshness.throughDate)
      return `Results through ${freshness.throughEventName} · ${freshness.throughDate}`;
    if (freshness.throughEventName)
      return `Results through ${freshness.throughEventName}`;
    if (freshness.retrievedAt)
      return `Checked ${new Date(freshness.retrievedAt).toLocaleDateString("en-GB", { timeZone: "UTC" })} UTC`;
  }
  if (meta?.lastSuccessfulRetrieval)
    return `Checked ${new Date(meta.lastSuccessfulRetrieval).toLocaleDateString("en-GB", { timeZone: "UTC" })} UTC`;
  return null;
}
export function FreshnessSummary({ meta, cutoff, className = "" }) {
  const eventName =
    cutoff?.eventName || meta?.freshness?.throughEventName || null;
  const date = cutoff?.date || meta?.freshness?.throughDate || null;
  const detail = eventName
    ? `Results through ${eventName}${date ? ` · ${date}` : ""}`
    : freshnessLabel(meta);
  if (!detail) return null;
  return (
    <p className={`source-summary ${className}`.trim()}>
      <span>{detail}</span>
    </p>
  );
}
export function Metric({ label, value, detail }) {
  return (
    <div className="metric">
      <span className="muted">{label}</span>
      <strong>{value ?? "Not available"}</strong>
      {detail && <span className="muted">{detail}</span>}
    </div>
  );
}
export function EmptyState({
  title = "No records available",
  description = "This source does not currently contain data for this selection.",
  action,
}) {
  return (
    <div className="state">
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
export function ErrorState({ onRetry, status }) {
  return (
    <div className="state" role="alert">
      <WarningCircleIcon size={APEX_ICONS.status} aria-hidden />
      <h3>
        {status === 404 ? "Record not found" : "We could not load this data"}
      </h3>
      <p>
        {status === 409
          ? "The data snapshot has changed. Refresh this view to continue."
          : "Your selection is preserved. The archive may be temporarily unavailable."}
      </p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          <ArrowClockwiseIcon size={APEX_ICONS.action} aria-hidden />
          Try again
        </Button>
      )}
    </div>
  );
}
export const SLOW_LOAD_THRESHOLD_MS = 8000;
export function Skeleton({ label = "Loading historical data", onRetry }) {
  const [slow, setSlow] = useState(false);
  const [checking, setChecking] = useState(false);
  const [recoveryError, setRecoveryError] = useState(false);
  const pending = useRef(false);
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    const timer = setTimeout(() => setSlow(true), SLOW_LOAD_THRESHOLD_MS);
    return () => {
      mounted.current = false;
      clearTimeout(timer);
    };
  }, []);
  const retry = async () => {
    if (pending.current) return;
    pending.current = true;
    setRecoveryError(false);
    setChecking(true);
    try {
      await onRetry();
    } catch {
      if (mounted.current) setRecoveryError(true);
    } finally {
      pending.current = false;
      if (mounted.current) setChecking(false);
    }
  };
  return (
    <div className="loading">
      <p role="status">
        {checking
          ? "Checking the existing request. Your selection is preserved; an active request is not duplicated."
          : recoveryError
            ? "Unable to check the request. Your selection is preserved. Try again or change your selection."
            : slow
              ? "The archive is taking longer than usual. Your selection is preserved while it responds."
              : label}
      </p>
      {slow && onRetry && (
        <>
          <Button variant="secondary" disabled={checking} onClick={retry}>
            Retry load
          </Button>
          <p>
            Pending reads are checked, not restarted. If the request fails, use
            Try again; you can also change a known selection.
          </p>
        </>
      )}
      <div aria-hidden="true" className="skeleton">
        <i />
        <i />
        <i />
        <i />
      </div>
    </div>
  );
}
export function DataBoundary({
  query,
  children,
  empty,
  onRetry,
  loadingLabel,
}) {
  if (query.isLoading || (!query.currentData && query.isFetching))
    return <Skeleton label={loadingLabel} onRetry={onRetry || query.refetch} />;
  if (query.isError && !query.currentData)
    return (
      <ErrorState
        status={query.error?.status}
        onRetry={onRetry || query.refetch}
      />
    );
  return (
    <div aria-busy={query.isFetching || undefined}>
      {query.isError && (
        <ErrorState
          status={query.error?.status}
          onRetry={onRetry || query.refetch}
        />
      )}
      {query.isFetching && (
        <p className="refresh-note" role="status">
          Updating this view…
        </p>
      )}
      {empty ? <EmptyState /> : children}
    </div>
  );
}
export function tableFocusScrollDelta({
  left,
  right,
  identityRight,
  targetLeft,
  targetRight,
  gap = 0,
}) {
  const start = Math.max(left, identityRight) + gap;
  const end = right - gap;
  if (targetLeft < start) return targetLeft - start;
  if (targetRight > end) return targetRight - end;
  return 0;
}
export function DataTable({ caption, columns, rows, rowKey = (r) => r.id }) {
  const id = useId();
  const stickyIdentity = columns.some((column) => column.stickyIdentity);
  const explicitRowHeader = columns.some((column) => column.rowHeader);
  const cellClass = (column) =>
    [
      column.numeric ? "numeric" : "",
      column.stickyIdentity ? "table-sticky-identity" : "",
    ]
      .filter(Boolean)
      .join(" ");
  if (!rows.length) return <EmptyState />;
  return (
    <div
      className={`table-scroll${stickyIdentity ? " table-scroll--identity" : ""}`}
      role="region"
      aria-labelledby={id}
      tabIndex={0}
      aria-describedby={stickyIdentity ? `${id}-hint` : undefined}
      onFocusCapture={(event) => {
        const region = event.currentTarget;
        const target = event.target;
        if (
          !stickyIdentity ||
          target === region ||
          target.closest(".table-sticky-identity")
        )
          return;
        requestAnimationFrame(() => {
          if (
            !region.isConnected ||
            !target.isConnected ||
            target.ownerDocument.activeElement !== target
          )
            return;
          const identity = region.querySelector(".table-sticky-identity");
          if (!identity || getComputedStyle(identity).position !== "sticky")
            return;
          const bounds = region.getBoundingClientRect();
          const focused = target.getBoundingClientRect();
          const style = getComputedStyle(target);
          const gap =
            (parseFloat(style.outlineWidth) || 0) +
            Math.max(0, parseFloat(style.outlineOffset) || 0);
          const delta = tableFocusScrollDelta({
            left: bounds.left,
            right: bounds.right,
            identityRight: identity.getBoundingClientRect().right,
            targetLeft: focused.left,
            targetRight: focused.right,
            gap,
          });
          if (delta) region.scrollBy({ left: delta, behavior: "instant" });
        });
      }}
    >
      {stickyIdentity && (
        <p id={`${id}-hint`} className="table-scroll-hint">
          Scroll horizontally; the driver stays visible. Arrow keys scroll this
          region.
        </p>
      )}
      <table>
        <caption id={id}>{caption}</caption>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col" className={cellClass(c)}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((c, i) => {
                const isRowHeader = explicitRowHeader ? c.rowHeader : i === 0;
                const Cell = isRowHeader ? "th" : "td";
                return (
                  <Cell
                    key={c.key}
                    scope={isRowHeader ? "row" : undefined}
                    className={cellClass(c)}
                  >
                    {c.render ? c.render(row) : (row[c.key] ?? "N/A")}
                  </Cell>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function Pagination({
  page = 1,
  hasMore,
  total,
  onNext,
  onPrevious,
  busy,
}) {
  return (
    <nav className="pagination" aria-label="Results pages">
      <Button
        variant="quiet"
        disabled={page === 1 || busy}
        onClick={onPrevious}
      >
        Previous
      </Button>
      <span>
        Page {page}
        {total != null
          ? ` · ${total} ${total === 1 ? "record" : "records"}`
          : ""}
      </span>
      <Button variant="secondary" disabled={!hasMore || busy} onClick={onNext}>
        Next
      </Button>
    </nav>
  );
}
export function SourceNote({ meta, inset = false }) {
  if (!meta) return null;
  const coverageLabels = {
    complete: "Complete coverage",
    partial: "Partial coverage",
    unavailable: "Coverage unavailable",
    "not-applicable": "Not applicable",
  };
  const verificationLabels = {
    "source-only": "Source only",
    unassessed: "Not assessed",
    reconciled: "Reconciled",
    conflict: "Conflict flagged",
  };
  const coverage = coverageLabels[meta.coverage] || "Coverage not supplied";
  const verification =
    verificationLabels[meta.verification] || "Verification not supplied";
  return (
    <aside
      className={`source-note${inset ? " source-note--inset" : ""}`}
      aria-label="Data provenance"
    >
      <div className="source-summary">
        <StatusBadge>{verification}</StatusBadge>
        <span>{coverage}</span>
        {freshnessLabel(meta) && <span>{freshnessLabel(meta)}</span>}
        <TextLink to="/sources">About the data</TextLink>
      </div>
      <details>
        <summary>Source details</summary>
        <p>
          Retrieved:{" "}
          {meta.lastSuccessfulRetrieval
            ? new Date(meta.lastSuccessfulRetrieval).toLocaleString("en-GB", {
                timeZone: "UTC",
              }) + " UTC"
            : "Not available"}
        </p>
        {meta.sources?.map((s) => (
          <p key={s.id}>{s.attribution || s.name}</p>
        ))}
        {meta.warnings?.map((w, i) => (
          <p key={i}>{w.message}</p>
        ))}
      </details>
    </aside>
  );
}
