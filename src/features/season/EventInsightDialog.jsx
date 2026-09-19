import { useEffect, useId, useRef } from "react";
import { XIcon } from "@phosphor-icons/react";
import { useGetEventQuery } from "../../api/archiveApi";
import {
  ActionLink,
  Button,
  EmptyState,
  ErrorState,
  RaceStatus,
  Skeleton,
  SourceNote,
  StatusBadge,
} from "../../components/ui";
import { dateLabel } from "./selectors";
import { entryName } from "./raceFormat";
import "../../styles/event-dialog.css";

function scheduleLabel(event) {
  const date = dateLabel(event.schedule?.date);
  if (!event.schedule?.startsAt) return date;
  const time = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(event.schedule.startsAt));
  return `${date} · ${time} UTC`;
}

function EventPodiumPreview({ podium }) {
  const rows = (podium || [])
    .filter((row) => row?.position >= 1 && row.position <= 3)
    .sort((a, b) => a.position - b.position);

  if (!rows.length) return null;
  return (
    <section className="event-dialog-results" aria-labelledby="event-dialog-results-title">
      <div className="event-dialog-section-heading">
        <h3 id="event-dialog-results-title">Top three</h3>
        <span>Race result</span>
      </div>
      <ol className="event-dialog-podium">
        {rows.map((row) => (
          <li key={row.id}>
            <span className="event-dialog-podium-position">
              {String(row.position).padStart(2, "0")}
            </span>
            <div>
              <strong>{entryName(row.entry)}</strong>
              <span>{row.entry?.constructor?.displayName || "Team not supplied"}</span>
            </div>
            <span className="event-dialog-podium-points">
              {row.points == null ? "—" : `${row.points} PTS`}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function EventDialogContent({ event, query }) {
  if (query.isLoading && !query.currentData)
    return <Skeleton label="Loading event details" />;
  if (query.isError && !query.currentData)
    return <ErrorState status={query.error?.status} onRetry={query.refetch} />;

  const detail = query.currentData?.detail;
  if (detail?.podium?.length) return <EventPodiumPreview podium={detail.podium} />;

  const upcoming = ["scheduled", "upcoming"].includes(event.status);
  return (
    <EmptyState
      title={upcoming ? "Results not yet available" : "Top-three result not supplied"}
      description={
        upcoming
          ? "The race has not been published as a completed result in the archive."
          : "This event is present, but the archive does not contain a published top-three result."
      }
    />
  );
}

export function EventInsightDialog({ event, snapshotId, onClose }) {
  const dialogRef = useRef(null);
  const titleId = useId();
  const query = useGetEventQuery(
    { eventId: event?.id, snapshotId },
    { skip: !event?.id },
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;
    const previousFocus = document.activeElement;
    try {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    } catch {
      dialog.setAttribute("open", "");
    }
    dialog.querySelector("button")?.focus();
    return () => {
      if (dialog.open && typeof dialog.close === "function") dialog.close();
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, []);

  if (!event) return null;

  return (
    <dialog
      aria-labelledby={titleId}
      className="event-dialog"
      onCancel={(dialogEvent) => {
        dialogEvent.preventDefault();
        onClose();
      }}
      onClick={(dialogEvent) => {
        if (dialogEvent.target === dialogEvent.currentTarget) onClose();
      }}
      ref={dialogRef}
    >
      <div className="event-dialog-shell">
        <header className="event-dialog-header">
          <div>
            <p className="eyebrow">
              ROUND {event.round ?? "N/A"} · {" "}
              <RaceStatus status={event.status}>
                {event.status || "STATUS NOT SUPPLIED"}
              </RaceStatus>
            </p>
            <h2 id={titleId}>{event.name}</h2>
            <p className="event-dialog-meta">
              {event.circuit?.displayName || "Circuit not supplied"} · {scheduleLabel(event)}
            </p>
          </div>
          <Button
            aria-label="Close event details"
            className="event-dialog-close"
            onClick={onClose}
            variant="quiet"
          >
            <XIcon aria-hidden size={20} />
          </Button>
        </header>
        <div className="event-dialog-status">
          <StatusBadge status={event.status}>
            {event.status || "Status not supplied"}
          </StatusBadge>
          {event.circuit?.country && <span>{event.circuit.country}</span>}
        </div>
        <div className="event-dialog-body">
          <EventDialogContent event={event} query={query} />
        </div>
        <footer className="event-dialog-footer">
          <ActionLink
            to={`/events/${encodeURIComponent(event.id)}?season=${event.year}`}
          >
            Open race detail
          </ActionLink>
          <SourceNote meta={query.currentData?.meta} />
        </footer>
      </div>
    </dialog>
  );
}
