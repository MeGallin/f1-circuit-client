# Functionality validation

## Current senior review — 8 October 2026

The [senior-review record](SENIOR-REVIEW-2026-10-08.md) contains current full-check
results, fail-first context/time/metric/tooltip regressions and artifact inventory.
It supersedes earlier totals below without claiming deployment, exhaustive source
accuracy or accessibility certification. Parent browser smoke is accepted.

## Home Previous event removal — 8 October 2026

User-approved live-only removal deletes the render branch, Home-only pending/
previous selection and dedicated previous styles; no CSS hiding or ribbon redesign.
Next event, Calendar adjacency and historical mockups retained. Regression proves
band absence, all-history expansion, old-round details/close/return and next event;
former band assertions now check pending races in the unchanged ribbon.
[Exact red/green and accepted desktop/mobile proof](HOME-PREVIOUS-EVENT-REMOVAL.md).
Earlier full436-test result below predates this scoped followup.

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

## Historical documentation handoff - 6 October 2026

Local client `f7f9ba6` contains the approved ribbon and review fixes; client/API
were clean and matched cached origin refs before this prose-only update. See
[exact Git checkpoint](CHECKPOINT.md). Remote state, deployed versions and live
smoke were not independently verified. The 354-test/33-file full check, 56-test/
seven-file focused check and 17 intended fail-before regressions below were
executed during the earlier 6 October implementation review, not rerun now.
No application, test, build, browser or import operation is part of this pass.
Approved visuals and the documented all-pages snapshot/label/scroll/token
contracts remain unchanged.

## Ribbon senior review (historical execution evidence) - 6 October 2026

Review found and fixed these scoped issues without changing approved visuals:

- **P2 — incomplete calendar acceptance:** truthy/fallback page metadata accepted
  malformed totals, changing totals, duplicate events or no-progress pages. The
  calendar-only validator now requires boolean `hasMore`, a stable nonnegative
  integer total (or API unavailable-coverage `null`), unique event IDs, advancing
  cursors and exact terminal counts. Known totals bound traversal without an
  arbitrary page limit. A terminal omitted cursor remains compatible; errors
  expose no accumulated partial data. Global collection parsing is unchanged.
- **P2 — browsing interrupted by refresh:** a replacement calendar array
  re-centred unchanged latest results. Same-latest refreshes now preserve scroll
  and focus; initial/latest-ID changes, width changes and return from expanded
  mode retain intentional latest positioning and observer cleanup.
- **P2 — accessible label mismatch:** explicit card labels omitted visible
  `Completed`/`View results`/`View event` text. Shared status/action values now
  appear in both accessible names and visible content; one native Button remains.
- **P3 — token validation gaps:** zero fluid sizes/inverted clamps or card bounds
  were accepted, and a missing section threw an incidental TypeError. Keyed
  generation rejects those inputs deliberately before touching output, remains
  idempotent and does not modify base/font tokens.
- **P3 — obsolete consumers/styles:** Calendar retained unreachable cursor state
  and Pager controls after `getCalendar` became all-pages. These and unreferenced
  overview progress selectors were removed. Calendar's own progress selectors,
  filters, details and read-only reload remain; mock-up styles are untouched.

Seventeen intended fail-before regressions were reproduced: ten calendar/consumer,
one scroll/focus, one accessible-name, one dead-style and four token cases. The
Calendar source assertion's first file-URL setup failure is not counted: it was
corrected and rerun against the unfixed implementation. Cancellation already
passed before changes; it aborts a later in-flight request with no accepted
partial data. Null-total unavailable coverage is a passing compatibility case.

At that review, `npm run check` passed lint, **354 tests across 33 files**, ribbon token
generation, the unchanged 49-asset physical guard (1,169,191 bytes) and production
build (5,251 modules). The first attempt stopped at two newly introduced lint
issues, both corrected before this successful complete rerun. Existing jsdom
scrollTo and large-chunk warnings remain. The final focused run passed 56 tests
across seven files. Fourteen scoped source/test/style/config files passed Prettier;
Calendar's pre-existing whole-file formatting differences were verified against
HEAD and left untouched outside the cleanup. All 34 relative links across these
four versioned docs resolve, and both repository diff checks passed.
[Focused browser proof](LOCAL-QA.md)
checks actual current records, keyboard dialog/focus, expansion and the complete
Calendar consumer; same-latest data replacement is deterministic component proof,
not a simulated live import. No API changes, database writes, source refresh,
commit/push/deployment or production certification.

## Option 2 ribbon visual correction (before senior review) - 6 October 2026

Five new regressions failed against the initial delivery: shared whole-card
Button/outlined noninteractive CTA, filled completed flag/calendar icon, compact
inline count/source-only circuit metadata, restored outlined footer controls,
and Apex-owned display/mono/latest-tint styles. After correction, the focused
run passed 26 tests across five files, preserving selection, pending/result
semantics, scrolling, expansion, resize cleanup and the existing dialog.

Container-scaled, validated Apex tokens produce five readable desktop cards;
mobile retains a full card plus a next-card peek when two cannot fit. Heading and
race names use uppercase Barlow Condensed; metadata uses IBM Plex Mono. Completed
labels have filled Phosphor checkered flags, upcoming labels use CalendarBlank,
and latest result cards/rounds/outlined CTAs share the existing red brand tokens.
The full-card native Button remains the sole interactive card element; the
outlined inner CTA span does not introduce nested controls or extra tab stops.
Supplied circuits/dates are real records, not copied from the illustration.

Browser checks confirmed real dialog results with Enter activation, Escape/focus
return, footer scrolling, 23-card mobile expansion/return, no page/CTA overflow
and both themes. [Measured screenshots and visual limits](LOCAL-QA.md) distinguish
composition fidelity from unclaimed pixel equivalence. This correction does not
change query logic, publication counting, other homepage bands or the API.

Fresh `npm run check` passed lint, **335 tests across 33 files**, keyed ribbon
token generation, the unchanged 49-asset prebuild guard and production build.
Existing jsdom scrollTo and large-chunk warnings remain. After the JSON-only
formatting correction, six token/visual tests across two files passed again,
including generation idempotence and unchanged base typography. Five handwritten
source/test files passed Prettier; 28 relative links across four docs and both
repository diff checks passed. No commit, push,
deployment or source import was performed; production verification is pending.

## Initial season races ribbon functionality (historical visual treatment) - 6 October 2026

The approved Option 2 history ribbon replaces only overview progress markers.
It uses actual calendar records, result publication coverage and the legacy
result-backed completion marker when optional coverage is omitted; dates and
result-count indexes never manufacture publication. The latest published event
has the red outline/label. Missing, pending, cancelled and postponed results keep
`View event`; every card uses the existing in-page dialog. A shared card component
serves the horizontal ribbon and the expanded wrapping grid.

Measured scroll controls expose descriptive accessible names, disabled edges,
keyboard activation, proximity snap and reduced-motion-aware scrolling. Width
changes re-centre the latest event by ID; observer cleanup is tested. Apex owns
the new card-width token and mobile controls pattern. Keyed token generation runs
in prebuild and leaves existing typography untouched. The obsolete strip stylesheet
and redundant results wrapper were removed; mock-up styles remain unchanged.

The shared calendar query now traverses all pinned pages so no later rounds are
silently excluded. It rejects wrong first/subsequent publications, missing/malformed
snapshot metadata, malformed collection shape, broken/repeated cursors and server
failures without accepting a partial calendar. Existing loading/error/empty feedback
does not become a misleading zero-count ribbon.

Fifteen intended regression failures were reproduced before their corrections.
The final focused run passed 97 tests across six files. Fresh `npm run check`
passed lint, **330 tests across 32 files**, prebuild ribbon token generation,
the retained 49-asset physical guard and production build. Formatting/diff checks
passed. Existing jsdom scrollTo and large-chunk warnings remain.
Local browser evidence includes 2026 16/23 results, 2000 17/17 results, the long-name
latest card at 390px, real keyboard scrolling, 23-card expansion, dialog results/
focus restoration/Escape and Light/Dark parity with no page overflow. System and
viewport overrides were restored. [QA proof paths](LOCAL-QA.md) and
[the amended design contract](OVERVIEW-LAYOUT-IMPLEMENTATION-SPEC.md) record details.
No API repository changes, database writes, live imports, commits, pushes or
deployments are part of this work. Production smoke, exhaustive assistive-technology
testing and Lighthouse remain unverified. Prior checkpoint counts below are historical.

## Countdown zero-unit correction — 6 October 2026

Active `RaceCountdown` now always renders two-digit H/M/S, including `00` at
minute/hour boundaries. The shared calculation omitted zero parts; rendering
now supplies clock-only placeholders without changing larger-unit visibility,
the concise spoken duration, positive subsecond minimum of one second, precise
schedule requirements or elapsed/pending messages. No new months or estimated
schedule values are introduced. Both standard and wide variants share the fix.

Nine regressions failed before the fix because zero clock columns were absent.
The focused countdown/result-status run passed 31 tests after the correction,
covering live second ticks `01 → 00 → 59`, minute/hour/day rollovers, padded zero
units, subsecond behaviour and unchanged elapsed/pending/unavailable states.
No backend, import, dependency, production control or styling changes are needed.

Fresh `npm run check` passed lint, **307 tests across 29 files**, the 49-asset
prebuild guard and production build. Existing chunk-size and jsdom scrollTo
warnings remain. Parent read-only browser/screenshot review after hot reload
verified the running Singapore countdown and unchanged layout; no live `00`
frame was captured. Zero/rollover proof comes from deterministic component tests,
not that browser screenshot. Earlier constructor-review counts below remain
their recorded checkpoint evidence. No API changes, imports, commits, pushes
or deployment were performed.

## Constructor integration and senior review — 6 October 2026

Recorded constructor coverage is 40 canonical IDs, 287 observed ID/year pairs
across 2000–2026, 40 explicit undated defaults and 49 local assets. This is not
all 1950-onwards constructors or a claim of complete race data. Shared identities
retain API names and provide decorative images, unknown/year/error fallbacks;
historical IDs never alias to successors. Standings, affiliations, overview and
calendar podiums, profiles/search cards, race results and analytics identities
are covered; chart labels, native selects and cross-year comparison headings
remain text. See [the full surface/source register](CONSTRUCTOR-LOGOS.md).

Ten regressions reproduced defects before senior-review corrections: historical
records now pass their own year to badge/link resolution; undated badges use
explicit defaults, not ambient URL years; keyed token generation validates before
writing and leaves base/font tokens intact; SVG namespace/base-URI/CSS-escape
gaps are rejected; repeated team records use distinct React keys; and production
builds validate physical assets before Vite copies them. Regressions include
2000 Williams and 2010 Red Bull under a 2026 profile URL and missing/orphan/unsafe
asset failure paths.

Previously executed `npm run check` passed lint, **296 tests across 28 files**,
the 49-asset guard and production build. All 49 output assets matched public
files byte-for-byte. Existing chunk-size and jsdom scrollTo warnings remain;
raster validation checks signatures, not full decoding. The subsequent documentation-only
pass did not rerun tests/build, inspect production or perform imports.

Local client commit is `1092bec`; push/remote and deployment status are recorded
in [the current checkpoint](CHECKPOINT.md). Download authorisation does not clear
copyright/trademark deployment rights. Earlier test counts below remain dated
race-update and September evidence, not the latest constructor-review count.

## Race-update review — 6 October 2026

Local Git logs confirm client `fb7cbd0` and API `734a4ed`. Both pushes are user-confirmed; deployment and production/live smoke verification for these commits are **PENDING**.

### Fixes and regression evidence

- Current-year refresh posts only the current UTC season to `/refresh-data`. Historical refresh remains a local archive refetch. Outcomes distinguish updated, unchanged, pending, busy, cooldown and no-race; provider errors retain actionable feedback.
- Refresh button and countdown are mutually exclusive. Updated/unchanged/pending/cooldown/busy countdowns use server `retryAfterMs`, automatically restoring the button on expiry. Season changes and unmount abort pending requests, clear timers and prevent late responses from adding feedback or reloading a newly selected season. The timer-cleanup regression now identifies the actual one-second application ticker instead of an unrelated jsdom timer.
- RTK Query invalidates catalogue, selected-season summary/calendar/standings, event and session caches. Other mounted summaries refresh without relying on the overview callback. Calendar/detail arguments remain tied to the summary publication; old selected-season responses do not become current data.
- Next-event selection excludes completed, cancelled/postponed and date-only starts. Pending-result notices use the latest eligible past event, including precise unknown-status events, and remain visible after the final race starts. A newer completed race suppresses an older unknown race's pending notice. Numeric and ISO supplied clocks are covered.
- Companion API fixes recheck shared cooldown under the advisory lock before audit insertion, preserve original errors during cleanup, destroy connections on unlock failure, accept core source removals while preserving omitted enrichments, and prioritize results/standings within a four-minute automatic provider budget. Manual refresh does not import heavy lap/pit-stop data; the automatic start+6h/24h window and 15-minute cadence remain.

Regression failures were reproduced before fixes. Recorded client `npm run check`: lint, 141 tests across 21 files and production build passed. Final focused season/refresh regressions passed 36/36. API `npm run check`: lint/format, 133 tests, OpenAPI/checksum verification and Newman 114 requests / 192 assertions, zero failures. Both `git diff --check` checks passed. These are local review results, not production certification or tests rerun for this documentation update. No live imports, commits, pushes or deployments were performed by the review agent; the user subsequently confirmed both pushes.

### Remaining verification

Production deployment/version, live smoke and production-origin CORS checks are pending. GitHub Actions secret setup/successful dispatch and native PostgreSQL multi-process lock/cooldown checks are unverified. The four-minute provider deadline does not guarantee aggregate database publication within the ten-minute Actions job; the ten-second API shutdown can interrupt an import and leave transaction rollback to PostgreSQL. Build passed with the existing large-chunk warning. September browser/accessibility/device evidence below is historical and was not repeated on 6 October. See [local QA](LOCAL-QA.md), [season behavior](SEASON-SLICE.md) and [selection](SEASON-SELECTION.md).

## Historical validation — 18 September 2026

The following feature, dataset and deployment observations describe that checkpoint only.

## Fixes

Standings pagination retains the original filters and pins only the publication snapshot; introducing a standings-snapshot filter on page two invalidated cursor identity. Regression tests cover latest and round-specific pagination. Missing points, calendar totals, and fastest-lap numbers now have explicit text instead of blank, perpetual loading, or null labels.

## Verification

- `npm run check`: lint, eight test files / 25 tests, production build passed.
- Browser against the existing public API: 2024 overview/calendar, British GP results, qualifying, lap pagination, pit stops, fastest-lap summary, driver/constructor standings, sources, practice-session empty state, missing round 11, unavailable 2026 and 1950, 2024 → 2026 → 2024 selector navigation, unknown-route page, and a deliberately aborted API request showing retry messaging. Initial loading state was observed.
- Automated accessibility audits on loaded overview, calendar, event detail, standings and sources: zero violations in dark and light themes.
- All five routes checked at 320, 390 and 1440 pixels: no document-level horizontal overflow. This is not a claim of exhaustive device or assistive-technology certification.
- RTK pagination and missing-data behavior covered by component tests. Public data remains the 2024 calendar/British GP slice; staged archive data was not exposed.

## Limitations

Dedicated profile/history/comparison pages are not implemented; their API contracts were checked separately. No deployment occurred. Existing deployed API behavior does not include the API fixes made alongside this client change. A favicon request returned 404 during browsing; no application failure was associated with it. Network failure was intentionally injected and interception was removed afterward.
