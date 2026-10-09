# Home reference fidelity — 8 October 2026

Current local contract supersedes the earlier full-width-header Option3. The
authoritative image was inspected directly:
`C:/Users/garya/.codex/generated_images/01a0afde-8b0a-70c0-8004-86c356b9031d/exec-a5098da2-385e-49c6-8b07-615ff45850ac.png`.
It supplies presentation, not race facts. Earlier implementation/test evidence is
retained in [historical Option3](HOME-OPTION-THREE.md).

## Current architecture and deliberate differences

Latest approved lower-card amendment: [Home championship graphics](HOME-CHAMPIONSHIP-GRAPHICS.md)
adds shared driver/constructor points-gap charts using each round's standings leader.
The9 October amendment removes the race-contribution mosaic. Below900px,
cards now stack full width, superseding paired390 evidence below; desktop47:27:26,
shared identities, podium/history/countdown and pinned single links remain.

Latest narrow podium amendment replaces Home-only points captions with nationality
flags from matching publication-pinned driver profiles. The9 October sizing
amendment uses shared upcoming-race40×30 flags and balances the extra marker
height with Home-only token-derived smaller numerals. Unknowns remain explicit, generic
podiums/full results retain points. See [current source and verification contract](HOME-CHAMPIONSHIP-GRAPHICS.md).

### Current shared constructor sizing amendment — 8 October 2026

User-approved sizing only: Home podium teams and both championship panels now
share14px regular muted constructor text,20px desktop/16px mobile logos and the
existing8px gap. The shared compact variant uses the same sizing elsewhere;
explicit profile heading variants remain unchanged. Shared word-safe flex wrapping
allows an intact manufacturer name below the logo when a narrow slot cannot fit
both; no per-Home font reduction or gap override. See the token/verification
record in [UI consistency](UI-CONSISTENCY.md). Earlier measured12px text and
16px desktop/12px mobile logos below are historical, superseded sizing evidence;
this does not authorize a new layout, button or numeral treatment.
Parent final1440/390/320 Home sample confirms these sizes, no page overflow and
retained2–1–3 composition;320 Mercedes now occupies one19.6px line,61.39px wide.
Measured bounds/themes and external screenshot names are in UI consistency;
this is a narrow sample, not certification of all consumers or states.

### Current full-width standings actions — 8 October 2026

Both Home championships' View standings ActionLinks fill their available content
width at every breakpoint. One shared Home footer selector owns100% width/cap and
zero minimum width; the desktop auto-width override is removed. Labels, pinned
routes, other ActionLinks and identity/podium layout remain unchanged.

Parent browser gate:1440 widths275.6818/264.5170px exactly match their parents,
with zero left/right delta;390 widths133.48/133.49px and320 both238.7784px also
match parents, no page overflow. External screenshots:
`implementation-evidence/home-full-width-standings-links-{desktop,mobile390}.jpg`;
viewport reset. Three meaningful fail-first breakpoint contracts; first green
trial exposed only a zero-to-0px computed-style assertion, corrected without a
production change.93 focused tests/7files and lint passed; raw red/green/build
logs are external `execution-evidence/home-standings-fullwidth-*.txt`. These
cascade diagnostics do not substitute for the measured browser bounds above.
Final post-gate93/7 and lint passed; production build/keyed token generators and
49 constructor/30 flag asset guards passed. Existing large-chunk warning remains.
No full-suite/API rerun or new deployment verification.

### Current Home podium header action — 8 October 2026

Home's one Show full results/Show less Button now occupies the right side of
RACE RESULT, replacing the redundant Top three label. The below-podium button/
wrapper and obsolete spacing rule are removed. RacePodium accepts an optional
header action; other consumers retain their default Top three/Loading label.
Pinned lazy results, selection reset, keyboard focus and aria-expanded/controls
remain unchanged; championship links/identities/podium blocks are untouched.

Parent1440/390/320 verified exactly one header toggle, no Top three or lower
button,22 expanded rows and successful collapse. Mobile header fits one row,
no page overflow; tiny edge rounding is not overflow. External screenshots:
`implementation-evidence/home-podium-header-toggle-{desktop,mobile390,mobile320}.jpg`;
viewport reset. Fail-first one header-placement failure; generic-consumer test
passed before implementation.90 focused tests/7files, lint, formatting/diff checks
passed. Final build and keyed token generators passed, with49 constructor assets
and30 country flags validated; existing large-chunk warning remains. Results are
recorded in the external
`execution-evidence/home-podium-header-action-build.txt`; red/green logs share
that prefix. No full-suite/API rerun or new deployment verification.

### Current championship-control simplification — 8 October 2026

Championships are top-three previews only. Each panel has one full-width
`View standings` link to its dedicated drivers/constructors selection, preserving
season, round, publication snapshot and standing snapshot. Championship Show more/
Show less controls, expansion state/render branches, full-collection requests and
their unused CSS are removed, not hidden. Shared identities, separators, row spacing
and natural equal-card height remain unchanged. Only race results expand inline;
their lazy complete/pinned collection, keyboard toggle, selection reset and
loading/error/unavailable/publication guards remain. The collection endpoint now
supports results only; the shared paginator and its independent contracts remain.

Parent browser gate:1440/390 exactly two View standings links and no championship
expansion buttons; links selected2026 Round16 drivers (23 published entries) and
constructors correctly. Race expansion displayed22 classification rows and Show
less collapsed it.390/320 had no page overflow; shared logos/stacks stayed intact.
External screenshots: `implementation-evidence/home-two-standings-links-desktop.jpg`
and `home-two-standings-links-mobile390.jpg`; viewport reset and Home restored.

Fail-first: one regression failed for the two remaining championship buttons;
the race-only keyboard regression already passed before implementation. Final
focused88 tests/7files and lint passed; formatting/diff checked. Final client build
including keyed token generators and physical asset guards passed; existing
large-chunk warning remains. No full-suite/API rerun or new deployment verified.
Raw logs remain outside the repo in
`C:/Users/garya/OneDrive/Documents/ChatGPT/F1/audit-2026-10-08/execution-evidence/`:
`home-championship-controls-red.txt`, `home-championship-controls-final-green.txt`
and `home-championship-controls-build.txt`. No commits/pushes/live writes.

The dated amendment evidence below is retained history; championship expansion
claims in earlier records are superseded by this control simplification.

### Later user-approved podium identity amendment — 8 October 2026

This narrow amendment supersedes only the image's number/team placement: mobile
stacks the shared red-outlined number badge above the full-width, word-wrapped name, then
team; desktop places the badge before the name and team beneath the name. Both
Home podium and championship use the same20px-wide,10px-font badge, red outlined
border and unit line-height. Latest colour-only correction uses neutral
`--apex-color-text` numerals, matching podium positions; it supersedes prior red
numeral wording without changing typography, identity placement or outline.
Latest spacing amendment supersedes the shared identity subgrid/lift padding:
each podium column uses intrinsic identity/platform rows, a12px gap and common
bottom alignment. Natural winner platforms retain16px mobile/32px desktop lift.
The obsolete identity-lift alias is removed; identity internals are unchanged.
See [current spacing evidence](HOME-CHAMPIONSHIP-GRAPHICS.md).
Source facts,2–1–3 placement and the rest of Home remain unchanged.

Latest narrow row-divider amendment: one completed-Home leader-list adjacent-row
selector supplies tokenized top separators before every row after the first,
including the final entry, in both championship previews and expanded lists.
Legacy bottom borders are cleared to avoid doubles; the existing desktop first/header
line remains, while mobile retains no first/header line. Parent1440 measured all
three rows in both panels with0.909px solid rgb(51,61,71) top borders;390/320 first
row0, rows2/3 matching0.909px solid rgb(51,61,71), no overflow. Identity styles,
row spacing and podium rules remain unchanged. External proof:
`home-championship-dividers-desktop.jpg` and `home-championship-dividers-mobile390.jpg`
in the implementation-evidence directory below; viewport reset. Corrected fail-first
contract/cascade4 failures; latest92 focused/7files and lint passed. Cascade fixtures
cover3/5 rows for both kinds at320/390/1440; jsdom token resolution is a diagnostic,
not browser geometry proof. Raw logs remain external under
`execution-evidence/home-leader-list-*.txt`; initial superseded bottom-border/fixture
assertions are retained, not counted as production-defect proof.
Final client build/token generators/asset guards passed; existing large-chunk
warning remains. No full-suite/API rerun, commits, pushes, deployment or live writes.

Latest narrowly approved podium manufacturer amendment supersedes the earlier
logo-hidden rule: Home podium teams reuse the same compact ConstructorIdentity
championship variant as both championship panels. Logos16px desktop/12px mobile,
gap8px and text12px regular are shared; the obsolete hide selector is removed.
The shared specificity guard keeps inline-flex layout despite legacy podium span
rules; default identities elsewhere are unchanged. Parent1440/390/320 verified all
assets loaded, readable names/no overflow, shared sizing and each identity within
its parent (320 Mercedes72.61px within74.26px). Side badge tops315px agree, winner
299px remains raised and block bottoms agree. Final external proof:
`home-podium-shared-constructor-logos-desktop.jpg`,
`home-podium-shared-constructor-logos-mobile390.jpg`,
`home-podium-shared-constructor-logos-mobile320.jpg` in the implementation-evidence
directory below; viewport reset. Fail-first2 reuse/hide regressions plus1 cascade
regression; latest88 focused/6files and lint passed. Logs are external under
`execution-evidence/home-podium-constructor-*.txt`; earlier scoped checks remain
dated evidence, not a full-suite rerun.
Final client build/token generators/asset guards passed; existing large-chunk
warning remains. No API changes/tests, commits, pushes, deployment or live writes.

Latest compact manufacturer-logo amendment: the shared championship variant now
uses16px desktop logos (existing icon-small token), unchanged12px mobile logos and
an8px logo/name gap (existing spacing token). Text remains12px regular/16.8px;
desktop badge-column reservation, mobile driver stack and podium are unchanged.
Parent1440 measured all six logos15.9943px, exactly half the preceding31.9886px;
390 measured11.9886px, gap8px and unchanged12px text.390/320 labels remain readable
with no page overflow. External `home-compact-constructor-logos-desktop.jpg` and
`home-compact-constructor-logos-mobile390.jpg` in the implementation-evidence
directory below; viewport reset. Fail-first1 regression; latest86 focused/6files,
lint and formatting/diff checks passed. Logs are external under
`execution-evidence/home-championship-logo-size-gap-*.txt`. Earlier32px/gap4
manufacturer measurements below are historical and superseded, not current styling.
Final client build/token generators/asset guards passed; existing large-chunk
warning remains. No full-suite/API rerun, commits, pushes, deployment or live writes.

Latest desktop-only constructor alignment amendment: the constructor identity
line reserves the shared20px badge token plus4px gap, with CSS padding and no fake
badge. It applies at the existing Home desktop breakpoint only, matching the
inline driver identity; mobile stacks consume no horizontal badge column.
Parent1440 measured rank-right to constructor-logo-left27.9829435px, exactly equal
to rank-right to driver-name-left for all three rows.320/390 constructor rank-to-logo
gap remains3.9915px, no extra indent/overflow and labels readable. Rank/points,
manufacturer typography and podium remain unchanged. External proof:
`home-constructor-badge-column-alignment-desktop.jpg` in the implementation-evidence
directory below; viewport reset. Fail-first2 desktop-only regressions; latest86
focused/6files and lint passed. Logs are external under
`execution-evidence/home-constructor-desktop-reservation-*.txt`; earlier scoped
checks remain dated evidence, not a full-suite rerun.
Final client build/token generators/asset guards passed; existing large-chunk
warning remains. No API changes/tests, commits, pushes, deployment or live writes.

Latest narrowly approved manufacturer consistency amendment: both Home
championships use the same `ConstructorIdentity` championship presentation variant,
forwarded by `ConstructorIdentities` for driver affiliations. One shared class owns
IBM Plex Sans12px, regular400,16.8px line-height and4px gap, rather than inheriting
different `strong`/team styles. Logo sizing retains the existing responsive tokens:
parent1440 measured31.9886px square;320/390 measured11.9886px square. All manufacturer
labels are readable without overflow; driver stacks and podium remain unchanged.
Default constructor identities on other pages are unchanged. Final external proof:
`home-constructor-identity-consistency-desktop.jpg`,
`home-constructor-identity-consistency-mobile390.jpg`,
`home-constructor-identity-consistency-mobile320.jpg` in the implementation-evidence
directory below. Viewport reset. Fail-first2 regressions; latest84 focused/6files,
lint and formatting/diff checks passed. Logs are external under
`execution-evidence/home-championship-constructor-identity-*.txt`; earlier scoped
counts remain dated evidence, not a full-suite rerun.
Final client build/token generators/asset guards passed; existing large-chunk
warning remains. Build log: `home-championship-constructor-identity-build.txt` in
that external execution-evidence directory. No API/Git/deployment/live changes.

Latest mobile-only approval: Drivers Championship now uses the exact same
`stackOnMobile` variant as the podium, including its12px/16.8px names and4px gap.
Parent320/390 verified matching classes, badge-bottom to name-top3.9915px,
readable Mercedes and no page overflow. Desktop1440 remains inline16px with
first-baseline offset5.2841px; Constructors are unchanged. External screenshots:
`home-championship-mobile-stack390.jpg` and `home-championship-mobile-stack320.jpg`
in the implementation-evidence directory below. Viewport reset. Fail-first1
regression; latest46 focused/3files and lint passed. Logs are external under
`execution-evidence/home-championship-mobile-stack-*.txt`; no full-suite rerun.
Final client build/token generators/asset guards passed; existing large-chunk
warning remains. No API changes/tests, commits, pushes, deployment or live writes.

Latest narrow reuse correction: Home podium and Drivers Championship render the
same `DriverIdentity` component and `driver-identity-line` classes. One Apex-owned
stylesheet supplies the red-outlined, neutral-number badge, first-baseline alignment,4px badge/name and
name/team gap, and desktop16px/22.4px name typography. There are no separate Home
badge/name spacing overrides. Both mobile Home driver consumers use the stack modifier; mobile team
captions use their full slot width, avoiding the championship Mercedes regression.
Desktop teams retain the shared indent beneath names.

Parent final1440 measured all six identities: computed gap4px, horizontal gap3.9915px,
name16px/22.4px, first-baseline alignment and badge-top minus name-top5.2841px.
Side podium badges both y528.2244; winner32px higher; block bottoms differ by less
than0.00005px.320/390 remain readable without overflow; Mercedes fits the390
championship and podium names have no single-letter splits. Final external proof:
`home-shared-driver-identity-desktop.jpg`, `home-shared-driver-identity-mobile390.jpg`,
`home-shared-driver-identity-mobile320.jpg` in the implementation-evidence directory
below. Viewport reset. Earlier badge-alignment screenshots retain historical proof.
Fail-first logs: shared component/spacing2 failures, first-baseline2 failures and
mobile team-width1 failure. Latest46 focused tests/3files, lint and formatting/diff
checks passed; previous43 results below are superseded for this correction.
External logs are `execution-evidence/home-shared-driver-*.txt`.
Final shared-identity client build passed including token generators and asset
guards (`home-shared-driver-identity-final-build.txt`); existing large-chunk warning
remains. No full-suite/API rerun or Git/deployment/live operations.

Parent verified320/390: real names have no broken words or page overflow, block
bottoms agree within0.00002px and winner remains raised. Desktop1440 retains its
layout; badge height15.795px matches championship. External screenshots:
`C:/Users/garya/OneDrive/Documents/ChatGPT/F1/audit-2026-10-08/implementation-evidence/home-driver-number-stack-mobile390.jpg`
and `home-driver-number-stack-mobile320.jpg` in the same directory.
Final positioning proof: side badges share y362.3295 at390, y310.4545 at320 and
y520.213 at1440; block bottoms agree within0.00002px, no page overflow and desktop
badge/name align. Final screenshots in that same external directory:
`home-podium-badge-alignment-desktop.jpg`,
`home-podium-badge-alignment-mobile390.jpg`,
`home-podium-badge-alignment-mobile320.jpg`. Viewport was reset after verification.
Fail-first evidence: initial2 failures, typography1 failure, final vertical-contract1
failure, then shared-identity-track1 failure; latest focused43 tests/3files, lint
and formatting/diff checks passed. Logs are external under
`execution-evidence/home-podium-badge-*.txt` and `home-podium-identity-*.txt`.
Final client build passed including keyed token generators and physical asset
guards; existing large-chunk warning remains. Log:
`C:/Users/garya/OneDrive/Documents/ChatGPT/F1/audit-2026-10-08/execution-evidence/home-podium-identity-final-build.txt`.
No full-suite rerun, API changes/tests, commit, push, deployment or live writes.
The525-test full run and raster comparison below
predate this amendment and were not rerun/recreated for it.

- Desktop: combined race header/track/date/left route action/podium in the left
  card; simultaneous top-three Drivers and Constructors to its right. Content
  determines height; the common grid stretches the three cards without a fixed
  panel height or filler. Columns use 47:27:26 proportions and existing Apex gaps.
- Podium entries use independent intrinsic identity/block tracks, aligned at the
  common bottom with a12px gap. Each identity uses existing
  markup: mobile badge/name/team stack, desktop badge beside name/team beneath,
  directly above its own block.
  Published second/first/third appear
  left/centre/right; their blocks share one baseline, with a taller winner. Each
  driver, number, position and points retain their own published result parent.
  Current race winner Max/25 is distinct from championship leader Andrea/320.
- Desktop championship rows share explicitly scoped20px block padding and a
  keyed104px minimum-row token, not fixed height. Longer content can grow. Records
  no longer stretch to fill the card; actions follow the rows and spare space is
  below actions. Names use Apex body typography; championship logo tiles use16px desktop/12px mobile tokens.
- At390px, championships remain side by side with zero duplicate row inline
  padding,20px number badges,12px inline logo/team captions and full wrapped names.
  At narrower widths they stack. No supplied family-name field exists in the
  observed entities: no handwritten surname aliases or invented metadata.
- Home podium displays the shared compact manufacturer logo/name variant.
  Shared20px badges use existing Apex tokens at all widths. Team metadata remains
  12px and wraps normally, never nowrap bleeds.
- Championships have only pinned View standings links, full-width on their own
  line; top-three previews do not request full collections. Race Show full results/
  Show less sits in the podium header, retaining touch targets and complete/pinned
  data-ownership guards.
- Home-only Historical layout / Verified layout captions retain full applicability
  in the native Layout source disclosure. Other CircuitSilhouette consumers keep
  their existing full caption. Country flags use actual matching circuit records,
  inline with round metadata; no dedicated extra flag row or race-name inference.
- Countdown/history/navigation are prior approvals, not recreated from this
  image. Race inline expansion is an authorized addition to the mockup; source
  text, missing data and full names may change content height. No sponsors/fake facts.
- Desktop header typography uses existing18px circuit,14px round/date and46px
  title roles. Circuit line height25.2px uses the existing control-line role.
  Mobile metadata rules stay compact; championship headings stay12px to avoid a
  one-sided wrap. The subtle Home-only gradient uses canvas/surface tokens, not
  new hexadecimal colors or a global palette change.

Home presentation has one owner, Apex home-fidelity.css; overview-focus.css keeps
only the earlier countdown compaction. The new keyed generator owns its two named
media aliases (380/900) and the104px preview minimum; it validates positive safe
integers and breakpoint ordering before writing, and is byte-idempotent. Existing
type/color/spacing/size roles are otherwise reused. Invalid values cannot partially
rewrite its owned output; fixtures cover nonfinite/unsafe/fractional/string values.

## Pre-amendment reference measurements and limitations

Reference crop: x39..1149,y215..806 (1110×591). Actual final widths are
524.773/301.477/290.313 CSSpx. Parent final1440 viewport outer rectangle is
x238.906,y113.295,width1148.551,height672.727 at scrollY361.818; the three inner
cards share656.733px height. No fixed panel height is used.

| Section                          | Reference estimate                          | Final observed                                                 | Width-normalized observation           |
| -------------------------------- | ------------------------------------------- | -------------------------------------------------------------- | -------------------------------------- |
| Left/Drivers/Constructors widths | 514/297/282px                               | 524.773/301.477/290.313 CSSpx                                  | 514.324/295.474/284.532px              |
| Preview rows                     | approximately100px                          | all six103.991px; padding20px0                                 | 101.920px                              |
| Podium winner/side blocks        | approximately146/114px                      | 145.753/113.736px                                              | 142.851/111.471px                      |
| Podium side names/blocks         | matching side baselines/common block bottom | same side-name baselines; all bottoms equal; winner32px raised | no independent transforms              |
| Header hierarchy                 | title44–46/circuit~18/date-round~14px       | 46/18/14px, existing Apex fonts                                | raster fonts are not identical         |
| Card height                      | 591px                                       | 656.733 CSSpx                                                  | CSS643.656px; integer raster crop644px |

All six preview row/action positions align. The earlier driver20px versus
constructor32px padding difference was a styling defect, not natural content; the
shared minimum/padding fixes it. Names/points retain their actual source context.
The earlier second-block bottom difference23.11px and winner-shorter regression
were corrected. Earlier640.355px geometry before the final desktop type change,
and earlier684.119px stretched-card geometry, are superseded by the final values.

Parent final390 race card575.085px, both previews434.702px and all six rows78.935px
remain readable. Final320
badge15.994px and metadata54.276px keep Mercedes/Red Bull/Ferrari single-line at
20.44px height;390 metadata is also single-line. No overflow306/306 at320 or
376/376 at390; cards stack at320. The earlier5.11px-wide single-letter column and
1699px panels are rejected intermediate states, not accepted visual evidence.
At1024, page/client1010/1010, title wraps to three lines, podium teams remain
single-line and two-line championship headings are readable.

Parent native expansion verifies22 race rows, exclusive results→drivers→constructors,
Max1/25 and Andrea2/18. Season2000 mobile/history/published identity remains owned
by its record; no all-season claim. No arbitrary race-winner replacement occurred.
The parent withdrew a suspected result/name mismatch after checking the same
column/parent: no source winner was changed. Its speculative CSS red log is not
defect/TDD evidence; the retained DOM grouping check verifies real associations.

Parent shared-route samples: Calendar/Standings/Explore/Ask/Analytics/Sources
desktop1280 are contained1265/1265; Race detail is contained at desktop1440.
Earlier Evidence source/event guards retain their documented senior-review proof.
No Home-image fidelity claim applies to other
routes, no exhaustive browser/WCAG/all-season guarantee. Home-specific selectors
and the opt-in layout caption avoid global redesign.

## Execution and external evidence

Final post-type `npm run check` passed lint,525 tests/48 files,token generators,
49 constructor/30 flag guards and the5,271-module build. Focused127 tests/6 files,
lint,diff and generator byte-idempotence passed. Intermediate full510/48 and524/48 logs are
retained, not final certification after the type refinement. No API code/test run, commit/push/deploy/import/live write
or environment/model change. Configured Cody gpt-6.1-sol/medium is not runtime or
billing verification. Existing5173/3001 are preserved; QA5175 remains stopped.
Existing jsdom scrollTo and >500kB chunk warnings remain unsuppressed. Final
checks passed:80 asset/license copies SHA-256 match dist (1,378,083 bytes),
production QA harness markers absent, generator byte-idempotence,formatting,
both repository diff checks,124 current local/relative links across11 records and
26 scoped absolute paths. No raw docs .txt logs. These checks are separate from
test counts. No new application tests are run solely for prose.

External root:
`C:/Users/garya/OneDrive/Documents/ChatGPT/F1/audit-2026-10-08/`.
Meaningful captured reds under execution-evidence: home-fidelity-structure-red.txt
(2 failures/15 skipped), track-label-red (1/6), mobile-actions-red (1/17),
mobile-density-red (1/18), generator-build-red (1/66) and keyed-generator-red
(valid writer case fails; missing-writer invalid cases are not validation proof).
Cycle2 recorded108 passed/1 failed from source-disclosure test isolation; cleanup
fixed that, and cycle3-focused-green records111/6. The first mobile action run's
24/1 was a stale Show less accessible-name expectation, updated to its new
contextual label without weakening keyboard/focus/selection tests. Later real
reds: podium-height1/20 skipped; natural-records1/21; palette1/22; name-rows1/23;
preview-row-min9/28; metadata1/25; narrow-badge1/26; desktop-type1/27. The latest
focused log is home-fidelity-final-type-focused-green.txt (127/6). Logs are not
reconstructed or stored in either repository.

[Fresh final full pipeline](C:/Users/garya/OneDrive/Documents/ChatGPT/F1/audit-2026-10-08/execution-evidence/home-fidelity-final-type-client-check.txt)
ran after the final type source/test edits (start16:39BST), unlike the earlier
home-fidelity-client-final-check.txt run at16:33BST. No failed/pending intermediate
run is relabelled final.

External comparison script implementation-evidence/compare-home-reference.py
rejects cropped/out-of-bounds rectangles, normalizes width only, and emits labelled
side-by-side,50% overlay,absolute difference and JSON raster statistics. These are
raw image differences, not a fidelity percentage: fonts/data/logos/antialiasing,
JPEG compression and authorized extra controls differ. Initial/full-page1296px
captures clip the right card and were rejected for whole-section comparison. The
final neutral viewport is JPEG1426×891 despite its .png extension; Pillow detects
the actual format and exports a genuine PNG without overwriting the source.
Final image crop x222..1242,y109..701 is1020×592; all cards are visible, no focus
ring. It is calibrated from visible card borders, approximately0.90 image pixels
per CSSpx, not inferred by multiplying devicePixelRatio1.1 or PNG filename/width.
Integer crops introduce about1–2px boundary uncertainty.

Final artifacts:
[side-by-side](C:/Users/garya/OneDrive/Documents/ChatGPT/F1/audit-2026-10-08/implementation-evidence/home-fidelity-final-type-comparison/home-main-side-by-side.png),
[50% overlay](C:/Users/garya/OneDrive/Documents/ChatGPT/F1/audit-2026-10-08/implementation-evidence/home-fidelity-final-type-comparison/home-main-overlay-50.png),
[absolute difference](C:/Users/garya/OneDrive/Documents/ChatGPT/F1/audit-2026-10-08/implementation-evidence/home-fidelity-final-type-comparison/home-main-absolute-difference.png),
[actual crop](C:/Users/garya/OneDrive/Documents/ChatGPT/F1/audit-2026-10-08/implementation-evidence/home-fidelity-final-type-comparison/actual-main-crop.png),
[metadata/statistics](C:/Users/garya/OneDrive/Documents/ChatGPT/F1/audit-2026-10-08/implementation-evidence/home-fidelity-final-type-comparison/home-main-comparison.json).
[Final mobile capture](C:/Users/garya/OneDrive/Documents/ChatGPT/F1/audit-2026-10-08/implementation-evidence/home-fidelity-final-mobile-page.png)
records the approved390 presentation; normal Home2026/no expansion/System/viewer-local
was restored by the parent after its final checks.
Width-only normalization yields1110×644 versus1110×591:53px extra remains,
including the authorized full-results control and actual flags/type/source text.
Mean absolute RGB differences are23.99/21.17/20.36 out of255;21.20% of raster pixels
exceed15 in any channel.99.99% are not byte-identical. None is a fidelity percentage
or claim that remaining presentation differences are zero. Final side-by-side and
overlay were inspected; geometry/readability gates passed independently in browser.

Scoped file inventory:
[24 client plus2 root paths](C:/Users/garya/OneDrive/Documents/ChatGPT/F1/audit-2026-10-08/execution-evidence/home-fidelity-changed-paths.json).
Raw logs, comparison script and images remain outside both repositories. Existing
dirty docs and historical mockups are retained; root guidance/memory need separate
preservation. Local verification does not verify a new deployment or provider import.
