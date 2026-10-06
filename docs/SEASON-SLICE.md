# Season overview checkpoint

## Current season-refresh behavior — 6 October 2026

Current-UTC-year overview refresh calls `POST /refresh-data` with only the selected current season. The API selects the latest precise scheduled past race and can check it outside the automatic window. Historical refresh reloads the archive query without importing source data. The control distinguishes source outcomes/errors, shows a server `retryAfterMs` countdown for updated/unchanged/pending/cooldown/busy responses, and displays either the button or timer. Changing season/unmount aborts requests and clears timers; late responses cannot reload a newly selected historical season.

Refresh invalidates catalogue, selected-season summary/calendar/standings, event and session caches, including other mounted summaries. Overview calendar and detail data remain pinned to the summary's publication ID. Next-event selection requires minute/second precision and excludes completed, cancelled/postponed entries. The pending notice checks the latest eligible past event, including unknown statuses, survives the final race and does not select an older unknown race after a newer completed one. Numeric/ISO clocks are tested. Unknown statuses remain source facts; timing only determines which notice to show.

Automatic result monitoring retains the start+6h through start+30h default window and 15-minute cadence; a refresh action does not reopen recurring polling. The API rechecks its shared five-minute cooldown under the importer lock and preserves omitted enrichments. Manual checks skip heavy lap/pit-stop imports; automatic imports retain their breadth within a four-minute provider budget.

Local logs confirm client `fb7cbd0` and API `734a4ed`; both pushes are user-confirmed. Recorded checks passed 141 client tests, lint/build and 133 API tests, lint/format/contract checks, Newman 114 requests / 192 assertions. Deployment/live smoke is **PENDING**; Actions secrets/dispatch and real PostgreSQL multi-process locking are unverified. See [validation evidence](FUNCTIONALITY-VALIDATION.md). The following first-slice scope is historical; its disabled-polling statement describes general archive queries, not the later result-status monitor.

## Historical first-slice behavior

Preview `/` or `/?season=2024`. This slice uses real published API data, never the synthetic OpenAPI examples. Dedicated race detail, calendar, standings and source routes remain later stages. Overview calendar expansion and driver/constructor summary tabs work within this slice.

Public configuration: `VITE_API_BASE_URL=https://f1-circuit-api.onrender.com`, also shown in `.env.example`. A local HTTP backend is allowed only on localhost/127.0.0.1. No credentials are accepted in the client URL. Restart Vite after changing environment configuration.

The development server proxies `/api/v1` to that public target. HTTPS verification stays enabled. This avoids requiring a change to the deployed API's production CORS allowlist. Production requests use the configured public API directly. The proxy is development-only, not an API or Render configuration change.

Contract: `contracts/openapi.json`, paths `/seasons`, `/seasons/{year}/summary`, `/seasons/{year}/calendar`. Adapters flatten `data.items` and `data.seasonSummary` and retain `meta` and cursor metadata. Cache tags are season-scoped; entries remain cached for five minutes after unsubscription. Reconnect refetch is enabled, polling and focus refetch are disabled. Summary refresh is explicit. Calendar uses the summary's publication snapshot to avoid mixing datasets. Query arguments and explicit refresh drive requests, not theme changes.

Cold start: one bounded request with a 75-second timeout; an eight-second waiting message explains archive wake-up. Errors retain context and offer explicit retry. No automatic retry storm. RTK Query distinguishes missing current data from stale previous arguments. Unsupported season query values show a selection state instead of silently substituting another year.

Coverage count is imported completed events, not how far a historical season actually progressed. Unknown calendar statuses remain unknown. Standings preserve supplied order and decimal strings. The source note includes coverage, freshness, verification, source attribution and retrieval time in UTC.

Development-only state review URLs: `/?reviewState=loading`, `/?reviewState=error`, `/?reviewState=empty`. These explicitly labelled simulations contain no race facts, make no API requests and are ignored by production builds. Retry returns to the real API. They supplement unit-tested HTTP failure/retry/cache behaviour.
