# Historical Home Option3 — 8 October 2026

Superseded by [current authoritative reference fidelity](HOME-REFERENCE-FIDELITY.md).
The full-width-header/2:1:1 composition below is dated historical evidence, not
the current architecture or current test totals.

Earlier local Home contract; superseded the earlier combined race/standings-tabs
composition, not the approved Season races ribbon or countdown. No deployment,
commit, push, source import or live write is authorized or verified by this work.
Configured Cody settings: gpt-6.1-sol/medium; not runtime/billing verification.

## Structure and source boundaries

The inspected user reference is
`C:/Users/garya/.codex/generated_images/01a0afde-8b0a-70c0-8004-86c356b9031d/exec-c876cf97-80ed-4e5f-9f13-0a673bb73b31.png`.
Its illustration is not a source of race facts or country assignments.

- One full-width completed-race header has completion status, round, source title,
  circuit, date, small track layout/source and a left-aligned Open race detail link.
- Desktop previews use a content-height 2:1:1 grid: podium, top-three Drivers,
  top-three Constructors. Both championships are visible without tabs. Compact
  rows retain published rank/points, driver numbers and season-owned team badges.
- Mobile stacks readable panels. A single active expansion follows its owner in
  DOM/mobile reading order; desktop places it across the full row below previews.
  Native Show full results / Show more drivers / Show more constructors controls
  become Show less. Open full standings remains a separate next-line left action.
- Expansion resets on season/event/publication/standing selection. Published GET
  collections load only on expansion and are all-or-nothing: every page is pinned,
  duplicate IDs/cursors, inconsistent totals/coverage/publications and cancellation
  cannot publish partial rows. 409 retries reset publication; other failures retry
  the query. Loading/error/unavailable remain explicit, not invented zero results.
- Previews reject mixed standing snapshots. Standings context must belong to the
  selected season; full results require the returned event's own race session.
  Without a completed race there is no full-results control; without a published
  session it is disabled with loading/missing-context explanation. Unknown rank is
  a labelled dash; missing points say Not supplied; real zero/decimal points remain.
- Header, next-event header and Home history flags use event/circuit country, never
  race-name inference. Profile fallback requires the same circuit ID and, when
  pinned, the same publication. Unknown/unbundled countries retain supplied text;
  absent country adds no flag; failed images fall back to text.

`RaceSummary` contains shared race/leader presentation without a SeasonPanels
import cycle. Confirmed dead Home tab state/styles/container token were removed;
shared Calendar, mockups, constructor theme roles and date/time helpers remain.
Shared image sizing lives in Apex country-flag.css and uses the declared 2.5rem
icon-frame token (40px at normal root font), not natural image dimensions. New
presentation references are tested against actual declarations. No new framework.

## Bundled flag provenance

30 passive 4:3 SVGs (207,805 bytes) come from
[flag-icons v7.5.0](https://github.com/lipis/flag-icons/tree/v7.5.0/flags/4x3),
under its [MIT license](https://github.com/lipis/flag-icons/blob/v7.5.0/LICENSE),
Copyright (c) 2013 Panayiotis Lipiridis. Full license ships in
public/images/flags/LICENSE.md; no runtime CDN or sponsor artwork.
ISO subset: AE AR AT AU AZ BE BH BR CA CN DE ES FR GB HU IN IT JP KR MC MX MY
NL PT QA SA SG TR US ZA. Country aliases cover the observed Home calendar labels;
this is not exhaustive worldwide/historical coverage. Prebuild validates physical
manifest membership, passive SVG content and license before Vite copies assets.

## Executed TDD and checks

Final focused run:123 tests/7 files passed. Final `npm run check` passed lint,
500 tests/47 files, keyed token generation,49 constructor/30 flag asset guards
and the5,270-module production build. All30 flag SVGs plus their license SHA-256
match dist copies. Existing jsdom scrollTo and >500kB chunk warnings remain;
they are not suppressed. No API code changed and no API suite is rerun for this
frontend-only assignment. Formatting, idempotence, source/bundle QA isolation,
current documentation links and both repository diffs are checked separately.

External evidence remains outside both repositories:

- [Initial UI red excerpt](C:/Users/garya/OneDrive/Documents/ChatGPT/F1/audit-2026-10-08/execution-evidence/home-option3-initial-red-excerpt.txt): observed4 failures/1 pass;
  truncated tool capture, not a complete raw log. Initial flag run observed6/1;
  its original complete output was not saved and is not reconstructed here.
- [Placement/cancellation red](C:/Users/garya/OneDrive/Documents/ChatGPT/F1/audit-2026-10-08/execution-evidence/home-option3-review-red.txt):2 failed/17 passed.
- [Publication/mixed-row red](C:/Users/garya/OneDrive/Documents/ChatGPT/F1/audit-2026-10-08/execution-evidence/home-option3-context-red.txt):2 failed/5 passed.
- [Pinned-link/season-context red](C:/Users/garya/OneDrive/Documents/ChatGPT/F1/audit-2026-10-08/execution-evidence/home-option3-link-context-red.txt):2 failed/6 passed.
- [Physical build-guard red](C:/Users/garya/OneDrive/Documents/ChatGPT/F1/audit-2026-10-08/execution-evidence/home-option3-build-guard-red.txt):1 failure/66 skipped.
- [Expanded-name red](C:/Users/garya/OneDrive/Documents/ChatGPT/F1/audit-2026-10-08/execution-evidence/home-option3-expanded-name-red.txt):1 failure/8 skipped.
- [Unknown rank/points red](C:/Users/garya/OneDrive/Documents/ChatGPT/F1/audit-2026-10-08/execution-evidence/home-option3-unknown-rank-points-red.txt):2 failures/9 skipped.
- [Missing race/session red](C:/Users/garya/OneDrive/Documents/ChatGPT/F1/audit-2026-10-08/execution-evidence/home-option3-missing-context-red.txt):2 failures/11 skipped.
- [Invalid expansion context red](C:/Users/garya/OneDrive/Documents/ChatGPT/F1/audit-2026-10-08/execution-evidence/home-option3-invalid-expansion-context-red.txt):1 failure/12 skipped.
- [Wrong profile identity/publication red](C:/Users/garya/OneDrive/Documents/ChatGPT/F1/audit-2026-10-08/execution-evidence/home-option3-profile-country-count-red.txt):2 failures/14 skipped.
- [Final focused green](C:/Users/garya/OneDrive/Documents/ChatGPT/F1/audit-2026-10-08/execution-evidence/home-option3-final-focused-green.txt):123 tests/7 files.
- [Intermediate full check](C:/Users/garya/OneDrive/Documents/ChatGPT/F1/audit-2026-10-08/execution-evidence/home-option3-client-check.txt):492 passed/1 failed;
  loaded the wrapping regression before its fix. Not final certification.
- [Final-state full check](C:/Users/garya/OneDrive/Documents/ChatGPT/F1/audit-2026-10-08/execution-evidence/home-option3-client-final-check.txt).

## Parent browser proof

Actual1440 desktop: natural preview heights370.18/373.72/370.99px; document/client
1426/1426. Singapore/Malaysia/Australia flags loaded at40px. Enter opens22 race
classifications,23 drivers or11 constructors; only one active; Space closes.
Desktop expanded width1124.57px spans below the three-panel row.
Actual390:376/376; driver expansion follows Drivers before Constructors; names
wrap fully after the fix. Actual320:306/306; Results expansion follows its owner
before Drivers. No page overflow in these measured states.

Season2000: Malaysian race uses Malaysia flag; standings snapshot2000:17 shows
Schumacher108/Hakkinen89/Coulthard73;11 constructor records expand. Australian2000
history dialog shows Michael10/Rubens6/Ralf4 and Escape closes. Parent restored
Home2026/no expansion, normal viewport; latest ownership-guard HMR retains all25
Home images with correct countries. Proof is sampled, not all-season/WCAG or
pixel-identical certification.

Screenshots under the external audit implementation-evidence directory:
home-option3-desktop-final.png and home-option3-mobile-expanded-final.png.
Release/user-managed commit/push/deployment and production smoke remain separate.

## Changed-file boundary and final cleanup

[Exact64 absolute task paths](C:/Users/garya/OneDrive/Documents/ChatGPT/F1/audit-2026-10-08/execution-evidence/home-option3-changed-paths.json)
cover22 client code/config/test files,31 flag/license assets,9 client Markdown
records and root AGENTS.md/memory.md. The latter two are outside both Git repos.
Pre-existing dirty API/client documents not edited by this task are excluded from
that inventory and preserved. API status remains only its5 prior dirty documents.

Final formatting and both diffs pass. Re-running the keyed generators leaves9
owned outputs byte-identical. All49 constructor assets also hash-match dist;
production bundle has zero tested browser-QA markers and no QA entry import.
No raw task captures are inside either repository. No additional browser work or
release operation was performed for these cleanup checks.
