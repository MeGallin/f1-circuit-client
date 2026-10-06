# Trust surfaces — 21 September 2026

## Current review status — 6 October 2026

Local logs confirm client `fb7cbd0` and API `734a4ed`; both pushes are user-confirmed. Deployment and production/live smoke verification for these commits are **PENDING**. The race-refresh review passed 141 client tests, lint/build and 133 API tests, lint/format/contract verification, Newman 114 requests / 192 assertions. Actions secrets/dispatch and real PostgreSQL multi-process locking are unverified. See [current validation](FUNCTIONALITY-VALIDATION.md) and [season refresh/provenance behavior](SEASON-SLICE.md). The route and deployed-question observations below describe the 21 September checkpoint and were not live-rechecked for this review.

## Constructor artwork trust boundary — 6 October 2026

Badges identify canonical constructors, not verified race facts or exact seasonal
liveries. All 49 local assets for 40 observed IDs/287 year pairs have recorded
[source URLs, transformations and rights limitations](CONSTRUCTOR-ASSET-SOURCES.md).
Copyrighted download authorisation is not commercial/deployment-rights clearance;
no endorsement, sponsor approval or unrestricted licence is implied. Names and
publication provenance remain API-backed. Historical IDs never inherit successor
marks, and unsupported records remain text.

SVGs are external `<img>` assets, not raw markup injection. The prebuild guard
rejects missing/orphan files, active SVGs, external references, namespace/base-URI
and escaped-CSS gaps; raster signatures are checked, not fully decoded. Recorded
senior review passed 296 tests across 28 files, lint and build. See
[review/accessibility/fallback guidance](CONSTRUCTOR-LOGOS.md) and
[local commit versus pending remote/deployment status](CHECKPOINT.md).

## Historical trust-surface details — 21 September 2026

The client exposes the API's provenance rules directly in the user-facing routes. The dedicated Records surface is intentionally deferred; this checkpoint is local only and no frontend deployment was performed.

## Routes

- `/explore`: deterministic search over the published archive using the API's canonical entity kinds. Search results preserve the returned snapshot and cursor, expose the supplied entity path and evidence ID, and show partial coverage without turning missing data into a match.
- `/evidence/:evidenceId`: shows publication identity, field paths, selected values, verification and coverage, selection reasons, rules, nested source assertions and safe HTTP(S) references. A missing or expired record stays in the shared error state.
- `/questions`: sends a read-only `POST /questions` request with a bounded natural-language question and explicit nullable context fields. The optional context is collapsed initially. Answered values are rendered without generated factual prose; answer details and evidence remain disclosures. Clarification choices are supplied by the API and can be selected; unsupported and disabled responses remain explicit.

These routes reuse the Apex controls, data boundaries and provenance disclosure. They do not infer totals, fill missing values, or treat provider health as event completeness.

## Deferred Records surface

The dedicated `/records` page, navigation entry, browse links, client API hooks, and API operations are removed until a later version. This does not remove generic archive records, race records, profile history, or normalized database records; it removes only the standalone Records experience and its unsupported contract.

Reintroduce the feature only when all of the following are true:

- qualified backend aggregates exist for each advertised scope and metric, with explicit historical scoring and credit rules;
- every published value has source and evidence lineage, coverage metadata, and a stable snapshot contract;
- one API-owned, scope-aware capability contract can drive the client controls without static or misleading options; and
- populated, partial, unavailable, error, pagination, accessibility, and responsive UI journeys are covered by real contract-shaped tests.

The previous implementation remains recoverable through focused Git history; no source archive data was deleted.

## Verification

- `npm run check`: ESLint passed, 13 test files / 48 tests passed, and the production Vite build passed.
- `git diff --check`: clean at the checkpoint commits.
- Browser review: `/questions` showed the bounded form, nullable context controls and initial state. Direct `/records` is now handled by the application not-found state.
- The deployed API's current `/questions` response was checked directly and returned HTTP 200 with `status: unavailable` and `reasonCode: FEATURE_DISABLED`; the client is designed to display that response without implying that question interpretation is active.

## Limits

The public archive remains a partial publication. Missing metrics and evidence are shown as unavailable or not supplied. The question layer is disabled in the current API deployment. Production-origin CORS, hosting and deployment checks remain deployment-stage work.
