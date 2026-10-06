# Client checkpoints

## Current checkpoint — 6 October 2026

The application now has API-backed overview, calendar, standings, race/session, entity/comparison, analytics, source and evidence surfaces, plus separate Explore archive search and Ask database-backed questions with optional server-side interpretation; standalone Records remains deferred. The foundation-only navigation and disconnected-data statements below describe an earlier milestone, not the current application. Current-year source refresh, historical archive reload, server cooldown timers, cache invalidation and precise race/pending selection are covered in [season behavior](SEASON-SLICE.md) and [current validation](FUNCTIONALITY-VALIDATION.md).

Local history confirms client `fb7cbd0` and API `734a4ed`. Both pushes are user-confirmed; deployment and production/live smoke verification are **PENDING**. Recorded checks passed 141 client tests, lint and production build, plus 133 API tests, lint/format/contract verification and Newman 114 requests / 192 assertions. Actions secrets/dispatch and real PostgreSQL multi-process locking remain unverified; the client build retains the large-chunk warning. See [local QA limits](LOCAL-QA.md). This documentation update does not run the application or perform new live checks.

The subsequent constructor-logo checkpoint covers all 40 observed
2000–2026 canonical IDs, 287 ID/year pairs and 49 local assets. Senior review
corrected per-record historical-year propagation, token generation and asset
build guards, SVG validation and duplicate React keys. Recorded review checks
passed lint, 296 tests across 28 files and production build, including the
49-asset prebuild guard; these were not rerun for this prose update. Local client
HEAD is `1092bec`, one commit ahead of cached `origin/main`; the logo push is not
user-confirmed or freshly remote-verified. Deployment/live smoke remain pending.
See [current constructor verification](CONSTRUCTOR-LOGOS.md).
This work does not change the push/deployment status of the race-update commits.

## Historical foundation and components review

Local preview: http://127.0.0.1:5173/design. Run `npm ci` then `npm run dev` to restart. Do not deploy this checkpoint.

Complete: React JavaScript foundation, Redux store shell, self-hosted approved fonts, Apex token layer, dark/light/system preference, responsive navigation, buttons/links, panels, inputs/selects, keyboard tabs, table overflow region, pagination, loading/empty/error states and provenance component. The specimen labels all content as demonstration material, not race data.

Review: hierarchy, charcoal/red palette, type pairing, narrow-screen controls and both themes. Use the three specimen tabs to inspect controls, data states and responsive table. The accessibility button performs an in-browser WCAG A/AA audit; this supplements manual inspection.

Next: RTK Query API integration and season overview, then calendar, race/session analysis, standings and source views. Navigation currently leads to an explicit foundation checkpoint rather than simulated feature screens. The public API is already configured in `.env.example`; do not put secrets in client configuration. Real data is not connected in this checkpoint.

Production domain remains https://f1.livenotice.co.uk. No deployment was performed.

## Next checkpoint completed

The real season overview now runs at http://127.0.0.1:5173/. See [SEASON-SLICE.md](SEASON-SLICE.md) for API behaviour and scope. Dedicated route groups remain next at this historical checkpoint; the original component specimen is still at /design.
