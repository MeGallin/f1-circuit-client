# Season overview checkpoint

Preview `/` or `/?season=2024`. This slice uses real published API data, never the synthetic OpenAPI examples. Dedicated race detail, calendar, standings and source routes remain later stages. Overview calendar expansion and driver/constructor summary tabs work within this slice.

Public configuration: `VITE_API_BASE_URL=https://f1-circuit-api.onrender.com`, also shown in `.env.example`. A local HTTP backend is allowed only on localhost/127.0.0.1. No credentials are accepted in the client URL. Restart Vite after changing environment configuration.

The development server proxies `/api/v1` to that public target. HTTPS verification stays enabled. This avoids requiring a change to the deployed API's production CORS allowlist. Production requests use the configured public API directly. The proxy is development-only, not an API or Render configuration change.

Contract: `contracts/openapi.json`, paths `/seasons`, `/seasons/{year}/summary`, `/seasons/{year}/calendar`. Adapters flatten `data.items` and `data.seasonSummary` and retain `meta` and cursor metadata. Cache tags are season-scoped; entries remain cached for five minutes after unsubscription. Reconnect refetch is enabled, polling and focus refetch are disabled. Summary refresh is explicit. Calendar uses the summary's publication snapshot to avoid mixing datasets. Query arguments and explicit refresh drive requests, not theme changes.

Cold start: one bounded request with a 75-second timeout; an eight-second waiting message explains archive wake-up. Errors retain context and offer explicit retry. No automatic retry storm. RTK Query distinguishes missing current data from stale previous arguments. Unsupported season query values show a selection state instead of silently substituting another year.

Coverage count is imported completed events, not how far a historical season actually progressed. Unknown calendar statuses remain unknown. Standings preserve supplied order and decimal strings. The source note includes coverage, freshness, verification, source attribution and retrieval time in UTC.

Development-only state review URLs: `/?reviewState=loading`, `/?reviewState=error`, `/?reviewState=empty`. These explicitly labelled simulations contain no race facts, make no API requests and are ignored by production builds. Retry returns to the real API. They supplement unit-tested HTTP failure/retry/cache behaviour.
