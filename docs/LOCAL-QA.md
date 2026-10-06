# Primary views: local QA

## Current review evidence — 6 October 2026

Local history confirms client `fb7cbd0` and API `734a4ed`; both pushes are user-confirmed. Deployment and production/live smoke verification for these commits are **PENDING**. Recorded client `npm run check` passed lint, 141 tests across 21 files and production build; final focused season/refresh regressions passed 36/36. API checks passed 133 tests, lint/format, contract verification and Newman 114 requests / 192 assertions, zero failures. Both diff checks passed. Production build retains the existing large-chunk warning.

New regression evidence covers cache invalidation without component-only summary refetch, server-driven cooldown/busy countdowns, unmount/season-change cancellation, final/unknown pending races, suppression of older unknown races after newer completed results, postponed/date-only exclusion and ISO clocks. Parent read-only local browser review observed round 16 with Singapore round 17 next and a countdown; it did not trigger an import or verify production. See [full validation](FUNCTIONALITY-VALIDATION.md).

Production-origin smoke/CORS and deployed commit versions remain pending. Actions secrets/dispatch and real PostgreSQL multi-process locking are unverified. No new accessibility/responsive certification or live import is claimed by this October review, and this prose update repeats no runtime checks. The measurements and archive coverage statements below remain the September checkpoint evidence.

The later constructor-logo implementation/review has separate
[current evidence and proof](CONSTRUCTOR-LOGOS.md), including physical assets,
historical-year regressions and read-only Chromium verification. It does not
claim production verification or supersede the dated accessibility certification
below with a new certification.

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
