# Primary views: local QA

## Current senior-review proof — 8 October 2026

Parent accepted record/event ownership, current championship and contained320/390
filters; Home time remains unchanged. [Review/check/archive details](SENIOR-REVIEW-2026-10-08.md)
are current; earlier matrices below retain their measured scope. Reusable GET-only
QA remains in tests;5175 is stopped, normal5173/3001 preserved. Raw logs are external.

## Latest Home proof — 8 October 2026

Parent confirms Previous event absent in live DOM, approved23-round history intact
and next event/countdown retained: actual desktop1309×818 document/client1295/1295;
mobile390×844376/376, no page overflow. Screenshots in audit implementation-evidence:
`previous-event-removed-desktop.jpg` and `previous-event-removed-mobile.jpg`.
Viewport restored; System appearance untouched. [Scoped verification](HOME-PREVIOUS-EVENT-REMOVAL.md).

## Accepted audit handoff — 8 October 2026 (before Home followup)

All twelve UI/UX audit gates are implemented and parent-browser accepted.
Final client `npm run check` passed lint,436 tests/43 files, keyed ribbon tokens,
49-asset guard and production build; companion API passed160 tests,
lint/format/contract and Newman114 requests/192 assertions, zero failures.
Existing jsdom scrollTo and >500kB chunk warnings remain. Full counts are executed
8 October evidence, not results inferred from documentation changes.

[The authoritative audit matrix](UX-AUDIT-IMPLEMENTATION-VERIFICATION.md)
records source definitions, retained meaningful red logs, exact browser geometry,
controlled recovery and200% root-font (not native zoom) proofs. Championship and
selected totals stay distinct; time preference is shared; evidence is record-aware;
telemetry bounds remain explicitly unknown. Approved ribbon unchanged.
Audit code/docs remain uncommitted; no push/deploy/import/live write.
Earlier dated checkpoints below are historical; production/live smoke,
source publication/cron/locking and exhaustive accessibility remain separate.

## Repeatable audit QA — 8 October 2026

The current audit uses measured parent CSS geometry, not jsdom layout. For
repeatable controlled recovery/enlarged text, use the isolated
[GET-only fixture](../tests/browser-qa/README.md). Collapse its controls and verify
actual root32 before200% measurements; it is not native zoom. Document width alone
does not prove unclipped controls. Latest normal Ask/Explore320 controls fit;
Calendar Upcoming7 intentionally scrolls into view on focus; final Overview winner
889.84px stays above900. Exact screenshots and all measurements are in the audit
matrix above. No AI question/manual refresh/import was performed.

## Historical documentation handoff - 6 October 2026

The approved ribbon/review implementation is committed locally as `f7f9ba6`.
Client and companion API working trees were clean and matched their cached origin
refs before these documentation edits; [checkpoint](CHECKPOINT.md) records exact
identifiers and pending remote/deployment verification. No browser, test/build,
source import or production check was repeated for this prose-only pass. All
counts, measurements and screenshots below are dated earlier execution evidence,
not fresh captures. The recorded full review passed 354 tests/33 files and the
focused run passed 56 tests/seven files; 17 intended regressions failed before fixes.
The user-approved corrected appearance remains the current reference, without
claiming pixel equivalence or production certification.

## Ribbon senior-review QA (historical execution evidence) - 6 October 2026

At that review, `npm run check` passed lint, 354 tests across 33 files, token generation,
the unchanged 49-asset guard and production build. Seventeen intended failures
were reproduced before fixes; [findings and test limits](FUNCTIONALITY-VALIDATION.md)
record the exact scope. Same-latest replacement scroll/focus preservation and
abort-without-partial-data are component/query tests, not claims of a live refresh.

Focused browser verification used a separate hidden QA browser/tab at its default
1280px CSS viewport (document/scroll widths both 1265px), with System appearance
left unchanged and no viewport override. Current overview remained 16/23; Enter
on the updated latest card opened actual results and Escape restored its focus.
Expansion displayed 23 cards and returning restored latest positioning. Calendar
rendered all 23 rounds, its Upcoming filter settled to seven events, and read-only
Refresh calendar retained the full collection. No manual source refresh/import
was invoked. The QA tab was closed; parent's tab was not controlled. Prior
mobile/theme/historical visual evidence below was not rerun in this scoped review.

Fresh inspected proofs in `C:/Users/garya/AppData/Local/Temp/f1-season-races-option2/`:

- `senior-review-overview.jpg`: unchanged approved composition after expand/return.
- `senior-review-calendar.jpg`: retained separate progress, full-season filter counts.

Existing scrollTo/chunk warnings remain. Production, Lighthouse and exhaustive
assistive-technology verification remain pending; no commit/push/deployment.

## Option 2 visual correction (before senior review) - 6 October 2026

The user rejected the initial visual treatment; its functional checks below
remain historical evidence. The corrected ribbon was inspected beside the
approved 1774px image, with its 1724px panel scaled to the measured live 1107px
section width. The live content width is 1067px: heading 30.943px, race names
20px (both Barlow Condensed), filled flags 24px, arrows 68px and CTAs 44px.
Cards measure about 178px wide and 251px high, with five readable rounds 14–18.
Live panel height is about 454px versus 405px for the width-scaled reference;
real circuit/date metadata and accessible CTA sizing are retained. This is a
measured composition comparison, not pixel-equivalence certification.

Mobile requested/measured CSS viewport was 390×844; document client/scroll widths
both measured 375px. The 309px ribbon viewport shows a full 168px latest card
plus the next-card peek, with no page overflow or overflowing CTA labels.
Heading/count remain inline. Enter on the whole card opened the actual Bahrain
results, Escape restored card focus, `Earlier races` moved horizontal scroll,
and expanding all 23 cards/returning restored the ribbon/latest positioning.
Light and Dark were inspected; System appearance and the temporary viewport
override were restored, and the separate QA tab was closed. Parent tab 1 was
not controlled. No import/refresh action was triggered.

Fresh local proofs under `C:/Users/garya/AppData/Local/Temp/f1-season-races-option2/`:

- `desktop-ribbon-context.jpg`: corrected ribbon with neighbouring bands.
- `mobile-ribbon-context.jpg` and `mobile-light-ribbon-context.jpg`: mobile themes.
- `reference-live-width-comparison.jpg`: approved panel above, live panel below,
  scaled to equal width; only cropping/resizing/composition of real captures.

Five visual regressions failed before correction; focused checks passed 26 tests
across five files. Fresh `npm run check` passed lint, 335 tests across 33 files,
keyed tokens, the 49-asset guard and production build (existing scrollTo/chunk
warnings only). Full-check results are recorded in [validation](FUNCTIONALITY-VALIDATION.md).
No production, Lighthouse or exhaustive assistive-technology certification is
claimed. [The amended contract](OVERVIEW-LAYOUT-IMPLEMENTATION-SPEC.md) records
the preserved whole-card Button and source-only content rules.

## Initial season races ribbon QA (historical visual treatment) - 6 October 2026

Option 2 replaces only overview thin markers with chronological race cards and
the existing selected-event dialog. Fail-before evidence covers absent ribbon
semantics/controls/pinned traversal (eight regressions), omitted legacy coverage
(one), wrong/malformed first-page snapshot metadata (three), viewport re-centring
(one) and precise past pending labels (two). Subsequent checks also cover cursor
loops, malformed/error pages, empty/loading/error boundaries, dialog focus return,
same-section expansion, named mobile tokens and generator idempotence.

Final focused checks passed 97 tests across six files. Fresh `npm run check`
passed lint, 330 tests across 32 files, prebuild ribbon token generation, the
retained 49-asset physical validation guard and production build. Formatting and
`git diff --check` passed. Existing jsdom scrollTo/large-chunk warnings remain.

Browser QA used a separate in-app tab after the separate Chrome inspection timed
out. Current 2026 showed 16/23 published results; desktop showed rounds 14-17,
including the latest long-name result plus next race. At 390px the full 220px
latest card remained readable in a 309px ribbon viewport with no page overflow.
The QA tab measured CSS `innerWidth: 390`, `innerHeight: 844`, document/scroll
width 375px and device-pixel ratio 1 (the scrollbar accounts for the difference).
Parent's separate requested-390px check measured CSS width 355px because of its
browser zoom; that narrower check also had no page overflow. These are distinct
measurements, not an assertion that every requested viewport equals CSS width.
Keyboard activation moved the real horizontal scroll position; the 23-card expanded
mobile grid also had no page overflow. Current and historical dialogs loaded their
real podiums; close restored card focus and Escape closed the historical dialog.
Year 2000 showed 17/17 results, latest Malaysian Grand Prix and a disabled later
button. Light and Dark were checked; System and temporary viewport overrides were
restored. Parent independently verified desktop scrolling to the disabled final
edge, all 23 cards and return-to-latest positioning. No live import was triggered.

Saved local proofs: `C:/Users/garya/AppData/Local/Temp/f1-season-races-ribbon/`
contains `mobile-ribbon.jpg`, `mobile-dialog.jpg`, `mobile-expanded-dark.jpg`,
`desktop-ribbon-dark.jpg`, `historical-2000-light.jpg` and
`historical-2000-mobile.jpg`. These are local development evidence, not deployment,
exhaustive device/assistive-technology or Lighthouse certification.
See [the amended contract](OVERVIEW-LAYOUT-IMPLEMENTATION-SPEC.md) and
[validation](FUNCTIONALITY-VALIDATION.md).

## Countdown zero-unit correction — 6 October 2026

Nine fail-before component regressions reproduced missing zero H/M/S columns.
Focused verification passed 31 countdown/result-status tests after the shared
rendering fix, including actual one-second ticker rollover `01 → 00 → 59`,
minute/hour/day boundaries and both standard/wide variants. Subsecond minimum,
elapsed/pending/unavailable messages and larger-unit behaviour remain unchanged.
Fresh `npm run check` passed lint, 307 tests across 29 files, the 49-asset guard
and production build (existing chunk/scrollTo warnings). No new fixture/QA route
remains in the repository. Parent read-only overview screenshot review after hot
reload verified the running Singapore countdown and unchanged layout, leaving
Dark appearance unchanged. It did not capture a live `00` frame: deterministic
component tests provide zero/rollover evidence, not that screenshot. No production
verification is claimed. See [validation](FUNCTIONALITY-VALIDATION.md).

## Historical race-update review evidence — 6 October 2026

Local history confirms client `fb7cbd0` and API `734a4ed`; both pushes are user-confirmed. Deployment and production/live smoke verification for these commits are **PENDING**. Recorded client `npm run check` passed lint, 141 tests across 21 files and production build; final focused season/refresh regressions passed 36/36. API checks passed 133 tests, lint/format, contract verification and Newman 114 requests / 192 assertions, zero failures. Both diff checks passed. Production build retains the existing large-chunk warning.

New regression evidence covers cache invalidation without component-only summary refetch, server-driven cooldown/busy countdowns, unmount/season-change cancellation, final/unknown pending races, suppression of older unknown races after newer completed results, postponed/date-only exclusion and ISO clocks. Parent read-only local browser review observed round 16 with Singapore round 17 next and a countdown; it did not trigger an import or verify production. See [full validation](FUNCTIONALITY-VALIDATION.md).

Production-origin smoke/CORS and deployed commit versions remain pending. Actions secrets/dispatch and real PostgreSQL multi-process locking are unverified. No new accessibility/responsive certification or live import is claimed by this October review, and this prose update repeats no runtime checks. The measurements and archive coverage statements below remain the September checkpoint evidence.

### Constructor implementation/review evidence

The recorded final client check passed lint, 296 tests across 28 files, the
49-asset prebuild guard and production build. Coverage is 40 canonical IDs and
287 observed ID/year pairs (2000–2026), not comprehensive race-data completeness.
The earlier expanded gallery loaded 91/91 instances; current and year-2000
standings loaded 11/11 badges, including 390px mobile without page overflow.
The senior-review Chromium check loaded 24/24 constructor badges in the 2010
Bahrain classification, with archive artwork, 2010 links and no page overflow.
System appearance/default viewport were restored. These are recorded earlier
checks, not browser/test/build executions for the prior documentation-only pass.

See [proof paths, failure-before evidence and limits](CONSTRUCTOR-LOGOS.md).
Local implementation is committed as `1092bec`; [checkpoint status](CHECKPOINT.md)
does not claim a confirmed logo push or deployment. This does not supersede the
dated accessibility certification below with a new certification. Existing
chunk/scrollTo warnings, raster signature-only validation and brand-use clearance
limits remain explicit.

## Historical QA — 18 September 2026

Completed 18 September 2026. Local preview: http://127.0.0.1:5173 . No deployment performed.

## Focused fixes

- Existing Sources navigation and provenance links now open a minimal real provider-status page backed by the documented API. Unknown routes show a genuine not-found view instead of promising already-built features.
- Route changes focus the persistent main landmark so asynchronously replaced headings do not lose keyboard focus. Invalid tab selections retain an accessible panel name and a keyboard entry point.
- Expired overview-calendar snapshots refresh the parent summary. Cached empty responses no longer suppress refresh errors or snapshot-specific retry instructions.
- Overview sibling panels now have distinct React keys; the duplicate-key console warning is resolved.
- Slow-request copy describes possible archive wake-up without diagnosing the cause. The existing request timeout remains 75 seconds, with explicit retry.
- Development state simulations, design specimen and on-demand accessibility tooling are eliminated from the production bundle. No dependencies added.

## Verification

- Lint, 21 tests across seven files, and production build pass. Failure/retry tests cover all four route components. Tests also cover the delayed loading message, actual request timeout with simulated time, nullable values, exact timing/points, cursor/snapshot refresh safety and keyboard tabs.
- Browser axe-core WCAG 2 A/AA and 2.1 AA scans: overview, calendar, race results and standings each pass in light and dark themes with zero violations and zero unresolved scan items. A round label on a generic span was replaced by ordinary accessible text after scan review. Automated scanning does not replace assistive-technology testing.
- All four routes checked at 320, 390 and 1440 pixels: document widths 305, 375 and 1425 respectively with scrollbars; no horizontal page overflow. Shared reduced-motion rules retained. System theme restored after checks.
- Real British GP results, qualifying, laps and pit stops load; driver and constructor standings, calendar and overview load through the existing local proxy. Partial and unavailable coverage remains explicit. Bahrain has no imported sessions; round 11 standings and Practice 1 datasets are genuinely unavailable, not substituted.
- Latest/round selection, season rejection, keyboard tab switching, back/forward history, lap-page refresh, overview/calendar links, provenance disclosure and labelled development error/retry states checked. Final overview reload produces no new browser console errors.
- Minimal Sources page verified against the real published Jolpica status and retrieval time. No claims about providers absent from the response.
- npm audit: zero vulnerabilities. Tracked project files contain no TypeScript/configuration; runtime dependencies remain React, React Router, Redux Toolkit, React Redux and Phosphor icons. No component library added. Credential-pattern checks found no secrets in source, public files, contracts, docs or production assets; only the public example environment file is tracked. No em dashes found in JSX source. Production contains none of the development audit/specimen/state-review markers.
- Production asset sizes: approximately 400 kB JavaScript (128 kB gzip), 31 kB CSS (5.8 kB gzip), plus four self-hosted font files (about 83 kB combined). No large dependency introduced. This is a bundle sanity check, not a Lighthouse/Core Web Vitals certification.

## Review limits

The primary frontend views are ready for user review. The archive currently contains one season and partial imported event/round data. Missing podiums, validity, stationary pit durations and other fields remain missing. No data has been inferred to fill gaps.

The slow/failed/timeout paths were tested deterministically; Render's actual idle-to-awake transition was not forced, and no service setting was changed. Production hosting, CORS on the eventual production domain, deployment configuration and a production-origin runtime test remain deployment-stage checks. Driver/circuit profiles, progression and other unbuilt features are not advertised as implemented.
