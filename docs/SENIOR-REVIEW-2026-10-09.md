# Uncommitted API/client senior review — 9 October 2026

Configured Cody settings: gpt-6.1-sol/medium, not independent runtime/billing proof.
Review covers both repositories' tracked/untracked changes, including earlier
user-owned work. Existing edits, approved Home composition, historical mockups,
runtime assets, font licences and reusable tests are preserved. Independent
read-only API/client reviews were relayed by the parent; fixes and executions
below belong to Cody. No commit/push/deploy/import/live mutation.

## Concrete findings fixed

- P2 API malformed evidence: null calendar/result rows and null/non-array driver
  rosters could throw500. Calendar scope now becomes unavailable; invalid race
  classification becomes unavailable, with null race points, while valid standings
  remain independently usable.
- P2 aggregate coverage ignored supplementary driver race evidence. Complete now
  requires complete calendar, standings cells and driver race cells. Missing race
  evidence yields partial aggregate, not complete; missing calendar is unavailable.
  OpenAPI prose/generator and endpoint guide explicitly define this contract.
- P2 Home detail accepted a matching event from a foreign/unavailable publication.
  Podium/full-results session now requires matching publication and usable coverage;
  rejected detail cannot enable expansion or supply podium records.
- P2 circuit-country fallback accepted unavailable/unknown profile coverage.
  Matching circuit/publication now also requires complete/partial profile coverage.
- P2 published results accepted unknown coverage and non-string IDs. Both are
  rejected before any collection is published; valid partial/unavailable semantics
  and exact paging/publication/cancellation guards remain.
- P2 undated entity links inherited the ambient URL season despite undated artwork.
  Links now use only an explicitly supplied record season; undated links make no
  season claim. Dated historical identity/link regressions remain intact.
- P2 published driver number0 was replaced by a truthy fallback in podium/leader
  identities and the Analytics championship model. Nullish fallback now retains
  genuine zero. Source-wide search found no remaining `.number ||`/`.driverNumber ||`
  fallbacks. Missing-rank explanation
  now uses real sr-only text/decorative dash instead of prohibited generic-span
  naming, following the existing number/position accessibility pattern.
- Documentation: current root/reference/spec guidance no longer instructs restoring
  the superseded mosaic or20×15 nationality flags/unchanged Home numerals. Historical
  execution totals are not relabelled as current checks.

## Verification checkpoint

Fail-first API:42 passed/5 failed; after fixes47/47 focused passed. The seven added
cases include two already-green controls (fully complete and missing-calendar).
Full API `npm run check`:210 tests, lint/format, OpenAPI/checksum and fixture-only
Newman117 requests/197 assertions passed, zero failures.

Fail-first client:32 passed/6 failed (profile coverage, collection validation,
undated link); separate Home publication/coverage run37 passed/2 failed.
Final focused `npm test -- --maxWorkers=2` with ui-identity-consistency,
home-country-flags, home-published-collection, home-option-three, season-panels and
entities:102 tests/6files passed.
Late identity regressions:2 passed/2 failed before the zero/rank fix;65 tests/4files
passed afterward. Parent's final static recheck found the same zero-number fallback
in Analytics:4 passed/1 failed before,45 tests/3files passed afterward (number
semantics, analytics-metric-scope and constructor-identity). Both earlier full
client runners were explicitly stopped as superseded after these late findings;
neither is final-source evidence. Frozen final gate started after all code/test edits.

Final frozen client gate: `npm run lint`, `npm test -- --maxWorkers=2` and
`npm run build` passed:669 tests/62files (284.65s),5,278-module build (18.16s).
Prebuild validated49 constructor assets/30 flags. All80 asset/licence copies
SHA-256 match dist (1,378,083 bytes); checked QA/gallery bundle markers are absent.
Audit/Home/constructor-media regeneration changed zero design-system hashes;
API contract regeneration was byte-idempotent, and non-Home OpenAPI semantics
match HEAD despite the larger JSON serialization diff. Both Git diff checks and
scoped formatting passed;92 local documentation links resolved, zero missing.
Known jsdom scrollTo and Vite >500kB chunk warnings remain. No source/test edits
occurred during the frozen gate; final documentation annotations rerun no app tests.

External raw logs: `C:/Users/garya/OneDrive/Documents/ChatGPT/F1/audit-2026-10-08/`
`execution-evidence/senior-review-2026-10-09-` plus
`api-red.txt`, `api-focused.txt`, `api-check.txt`, `client-red.txt`,
`home-pin-red.txt`, `client-focused.txt`, `client-check.txt`.
Late identity logs: `number-red.txt`, `number-focused.txt`,
`analytics-number-red.txt`, `analytics-number-focused.txt`; frozen final gate
uses `client-frozen-check.txt`. Superseded `client-check.txt`/`client-final-check.txt`
are stopped intermediate executions, not completed final gates.
Post-build asset/bundle output: `post-build.txt` under the same external prefix.
Red runs are retained as failures, not final gates. No app tests rerun solely for
subsequent documentation updates.

## Parent browser proof and residual limits

After the Home guard HMR, parent verified1368/client1355: all three cards remain
661.903381px; nationality flags40×30; expansion shows22 published classification
rows, including unchanged source points25/18/15, then collapses. Earlier390 sample
has40×30 flags, identity/platform gaps11.988651px (~12px) and client/scroll376 equal.
External site-wide/senior-review-home-{desktop,mobile}-final.jpg. Parent restored
normal viewport/2026/System/collapsed. No CSS/layout edits in this review.

These are narrow browser/fixture proofs, not whole-site/WCAG/all-season/source-
accuracy certification. Production smoke, provider cadence, live PostgreSQL
concurrency and outstanding rights/manual contrast checks remain separate.
Existing Vite chunk-size/jsdom scroll warnings are not suppressed or fixed here.
Tracked raw txt/log hygiene found only the three required client font licences;
none in API. Raw execution/screenshots stay external; ignored dist/coverage/reports
remain generated, not application source. No test source or licences removed.

## Paths edited by this review

These incremental edits sit on top of the preserved larger uncommitted change set.
API fixture verification also regenerates the existing Postman collection/report;
they remain reusable acceptance infrastructure/summary, not raw execution logs.

```text
C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/AGENTS.md
C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/memory.md
C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/api/README.md
C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/api/docs/ANALYTICS.md
C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/api/docs/ANALYTICS-METRICS.md
C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/api/docs/openapi.json
C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/api/docs/contract-manifest.json
C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/api/scripts/update-home-championship-contract.js
C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/api/src/services/home-championship-graphics.service.js
C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/api/tests/home-championship-graphics.test.js
C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/client/README.md
C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/client/src/api/publishedCollection.js
C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/client/src/components/visuals.jsx
C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/client/src/features/entities/shared.jsx
C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/client/src/features/analytics/components/AnalyticsChampionshipSnapshot.jsx
C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/client/src/features/season/CompletedRaceOverview.jsx
C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/client/src/features/season/RaceSummary.jsx
C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/client/tests/home-country-flags.test.jsx
C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/client/tests/home-published-collection.test.js
C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/client/tests/home-option-three.test.jsx
C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/client/tests/ui-identity-consistency.test.jsx
C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/client/tests/ui-number-semantics.test.jsx
C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/client/docs/CHECKPOINT.md
C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/client/docs/LOCAL-QA.md
C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/client/docs/DESIGN.md
C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/client/docs/FUNCTIONALITY-VALIDATION.md
C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/client/docs/OVERVIEW-LAYOUT-IMPLEMENTATION-SPEC.md
C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/client/docs/HOME-REFERENCE-FIDELITY.md
C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/client/docs/HOME-CHAMPIONSHIP-GRAPHICS.md
C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/client/docs/SENIOR-REVIEW-2026-10-09.md
```
