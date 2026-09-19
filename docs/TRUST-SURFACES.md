# Trust surfaces — 19 September 2026

The client now exposes the API's provenance and qualification rules directly in the user-facing routes. This checkpoint is local only; no frontend deployment or repository push was performed.

## Routes

- `/records`: requests the contract's `scope`, `metric`, and required `entityId` or season `year`. Values remain strings when supplied as strings. Each row keeps its coverage, definition version and evidence link. Cursor pages retain the returned snapshot ID.
- `/evidence/:evidenceId`: shows publication identity, field paths, selected values, verification and coverage, selection reasons, rules, nested source assertions and safe HTTP(S) references. A missing or expired record stays in the shared error state.
- `/questions`: sends a read-only `POST /questions` request with a bounded question and explicit nullable context fields. Answered values are rendered without generated factual prose. Clarification choices are supplied by the API and can be selected; unsupported and disabled responses remain explicit.

All three routes reuse the Apex controls, data boundaries and provenance disclosure. They do not infer totals, fill missing values, or treat provider health as event completeness.

## Verification

- `npm run check`: ESLint passed, 13 test files / 48 tests passed, and the production Vite build passed.
- `git diff --check`: clean at the checkpoint commits.
- Browser review: `/records?scope=season&metric=points&year=2024` showed the real API's explicit no-published-record state and provenance; `/questions` showed the bounded form, nullable context controls and initial state.
- The deployed API's current `/questions` response was checked directly and returned HTTP 200 with `status: unavailable` and `reasonCode: FEATURE_DISABLED`; the client is designed to display that response without implying that question interpretation is active.

## Limits

The public archive remains a partial publication. Missing metrics and evidence are shown as unavailable or not supplied. The question layer is disabled in the current API deployment. Production-origin CORS, hosting and deployment checks remain deployment-stage work.
