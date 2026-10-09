# Season overview checkpoint

## Current Home Option3/time/recovery contract — 8 October 2026

[Approved reference fidelity](HOME-REFERENCE-FIDELITY.md) supersedes the earlier combined
race/tabbed championship layout and its first-viewport geometry requirement.
Current Home uses a combined left race header/podium, simultaneous top-three
championships and single-active pinned expansion. Source-country SVG flags
include header/history/next event; missing profile identity/publication cannot
supply a country. Countdown, time preference, recovery and ribbon controls remain.
No API source-write change or new deployment is verified.

## Historical Home/time/recovery contract — 8 October 2026 (before Option3)

Home has no separate Previous event block on any device; the approved complete
history/details ribbon supersedes it. Equal footer actions keep existing labels,
arrows and expansion/Return behavior. Next event/countdown remains. Latest-race
title, action and winner fit the accepted1440×900 first viewport, without changing
the ribbon composition. Overview/Calendar/Analytics share viewer-local primary
time with explicit zone and UTC secondary; UTC preference/reset persists where
available. Strict zoned timestamps drive the unchanged countdown instant; date-only
records never imply midnight, and unknown/invalid venue zones remain unavailable.
Eight-second slow feedback/retry uses the existing request without duplicating it;
error recovery retains known season choice and never displays stale argument data.
[Current review](SENIOR-REVIEW-2026-10-08.md) owns recorded checks; this prose update
runs no tests or live refresh/import. Older release/Actions pending claims below
are historical and do not override the7 October API TLS evidence or current local
review's unverified deployment boundary.

## Stable active countdown clock — 6 October 2026

The shared race/watch countdown keeps hours, minutes and seconds visible and
two-digit padded even when zero: `00 S` remains between `01 S` and `59 S` at a
minute rollover. Zero minutes/hours likewise remain rather than collapsing
columns. Days and existing larger units retain their prior positive-only display;
the positive subsecond one-second minimum, precise-time requirements, accessible
spoken duration and elapsed/pending states are unchanged. This is presentation
only, not a scheduling/polling or server cooldown change. See
[countdown regression evidence](FUNCTIONALITY-VALIDATION.md).

## Historical season-refresh review — 6 October 2026

Current-UTC-year overview refresh calls `POST /refresh-data` with only the selected current season. The API selects the latest precise scheduled past race and can check it outside the automatic window. Historical refresh reloads the archive query without importing source data. The control distinguishes source outcomes/errors, shows a server `retryAfterMs` countdown for updated/unchanged/pending/cooldown/busy responses, and displays either the button or timer. Changing season/unmount aborts requests and clears timers; late responses cannot reload a newly selected historical season.

Refresh invalidates catalogue, selected-season summary/calendar/standings, event and session caches, including other mounted summaries. Overview calendar and detail data remain pinned to the summary's publication ID. Next-event selection requires minute/second precision and excludes completed, cancelled/postponed entries. The pending notice checks the latest eligible past event, including unknown statuses, survives the final race and does not select an older unknown race after a newer completed one. Numeric/ISO clocks are tested. Unknown statuses remain source facts; timing only determines which notice to show.

Automatic result monitoring retains the start+6h through start+30h default window and 15-minute cadence; a refresh action does not reopen recurring polling. The API rechecks its shared five-minute cooldown under the importer lock and preserves omitted enrichments. Manual checks skip heavy lap/pit-stop imports; automatic imports retain their breadth within a four-minute provider budget.

Local logs confirm client `fb7cbd0` and API `734a4ed`; both pushes are user-confirmed. Recorded checks passed 141 client tests, lint/build and 133 API tests, lint/format/contract checks, Newman 114 requests / 192 assertions. Deployment/live smoke is **PENDING**; Actions secrets/dispatch and real PostgreSQL multi-process locking are unverified. See [validation evidence](FUNCTIONALITY-VALIDATION.md). The following first-slice scope is historical; its disabled-polling statement describes general archive queries, not the later result-status monitor.

## Constructor overview integration — 6 October 2026

The constructor snapshot, driver affiliations, race podium and event dialog use
shared canonical identity badges with API names and the relevant season/event
year. The podium badge remains beside the constructor name below the driver;
both embedded standings tabs switch to one column based on actual panel width
using the Apex `constructorIdentityCompact` token, without changing the approved
band order or driver hierarchy. Names wrap; missing/year/error cases retain text.
This presentation work does not change refresh, polling or source publication.
See [296-test recorded review and sources](CONSTRUCTOR-LOGOS.md),
[current commit/deployment status](CHECKPOINT.md) and
[layout integration note](OVERVIEW-LAYOUT-IMPLEMENTATION-SPEC.md).

## Historical first-slice behavior and configuration

Preview `/` or `/?season=2024`. This slice uses real published API data, never the synthetic OpenAPI examples. Dedicated race detail, calendar, standings and source routes remain later stages. Overview calendar expansion and driver/constructor summary tabs work within this slice.

Public configuration: `VITE_API_BASE_URL=https://f1-circuit-api.onrender.com`, also shown in `.env.example`. A local HTTP backend is allowed only on localhost/127.0.0.1. No credentials are accepted in the client URL. Restart Vite after changing environment configuration.

The development server proxies `/api/v1` to that public target. HTTPS verification stays enabled. This avoids requiring a change to the deployed API's production CORS allowlist. Production requests use the configured public API directly. The proxy is development-only, not an API or Render configuration change.

Contract: `contracts/openapi.json`, paths `/seasons`, `/seasons/{year}/summary`, `/seasons/{year}/calendar`. Adapters flatten `data.items` and `data.seasonSummary` and retain `meta` and cursor metadata. Cache tags are season-scoped; entries remain cached for five minutes after unsubscription. Reconnect refetch is enabled, polling and focus refetch are disabled. Summary refresh is explicit. Calendar uses the summary's publication snapshot to avoid mixing datasets. Query arguments and explicit refresh drive requests, not theme changes.

Cold start: one bounded request with a 75-second timeout; an eight-second waiting message explains archive wake-up. Errors retain context and offer explicit retry. No automatic retry storm. RTK Query distinguishes missing current data from stale previous arguments. Unsupported season query values show a selection state instead of silently substituting another year.

Coverage count is imported completed events, not how far a historical season actually progressed. Unknown calendar statuses remain unknown. Standings preserve supplied order and decimal strings. The source note includes coverage, freshness, verification, source attribution and retrieval time in UTC.

Development-only state review URLs: `/?reviewState=loading`, `/?reviewState=error`, `/?reviewState=empty`. These explicitly labelled simulations contain no race facts, make no API requests and are ignored by production builds. Retry returns to the real API. They supplement unit-tested HTTP failure/retry/cache behaviour.
