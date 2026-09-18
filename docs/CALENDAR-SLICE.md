# Calendar route

Route: `/calendar?season=2024`. Optional `event` contains the opaque calendar event ID and selects its coverage disclosure. Season changes clear event selection. Browser history preserves selections. Unavailable seasons are never silently replaced.

Uses the existing season catalogue and calendar RTK Query endpoints. The first calendar page requests the latest publication; later pages use the returned cursor and snapshot ID. Expired snapshots restart from the latest first page. Refresh retains season/event selection. No inferred event status or fabricated records.

Mobile uses a single-column list; desktop uses aligned round, event/circuit, UTC date/time and status columns. Event buttons support native Enter/Space selection and pressed state. Navigation retains explicit season selection. Overview spotlight links to the selected calendar event.

The calendar contract supplies circuit names but no city/country location. The selection disclosure explicitly reports that limitation instead of guessing geography. Exact start times appear only when the source supplies minute/second precision. Dataset coverage, provenance, retrieval time, warnings and freshness remain visible through shared components.

Development-only `reviewState=loading|empty|error` renders clearly labelled state simulations with no fake records. Retry returns to real data while preserving season and event query parameters. Production ignores simulation parameters.

Scope ends at calendar. Race detail and standings routes remain future work. No API or deployment changes.
