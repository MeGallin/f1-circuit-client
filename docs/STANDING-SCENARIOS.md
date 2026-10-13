# Title outlook dialog — 13 October 2026

Latest [comprehensive senior review](SENIOR-REVIEW-2026-10-13.md) supersedes earlier
verification totals below: full client720/65 and API300/check/Newman117/197, with
status/evidence consistency, pinned calendar context and explicit final parent
visual acceptance. Presentation remains the approved tidy; no new design changes.

## Current presentation tidy

This client-only amendment supersedes the initial modal presentation below, which
the user rejected. One outlined Trophy/Title outlook Button is right-aligned in
the existing cutoff-note row beneath Refresh, inside the Standings context group.
The toolbar/selectors retain their single baseline. Metrics have no duplicate
outlook heading/trigger; Championship leader identifies their existing leader.
The dialog and accessible close name consistently use Title outlook.

The shared native modal shell/sticky close/scroll lock are unchanged. Its title
uses Apex's existing section-size/body-family/section-weight tokens (18px/700 IBM
Plex Sans), matching Panel headings, and PanelBody spacing6 instead of event header
spacing8. These overrides are title-only; existing event titles are unchanged.
Panel/PanelBody/Metric/StatusBadge give a concise status, next-event hero and
condition rows, then two compact scenario cards. Existing Home's canvas/surface
card treatment and shared tokens are reused, without a new theme or assets.
Cards stack at the existing mobile breakpoint. The keyed breakpoint is kept in
one owned media block; removed summary-action/prose selectors have no consumers.

For a possible next clinch, binding conditions, wins-countback-at-limit and the
additional partial-coverage condition remain upfront. If no next clinch is proven,
one blocker summary replaces the condition list; the full supplied conditions
remain in closed details. A matching next/earliest possible event uses one inline
Earliest possible tag, with its zero-rivals constructive witness in technical
details. A different earliest event retains its visible date entry. Winning-pattern
copy explicitly requires the stated positions in every race and Sprint until the
target. The every-challenger constant-gap hypothesis remains upfront. All
technical reasoning, proofs, rule links and publication identifiers are inside
one initially closed Calculation and source details disclosure at the modal bottom.
The page's separate single closed footer and four-stat rows are unchanged. No API,
transport, scoring or scenario calculation changes; already-secured/unavailable
states remain honest and no future result is required once security is proven.

Four fail-first observations: missing context trigger, redundant summary heading,
no closed modal footer, and absent shared compact cards. These represent three new
tests plus an amended existing heading assertion. Two-file17 tests then passed.
That initial tidy passed50 focused tests/six files. Follow-up same-event dedup,
both-kind each-session wording, header typography, and unproven-team density added
five tests; six assertion failure observations preceded fixes, including a second
padding assertion in the typography test. One initial typography test-path error
was corrected before capturing its real missing-family assertion failure; it is
not implementation red evidence. Final focused55 tests/six files, lint, production
build,49 constructor/30 flag checks and diff check passed. An intermediate build caught duplicate owned mobile
media aliases; rules were merged before the successful final gate. Existing Vite
large-chunk warnings remain. No full client/API suite was rerun for presentation.
Parent final desktop acceptance: unified right-below-Refresh action; title header
IBM Plex Sans18px matches the app Panel; inline Earliest badge removes the duplicate
US block; winning copy explicitly includes each race/Sprint. Constructor unproven
state is condensed with all three cards visible and the separate Mexico earliest
date retained. Ferrari/McLaren/Red Bull/unlisted evidence remains in collapsed
technical details, toggled with Enter. Parent reviewed Apex variables and removed
old action selectors; no further design changes requested.

Parent final QA complete: driver9th/5th and the additional unlisted condition remain
visible; same-event Earliest badge and390/374 card proof retained. Constructors show
the concise not-proven state/Mexico earliest date with full conditions in closed
notes. Historical2000 Michael unavailable is clean; Light/Dark passed. At390/320,
modal/page scrollWidth equals clientWidth (390/320 while body locked). Sticky header
stays at dialogY67.5 at lower cards. Tab reaches details, Enter opens, Escape closes,
trigger focus returns and body overflow restores to empty. Parent restored normal
2026DriversLatest/System/closed. New external proofs:
`site-wide/title-outlook-redesign-2026-10-13-{desktop,desktop-cards,page,mobile,constructors}.jpg`.
These are parent-owned sampled checks, not exhaustive visual/accessibility proof.
This documentation-only update did not rerun application tests.

Assignment paths (all client-only plus shared memory):

- `C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/client/src/pages/Standings.jsx`
- `C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/client/src/features/season/TitleScenariosDialog.jsx`
- `C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/client/src/design-system/standings-context.css`
- `C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/client/tests/title-scenarios.test.jsx`
- `C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/client/tests/standing-presentation.test.jsx`
- `C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/client/docs/STANDING-SCENARIOS.md`
- `C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/client/docs/STANDING-PRESENTATION.md`
- `C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/client/docs/CHECKPOINT.md`
- `C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/client/docs/UI-CONSISTENCY.md`
- `C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/memory.md`

## Initial scenario implementation and superseded presentation

One compact Title scenarios button opens four server-grounded blocks in the shared
native modal. No explanatory page expansion: the existing single closed bottom
disclosure, four-stat rows and short accessible Gap label are preserved. Binding
driver finish conditions are shown; automatically covered rivals are summarized,
and any unlisted-challenger bound remains explicit. Constructors use team points.
Already-secured titles show no further result obligations or future-clinch lists.

Standings-only transport whitelists publication/standing-owned scenarios and accepts
legacy omission/null. Real UTC-roundtrip dates must belong to the outlook year and
a later round; opportunity budgets are positive. A possible next clinch requires
an owned event, leader gain and remaining budget. No client title math or new queries.

ModalShell extracts the existing EventInsightDialog outer structure/lifecycle:
native focus containment, cancel/backdrop close, initial close focus and return
focus. Saved/restored body overflow locks the background. Only title scenarios add
a sticky close header; the event dialog layout stays unchanged. Shared dialog
width/height/scroll bounds and Apex tokens are reused; no assets/packages added.

The original sufficient target still does not resolve countback. Scenarios can prove
wins-only dominance; equal wins/later stages remain unresolved. Independent rival
upper bounds are not simultaneous results. Constant-gap wording explicitly assumes
at least today's gap over **every challenger**, whose identity can change. Historical
unsupported scenarios infer no outcome. [API semantics/paths](../../api/docs/STANDING-SCENARIOS.md).

## Verification

Three initial client tests failed before transport/dialog support; two follow-up
mobile tests failed before body lock/sticky header; the sixth test failed for invalid
dates. Legacy null was a separate failing assertion in the first test. Two final
tests failed for already-secured obligations and missing next-clinch evidence.
The all-challenger sentence separately failed within the existing dialog test.
Thus eight final new cases, with successive assertion failures not counted as new
tests. Final frozen-source run47 tests/six files, lint/build and49 constructor/30
country flag asset checks passed after the all-challenger wording correction.
Full client suite is not claimed. Existing Vite >500kB chunk warnings remain.

Parent independently sampled latest drivers Russell9th/Hamilton5th and390/374,
constructors next-not-proven, earliest664/616 and pattern707/654; R16 Singapore
Sprint chronology and historical2000 unavailable state. Desktop dialog640px;
390/320 page client/scroll376/306 and dialog shell361/291, no horizontal overflow.
Bottom block reachable. Sticky header remained at top67.5 while shellscroll463.6;
body overflow hidden restored to empty on close. Native Tab containment, Escape,
close and returned trigger focus passed, with Light/Dark samples. External proofs:
`site-wide/title-scenarios-2026-10-13-{desktop,mobile,constructors,page}.jpg`.
Parent restored normal2026DriversLatest/System/closed. Final wording/secured branches
have fixture proof; browser samples do not certify all possible states.

Cody did not operate the browser. No commits/pushes/deployment/imports/live writes.
Both repository diff checks and contract regeneration idempotence passed. Final
documentation-only annotations did not rerun application tests.
