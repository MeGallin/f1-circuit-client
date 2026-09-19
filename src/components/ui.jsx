import { useId, useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
      <ArrowRightIcon aria-hidden size={18} />
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
export function Panel({ title, action, children, className = "", ...props }) {
  const id = useId();
  return (
    <section
      className={`panel ${className}`}
      aria-labelledby={title ? id : undefined}
      {...props}
    >
      {title && (
        <div className="panel-heading">
          <h2 id={id}>{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
export function PageHeading({ eyebrow, title, description, actions }) {
  return (
    <header className="page-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 tabIndex={-1}>{title}</h1>
        {description && <p className="muted page-description">{description}</p>}
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
          <option key={o.value} value={o.value}>
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
      <WarningCircleIcon size={28} aria-hidden />
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
          <ArrowClockwiseIcon size={18} aria-hidden />
          Try again
        </Button>
      )}
    </div>
  );
}
export function Skeleton({ label = "Loading historical data" }) {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 8000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="loading">
      <p role="status">
        {slow
          ? "The archive is taking longer than usual. Your selection is preserved while it responds."
          : label}
      </p>
      <div aria-hidden="true" className="skeleton">
        <i />
        <i />
        <i />
        <i />
      </div>
    </div>
  );
}
export function DataBoundary({ query, children, empty, onRetry }) {
  if (query.isLoading || (!query.currentData && query.isFetching))
    return <Skeleton />;
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
export function DataTable({ caption, columns, rows, rowKey = (r) => r.id }) {
  const id = useId();
  if (!rows.length) return <EmptyState />;
  return (
    <div
      className="table-scroll"
      role="region"
      aria-labelledby={id}
      tabIndex={0}
    >
      <table>
        <caption id={id}>{caption}</caption>
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                className={c.numeric ? "numeric" : ""}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((c, i) => {
                const Cell = i === 0 ? "th" : "td";
                return (
                  <Cell
                    key={c.key}
                    scope={i === 0 ? "row" : undefined}
                    className={c.numeric ? "numeric" : ""}
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
export function SourceNote({ meta }) {
  if (!meta) return null;
  const coverage = meta.coverage || "unknown";
  const verification = meta.verification?.replaceAll("-", " ") || "Unassessed";
  return (
    <aside className="source-note" aria-label="Data provenance">
      <div className="source-summary">
        <StatusBadge>{verification}</StatusBadge>
        <span>{coverage} coverage</span>
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
