# Client checkpoints

## Current ribbon senior-review checkpoint - 6 October 2026

The approved ribbon visuals remain unchanged. Senior review corrected calendar
page-contract validation (no partial/duplicate collection), same-latest refresh
scroll/focus preservation, accessible card names matching visible status/actions,
and positive/ordered token validation before generation. Calendar's unreachable
cursor controls and unused overview progress selectors were removed; its separate
progress styles, filters, event details and read-only reload remain intact.

Seventeen intended regressions failed before fixes. Fresh `npm run check` passed
lint, **354 tests across 33 files**, keyed/idempotent token generation, the
unchanged 49-asset prebuild guard and production build. Cancellation and null-total
unavailable coverage are verified. Focused browser checks confirmed current
16/23 results, real keyboard dialog/focus return, expansion/return and Calendar's
23 rounds/seven upcoming filter/reload. See [review evidence](FUNCTIONALITY-VALIDATION.md)
and [QA/proofs](LOCAL-QA.md). Existing scrollTo/chunk warnings remain; production
and exhaustive assistive-technology verification are pending. No API changes,
source imports, commits, pushes or deployments. Earlier counts below are historical.

## Option 2 visual correction checkpoint (before senior review) - 6 October 2026

The initial ribbon's functionality passed review, but its visual treatment was
rejected. The ribbon alone now restores the approved composition: uppercase
Barlow Condensed heading/race names, mono round/status metadata, substantial
filled checkered flags with `Completed`, calendar icons for upcoming races,
inline red/subdued publication count and outlined CTAs. Latest results have a
red round label, card outline and tinted/outlined CTA. `Earlier races` returns
at the left footer; `Show all rounds` remains right-aligned, both outlined.

Each card retains one shared native Button for whole-card click/keyboard
activation. Its inner CTA is a noninteractive styled span, never a nested
button. Real dates and supplied circuit names remain source-backed. Keyed Apex
ribbon tokens scale the composition by container width without changing global
font roles, other overview bands, publication predicates or calendar queries.

Five visual-contract regressions failed before correction; the focused ribbon,
tokens and overview run passed 26 tests across five files. Fresh `npm run check`
passed lint, **335 tests across 33 files**, the 49-asset prebuild guard and
production build. Only the existing jsdom scrollTo/large-chunk warnings remain.
Full-check results and measured proof are recorded in [validation](FUNCTIONALITY-VALIDATION.md)
and [QA](LOCAL-QA.md). The measured width-matched reference comparison is not a
claim of pixel-identical generated typography or raster rendering. Production
verification remains pending; no API changes, imports, commit, push or deployment.

## Initial ribbon functional checkpoint (historical visual treatment) - 6 October 2026

User-approved Option 2 replaces only overview season-progress markers with a
horizontal Season races history ribbon, same-section expanded grid and the
existing selected-event dialog. Counts and latest selection follow result-backed
API records, including legacy omitted coverage, rather than dates or count-index
assumptions. Pinned calendar traversal, snapshot validation, pending labels,
measured/accessible scrolling, resize cleanup and mobile token generation are
covered by regression tests. Other overview bands and mock-up styles are unchanged.

Fresh `npm run check` passed lint, **330 tests across 32 files**, named ribbon token
generation, the original 49-asset physical guard and production build. The final
focused run passed 97 tests across six files. Fifteen intended fail-before
regressions were reproduced. Formatting and diff checks passed; existing jsdom
scrollTo/large-chunk warnings remain. Local browser checks cover current 2026,
historical 2000, long names, Light/Dark, mobile scrolling/expansion and dialog
results/focus/Escape. System appearance and temporary viewport overrides were
restored. [Validation](FUNCTIONALITY-VALIDATION.md), [QA/proof paths](LOCAL-QA.md)
and [the amended contract](OVERVIEW-LAYOUT-IMPLEMENTATION-SPEC.md) record details.

Local client HEAD is `4e7f96f` (countdown fix), matching the cached origin/main ref
at this read-only inspection. The ribbon work is uncommitted. This is not fresh
remote/push verification; no commit, push or deployment was performed. The API
repository remains unchanged and clean; no import/database write was triggered.
Production verification remains pending. Root shared memory is maintained by the
parent separately.

## Earlier October checkpoints (historical)

The application now has API-backed overview, calendar, standings, race/session, entity/comparison, analytics, source and evidence surfaces, plus separate Explore archive search and Ask database-backed questions with optional server-side interpretation; standalone Records remains deferred. The foundation-only navigation and disconnected-data statements below describe an earlier milestone, not the current application. Current-year source refresh, historical archive reload, server cooldown timers, cache invalidation and precise race/pending selection are covered in [season behavior](SEASON-SLICE.md) and [current validation](FUNCTIONALITY-VALIDATION.md).

Local history confirms client `fb7cbd0` and API `734a4ed`. Both pushes are user-confirmed; deployment and production/live smoke verification are **PENDING**. Recorded checks passed 141 client tests, lint and production build, plus 133 API tests, lint/format/contract verification and Newman 114 requests / 192 assertions. Actions secrets/dispatch and real PostgreSQL multi-process locking remain unverified; the client build retains the large-chunk warning. See [local QA limits](LOCAL-QA.md). This documentation update does not run the application or perform new live checks.

The subsequent constructor-logo checkpoint covers all 40 observed
2000–2026 canonical IDs, 287 ID/year pairs and 49 local assets. Senior review
corrected per-record historical-year propagation, token generation and asset
build guards, SVG validation and duplicate React keys. Recorded review checks
passed lint, 296 tests across 28 files and production build, including the
49-asset prebuild guard; these were not rerun for this prose update. Local client
HEAD at that documentation checkpoint was `1092bec`, one commit ahead of cached `origin/main`; the logo push was not
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
