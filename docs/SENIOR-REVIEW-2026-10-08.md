# Uncommitted API/client senior review — 8 October 2026

Current review covers the complete uncommitted audit and Home followups, not just
the last footer amendment. Accepted configuration: gpt-6.1-sol / medium; runtime
and billing were not independently verified. Existing unrelated dirty prose was
preserved. This checkpoint supersedes earlier check totals, not historical browser
agreements or deployment records.

## Findings fixed

- **High — evidence attribution and navigation:** `src/pages/Evidence.jsx:179`
  rejects backslash/control-character return paths; `:209` requires the returned
  event detail to contain the selected record's session and event identity.
  A URL alone cannot attribute a record to another race. Record points/source
  remain available when event context is absent.
- **High — chart HTML:** `src/features/analytics/components/AnalyticsCharts.jsx:10`
  escapes record-supplied names/values in custom HTML tooltips; ECharts-generated
  marker markup remains intact. Missing constructor points now produce an honest
  empty state (`:234`), retaining actual zero values.
- **Medium — metric consistency:** API `src/services/analytics.service.js:773`
  uses shared rank eligibility for comparison wins/podiums/fastest laps, excluding
  retained DSQ/DNS ranks without erasing classified-retirement ranks. Qualifying
  uses available published rows (`:317`); standings coverage reflects rejected
  mismatched rows (`:395`). Unused constructor/circuit profile context was removed.
- **Medium — championship ownership and pending filters:** the shared
  `src/features/analytics/championship.js:1` validates object, season, publication,
  round, per-kind coverage and standing identities for both compact summary and
  expanded championship. Missing context cannot throw. Analytics pending entity
  selectors no longer borrow the previous season's options; known season/session
  controls remain usable (`src/pages/Analytics.jsx:469`). Decimal points survive.
- **Medium — time validity:** `src/features/season/timeParsing.js:3` shares the
  strict seconds-preserving parser between telemetry and published schedule/
  countdown. Published times require a zone; malformed calendar/24:00 values are
  unavailable, not normalized into invented starts. Supplied venue zones are
  validated through Intl (`src/features/season/timeDisplay.js:50`).
- **Maintenance — keyed design source:** audit limits/media aliases and shared
  icon dimensions now derive from Apex JSON through
  `scripts/generate-audit-layout-tokens.js:13`; finite positive units, keyed
  regeneration, validation-before-write and idempotence are tested. Chart palette
  fallbacks use exported Apex colors instead of duplicate hex literals. Approved
  dimensions are unchanged, including the named ribbon footer label-width token.
  Dead weekend date-model computation and an unused Analytics wrapper prop were
  removed. Shared table styles remain design-system owned.

## Verification

Nine fail-first executions recorded **18 intended assertion failures** before
fixes: API consistency2, event attribution1, championship/pending/time/venue7,
design2, tooltip1, missing-points chart1, standings coverage1, defensive guards2,
return path1. These counts describe observed executions, not exhaustive defects.
The return-path and coverage captures are explicitly excerpts. Raw captures live
in the external archive below as `senior-review-*-red.txt`.

Final client `npm run check` passed lint, **460 tests / 44 files**, keyed generators,
the **49-assets / 1,169,191-bytes** guard and production build (**5265 modules**).
After the generator's whitespace-only output cleanup, its two focused suites
passed **12 tests**, including idempotence and validation-before-write. API
`npm run check` passed lint, formatting, **163 tests**, pinned OpenAPI structure/checksum, and Newman
**114 requests / 192 assertions / zero failures**. Tests use fixtures/pg-mem and a
loopback Newman server; printed importer test names do not mean live imports.
Intermediate validation exposed stale test fixtures: `available` coverage outside
the contract enum, a championship identity fixture missing publication/round context,
and the old exact prebuild sequence. Fixtures now represent valid context and both
generators before the asset guard; production guards were not relaxed. The retained
full validation capture shows458 passed/2 failed before the last two corrections.
Client lint also caught the control-character regex;
the equivalent character check preserves rejection without disabling lint.

Parent browser accepted valid second-driver18-point attribution; tampered event
kept points/source but showed no event attribution. Normal 2026 Analytics retained
320/556 after round16; mobile390 selectors remained inside their panel, and320
document/client306/306 with all five selectors x28.892..277.472, width248.58.
Home retained13BST alongside12UTC. Proof: `senior-review-evidence-valid.jpg` in
the external `implementation-evidence` folder. Prior twelve-row browser matrix
and Home removal/equal-action measurements remain in their dated records; tests
alone are not browser geometry or full WCAG/source-accuracy certification.

## Evidence archive and QA isolation

Archive: `C:/Users/garya/OneDrive/Documents/ChatGPT/F1/audit-2026-10-08/execution-evidence`.
[Exact original-path/size/SHA-256 inventory](C:/Users/garya/OneDrive/Documents/ChatGPT/F1/audit-2026-10-08/execution-evidence/artifact-inventory.json)
records **62** task-generated client/docs files, **265,860 bytes**. Each source
was untracked, matched an exact dated task prefix, and was hash-verified before
and after recoverable native moves; originals are absent. API had no matching raw
logs. No tests, source assets or font licenses were moved. Only dated `/docs/`
task prefixes are ignored, not blanket `*.txt`. Fresh review captures are created
directly outside both repos. The archive is local evidence, not portable release
content; retain it separately from Git.

The reusable [QA fixture](../tests/browser-qa/README.md) stays under tests: actual
shared UI/styles, deterministic delayed/error/success transport shared with unit
tests, GET-only guards, separate entry/server, no production QA route. Port5175
remains stopped; existing5173/3001 are preserved.

Final production artifacts contain no isolated QA controls, controlled-failure
markers or qaText flag. All49 built constructor assets match source SHA-256 hashes.
Both repositories pass final formatting/diff checks; all external archive links
resolve. Existing jsdom scrollTo and >500kB chunk warnings remain, not test
failures. Build34.83s; main556.65kB/Analytics660.45kB minified. The compact generated
CSS warning was eliminated at the generator, not masked or reformatted only once.
[Full API capture](C:/Users/garya/OneDrive/Documents/ChatGPT/F1/audit-2026-10-08/execution-evidence/senior-review-api-full-green.txt),
[full client capture](C:/Users/garya/OneDrive/Documents/ChatGPT/F1/audit-2026-10-08/execution-evidence/senior-review-client-full-green.txt),
and [complete dirty-path snapshot](C:/Users/garya/OneDrive/Documents/ChatGPT/F1/audit-2026-10-08/execution-evidence/senior-review-changed-paths.txt)
include preserved earlier edits, not sole authorship attribution.

No commit, push, deployment, source import, live write or environment/model change.
User-managed release/live smoke, PostgreSQL concurrency, provider publication,
rights clearance and exhaustive accessibility remain separate verification.
