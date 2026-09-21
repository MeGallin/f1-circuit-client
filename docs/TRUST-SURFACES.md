# Trust surfaces — 21 September 2026

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
