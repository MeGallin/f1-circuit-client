# Calendar route

## Refresh-cache integration — 6 October 2026

Current-year overview source refresh invalidates the selected-season calendar cache together with catalogue, summary/standings, event and session data. Overview calendars remain pinned to their summary publication; standalone calendar pagination/selection retains the behavior described below. Historical overview refresh remains an archive reload. See [current season behavior](SEASON-SLICE.md) and [validation evidence](FUNCTIONALITY-VALIDATION.md).

Local history confirms client `fb7cbd0` and API `734a4ed`; both pushes are user-confirmed. Recorded checks passed 141 client tests with lint/build and 133 API tests, contract/lint/format checks, Newman 114 requests / 192 assertions. Deployment/live smoke is **PENDING**; Actions secrets/dispatch and real PostgreSQL multi-process locking remain unverified. The first-slice scope/deployment statements below are historical.

## Historical calendar slice

Route: `/calendar?season=2024`. Optional `event` contains the opaque calendar event ID and selects its coverage disclosure. Season changes clear event selection. Browser history preserves selections. Unavailable seasons are never silently replaced.

Uses the existing season catalogue and calendar RTK Query endpoints. The first calendar page requests the latest publication; later pages use the returned cursor and snapshot ID. Expired snapshots restart from the latest first page. Refresh retains season/event selection. No inferred event status or fabricated records.

Mobile uses a single-column list; desktop uses aligned round, event/circuit, UTC date/time and status columns. Event buttons support native Enter/Space selection and pressed state. Navigation retains explicit season selection. Overview spotlight links to the selected calendar event.

The calendar contract supplies circuit names but no city/country location. The selection disclosure explicitly reports that limitation instead of guessing geography. Exact start times appear only when the source supplies minute/second precision. Dataset coverage, provenance, retrieval time, warnings and freshness remain visible through shared components.

Development-only `reviewState=loading|empty|error` renders clearly labelled state simulations with no fake records. Retry returns to real data while preserving season and event query parameters. Production ignores simulation parameters.

Scope ends at calendar. Race detail and standings routes remain future work. No API or deployment changes.
