# Functionality validation

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
