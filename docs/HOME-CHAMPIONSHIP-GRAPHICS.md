# Home championship graphics — 9 October 2026

Latest cross-repository [senior review](SENIOR-REVIEW-2026-10-09.md) owns the current
verification checkpoint and publication/coverage/malformed-data follow-up. Earlier
execution counts below are dated; approved geometry and source examples remain.

## Current Home podium flag sizing — 9 October

Home nationality flags now reuse CountryFlag's default upcoming-race size:
`--apex-size-icon-frame`,40×30px at desktop/mobile. Only the nationality podium
variant reduces its numeral by the added marker height:
`numeral token + caption-size×body-line − icon-frame×3/4`.
The4:3 ratio is shared flag geometry; no measured platform pixels are hardcoded.
Other RacePodium consumers retain their points and numeral sizing.12px identity
gap, padding/lift/layout are unchanged.

Six initial regression failures preceded implementation. Parent1368 verified
40×30 flags and62.3136px numerals (previous72.5136); overall podium200.3125px and
platforms141.946014/109.928970px differ from baseline by only0.0142px rounding.
At390 flags40×30, numerals23.8px (previous34), podium169.602264px/platforms
95.426132/79.431816px likewise differ by0.0142px.320 client/scroll306 fits.
Screenshots: external `site-wide/podium-event-size-flags-desktop.jpg` and
`podium-event-size-flags-mobile.jpg`; parent restored normal viewport.
These are narrow browser samples; the compact-flag proof below is historical.
Final86 focused tests/5files, lint/build and49constructor/30flag asset guards passed;
all30 flag SVGs are included in dist. Home generator is byte-idempotent; format/diff
checks passed. Initial jsdom calc-serialization and formatted-selector test trials
were corrected without visual changes. Existing Vite large-chunk warning remains.
No full/API suite rerun, commit/push/deploy/import/live write. Raw executions are
external under `execution-evidence/podium-event-size-flags-2026-10-09-*`.

## Current constructor points-gap amendment — 9 October

The user approved replacing only Home Constructors' Round contributions mosaic
with **Points gap to the leader**, using the same Chase/CompactSeriesPlot as Drivers.
The selected constructor IDs/order still come from the current pinned top three.
Every completed round uses its own unique rank-one leader across ALL constructor
standing rows, including a leader outside the displayed top three. Exact gap is
published leader points minus published team points using decimal arithmetic;
race points are never accumulated as a substitute for championship standings.
Phase two of the existing three-stage bounded API read now includes constructor
history. Constructor cells expose points/gap/rank/leader identity/leader points/
coverage; the unused Home-only contribution payload, matrix component, styles,
152px geometry and ink-blend tokens are removed. Other result/analytics consumers
and supplementary driver race classification figures remain supported.

Both charts retain the keyed 280×84 viewBox and 12px plot padding. Null gaps break
lines; latest gaps never borrow older observations. Partial zero remains partial:
hollow dots and legend asterisks disclose partial standings. Solid/dashed/dotted
lines match named legend keys, supplementing three Apex colours. Visible copy is
compact: “0 = leader · points behind” and “Latest R… gaps · * partial standings”.
The native Exact round figures disclosure explains hollow dots/missing data and
offers keyboard/touch round selection with exact source values and leader context.
Both cards retain the20px divider inset and existing layouts/pinned links;12px
podium gap, natural platforms and nationality flags retain their accepted baseline.

Fail-first evidence: initial11 API failures exposed absent constructor gaps; a
separate null-row case failed with500 before its guard. Two client rendering cases
failed before replacing the mosaic; six malformed/context guards already passed.
The later non-colour-pattern regression failed before matching path/key styles.
Review also exposed two ambiguous rank-one cases (driver/constructor, second leader
missing points); both failed before removing the score filter from leader selection.
Final9 October verification:104 client tests/10files and client lint/build passed;
49 constructor assets/30 country flags validated and80 public asset-directory files
were present in production output. API focused40 cases passed; final `npm run check`
passed203 tests, lint/format, OpenAPI structure/checksum and Newman117 requests/
197 assertions with zero failures. The intermediate197-test run predates the last
ambiguity regression/fix. Design-system and API contract regeneration each changed
zero hashes; diff and scoped formatting checks passed. Existing Vite large-chunk
warning remains. The full client suite was not rerun. Documentation updates after
the final gates did not trigger another application test run. Raw current executions
and fail-first excerpts are external under `execution-evidence/constructor-gap-2026-10-09-*`.

Parent independently read publication `6d626406-a9da-40af-a0ca-4027f7c12e1e`:
2026R1 Mercedes43/Ferrari27/McLaren10 gives0/16/33 (all11 rows, no more pages,
partial). R16 scores556/405/316 give0/151/240. Parent verified both rounds using
the rendered exact inspector; Cody's direct local API GET independently returned
those gaps and partial coverage. Cody's later direct2000 GET confirmed17 rounds and
2000R17 Ferrari170/McLaren162/Williams36 gives
0/8/134, partial; parent verified17 rounds in mobile Light rendering.

Parent final1368 CSS viewport/client1355: all three cards661.903381px, matching
the661.903px pre-change baseline; both chart insets20px and podium gaps12px,
natural winner/side platforms141.932/109.915px. Final390 after dash styles:
client/scroll376, latest0*/151*/240*, paths none /8px4px /4px4px match legend keys.
Earlier390 Light sample chart width300.77px;320 client/scroll306 and chart238.78px
fit. Historical/mobile Light samples preceded only final dash styling. Parent
restored2026/System/normal viewport and closed disclosures. External screenshots
under `audit-2026-10-08/implementation-evidence/site-wide/`:
`constructor-gap-desktop-final.jpg`, `constructor-gap-mobile-final.jpg`, and
`constructor-gap-2000-mobile-light.jpg`. These are measured narrow samples, not
whole-site visual, accessibility or sporting-source certification.

Current authorized amendment applies only below Home's published top-three rows.
Desktop retains47:27:26 equal-height cards, identities/dividers and one pinned View
standings link each. Below900px, championship cards stack at full available width;
this supersedes the earlier paired390 treatment because charts need readable room.
Podium/results expansion, history, countdown and constructor14px/20–16px/8px
identity sizing remain unchanged.

## Prior compact Home podium nationality amendment — 8 October

Home replaces only the points captions beneath position numerals with driver
nationality flags. Other RacePodium consumers retain points, and full race results
still expose source points. Existing CountryFlag now offers a shared `size="compact"`
variant using `--apex-size-icon` (20px/15px-high4:3 SVG), leaving default flags
unchanged; there is no Home-only flag-size override or position-number reduction.
The marker reserves the former caption line using existing caption/body-line
tokens and the same space3 top margin.12px identity gap,20px championship inset,
natural platforms/common bottom/winner lift remain unchanged.

Each distinct source entry driver uses the existing RTK profile query with the
displayed publication pin. `currentData`, matching profile ID/publication and
usable coverage are required; only supplied nationality maps to a bundled flag.
No birthplace/team country/name inference. Missing pin skips requests; missing,
foreign/unavailable nationality or unsupported artwork shows a dash with accessible
context. Loading is explicitly labelled. Duplicate IDs inside a shared entry are
collapsed, distinct shared-car drivers retained and RTK cache deduplicates the
same driver across results/rerenders. No backend or asset changes.

Eight meaningful fail-first nationality cases plus one shared compact-variant
failure; frozen87 tests/6files passed, including real mocked-transport pinning/
deduplication and unchanged other-consumer points. Parent1368/390 flags NL/IT/GB
load at20px; natural platforms141.932/109.915desktop and95.412/79.418mobile differ
from prior measurements by only about0.014px rounding.12px gap preserved, no
overflow.320 loaded flags20px, positions34px unchanged, client/scroll306.
These are narrow current-podium samples, not historical coverage certification;
parent confirmed compact classes and zero podium-points nodes, saved
`implementation-evidence/site-wide/home-podium-nationality-flags-final.jpg` and
restored normal viewport. Lint/build passed;49 constructor assets/30 flags
validated. Generator reruns changed zero design-system hashes; formatting/diff
checks passed. Existing Vite large-chunk warning remains. No full-suite/API rerun.
Raw logs external `execution-evidence/home-podium-nationality-*`; the initial
combined run caught the subsequently added compact-variant regression (86pass/
1fail), superseded by the frozen87-pass run, not reported as a product failure.

## Prior podium gap-only amendment

User-approved gap increases8px to `--apex-space-5` (12px) only. Natural platform
heights, winner lift/common baseline, desktop bottom anchoring and20px championship
divider inset remain unchanged. Eight responsive collapsed/expanded gap cases
failed before implementation; final58 tests/3files plus12 generator tests/1file
and lint passed. Home generator byte-idempotence and format/diff checks passed. Parent1368/390
measured all gaps11.989px, unchanged desktop141.946/109.929px and mobile95.426/
79.432px platform heights, no overflow. External
`implementation-evidence/site-wide/home-podium-gap-12px-final.jpg`; viewport reset.
Raw logs external `execution-evidence/home-podium-gap12-*`. No flags, points or
number sizing changes, API mutations or full-suite rerun.

## Earlier narrow spacing amendment —8px gap superseded above

Podium columns now use independent intrinsic identity/platform tracks, aligned to
the common bottom, with `--apex-space-4` (8px) between team and platform. Artificial
side/winner identity lift padding and its unused alias are removed. Platform
padding still supplies the original32px desktop/16px mobile winner lift; identity
typography, internal spacing and natural platform sizing are unchanged. This
supersedes the earlier shared identity-track alignment, not source placement.

Both graphics start `--apex-space-7` (20px) after the final divider, superseding
the12px desktop graphic start below. Rows remain80px minimum/12px desktop padding.
Parent's before sample measured16.82–16.92px of visible whitespace above the
closing line versus11.99px below;20px is the approved existing-token approximation.
Before podium team-to-block gaps were32.02–54.40px. No card/platform growth, chart/data,
button or identity changes. Initial browser check confirmed all gaps7.997px,
natural141.946/109.929px platforms and20px graphic start, but exposed50.82px
blank below. Desktop-only column flex on the card/result section now anchors
the intrinsic podium group via `margin-top:auto`; the result header stays at its
edge. The podium/platforms do not grow or stretch, and mobile remains natural.
Parent final1368: all team-to-platform gaps8px, natural winner141.946px/sides
109.929px unchanged, bottom inset12.898px, common baseline663.352px; both chart
margins20px, client/scroll1355.390: all gaps7.997px, natural winner95.426px/sides
79.432px, both chart margins20px, client/scroll376. External proof:
`implementation-evidence/site-wide/home-podium-divider-spacing-final.jpg`.
These are narrow parent samples, not whole-site/all-state certification.
Two collapsed/expanded desktop anchor assertions failed before this follow-up.
Meaningful measured-contract red run:10 failures,
48 passes/58; final58 tests/3files and lint passed. Formatting/diff checks passed.
No full-suite/API/build rerun for these narrow spacing rules. Raw logs external
`execution-evidence/home-two-spacing-*`.

## Prior compact natural-density amendment

The user rejected stretched podium platforms. Desktop preview rows now use the
keyed `--apex-size-home-championship-preview-row-min` (80px minimum), natural
auto tracks and `--apex-space-5` (12px) vertical padding. The same12px inset
starts the graphic after the closing divider. Long content can grow; no fixed
row height or clipping. Desktop race/result flex-growth and platform-stretch
rules are removed. Intrinsic podium sizes, shared bottom and32px/16px winner
lift remain; charts/data/identities and mobile natural sizing are unchanged.

Parent's narrow final samples:1368 card670.355px (rejected733.878px), winner/
side platforms141.946/109.929px, bottom inset12.8977px; both lists' rows80px,
padding12px.1440 card674.162px, inset12.8977px, client/scroll1426.390 retains
95.426/79.432px platforms,16px lift, inset12.8977px and client/scroll376.
External `implementation-evidence/site-wide/home-championship-compact-natural-final.jpg`;
normal viewport/System restored. These are sampled checks, not all-state proof.

Five meaningful fail-first assertions exposed the rejected growth/minimum/
spacing contract; a separate natural-row regression failed before replacing
equal fractional tracks. Final87 focused tests/5files passed. A trial regex
mistook `min-block-size` for fixed size and was corrected without weakening the
minimum-versus-fixed-height guard. Lint/build and49 constructor/30 flag asset
checks passed; generator reruns changed zero design-system hashes, and formatting/
diff checks passed. Existing Vite large-chunk warning remains. Raw logs are external
under `execution-evidence/home-compact-natural-*`. No full-suite/API rerun or
Git/deployment/data change; earlier full gates below remain historical.

## Historical rejected race-card fill proposal — superseded

Prior race-card fill amendment: desktop Home race/result sections used
column flex; the podium's shared platform grid track absorbs spare height.
The result header/divider stays at its existing edge, with no `margin-top:auto`
gap replacing the blank below. Side platforms retain the existing winner-lift
inset and common bottom. No fixed card/platform height, chart/data change or new
token; mobile keeps intrinsic platforms and natural spacing. Full results remain
a separate full-width sibling grid row.
Parent's normal1368 desktop sample: gap below podium76.42→12.8977px, card height
733.8778px unchanged; all block bottoms698.963px, winner205.4688px/side173.4801px
(31.99px lift), header-to-podium gap11.99px. Expanded/collapsed results retained
baseline/no overflow (client/scroll1355). Mobile390 remains natural95.426px winner/
79.432px sides (16px lift), gap12.8977px, client/scroll376. External site-wide/
home-podium-fill-final.jpg; parent restored normal viewport/System/closed results.
Two meaningful desktop collapsed/expanded failures preceded implementation;
74 focused tests/4files passed after. Initial fixture stylesheet cleanup and a
zero-versus-0px assertion trial remain archived, not claimed as product defects.
Lint/format/diff checks passed. Logs external with home-race-podium-platform-fill
prefix. No full/API rerun or Git/deployment/data changes for this narrow amendment.

## Earlier divider amendment — desktop spacing superseded above

Both Home graphic-preview lists close at the
final-row boundary with the existing `--apex-shape-border`/`--apex-color-line`.
One Home-records-only selector retains other lists' no-trailing-border behaviour.
Row padding is unchanged; the following Home graphic start margin uses
`--apex-space-7` (20px), matching desktop row inset. Its bottom margin remains8px.
Three meaningful divider failures and three start-spacing failures preceded the
changes; final66 focused tests/4files passed. The intermediate desktop fixture
lacked the production summary-grid wrapper and was corrected without weakening
its20px assertion. Parent's narrow desktop check confirmed both closing borders
0.909px solid rgb(51,61,71), row padding20px0 and graphic margin-top20px; line widths
and spacing match. External site-wide/home-championship-divider-final.jpg retained;
normal viewport/System unchanged. This is not an all-device visual claim. Raw red/green/lint
logs are external with `home-graphic-final-divider` and
`home-graphic-divider-spacing` prefixes. Prior full627/60/API180 gates below predate
this CSS-only amendment; no full/API rerun, data/Git/deployment change.

## Data and exact math

One deduplicated RTK Query cache key serves both panels through
`GET /api/v1/seasons/{year}/championship-graphics?standingSnapshotId=standing:{year}:{round}&snapshotId={publication}`.
The read-only server derives top-three IDs from those exact driver/constructor
standing sets. The client rejects foreign publication, year, round, standing
snapshot, entity order and malformed shapes rather than blending cached results.
No arbitrary client entity IDs, provider fetches or migrations are used.

- Chase (both kinds): each round's uniquely published rank-one leader **across all standings of that kind**
  minus each displayed entity's published championship points. Sprint points may
  be included in championship totals; historical leader changes are retained.
  Exact decimal arithmetic preserves negative source points and fractional gaps.
  Null gaps break lines; latest gaps are visible in the legend, not backfilled.
- Constructor history is published standings, not race-only classification,
  standings deltas or accumulated race scores. Supplementary driver race figures
  continue to use race-only entries and their own coverage.
- Partial numeric zero stays partial; absent values are null, not invented zero.
  Unknown points and ambiguous leaders are unavailable. Duplicate entities/foreign
  snapshots/malformed standings cannot establish a gap. Supplementary driver race
  figures retain session/result/entry ownership guards. A partial
  calendar keeps aggregate coverage partial even when available cells are complete.

The projection reads at most64 completed rounds at/before the displayed round in
one season, through three publication-pinned `getMany` phases. Production's existing
repository batches these reads; it is not a per-round HTTP waterfall. Complete
stored dataset arrays are read directly, so no client pagination/window truncates
standings. Scheduled/future events and sprint result keys are not requested.
Missing historical standings remain coverage-limited.

## Presentation and accessibility

Shared lightweight SVG primitives use keyed `chart.homeMiniPlot`:280px viewBox
width,84px chase height,12px inset. All completed rounds are visible; three series
follow the standings above. Exact native disclosures offer
round selectors and full descriptions for keyboard/touch use; hover titles are
supplementary. Both View standings links align at card bottoms.

Existing Apex series colours and line/key patterns distinguish the named series.
Caption/exact figures use normal text/muted on
canvas/surface, with dark/light contrast tests>=4.5. Existing focus colours meet
the tested3:1 surface contrast. These tests do not certify every rendered chart,
gradient or the whole site's WCAG compliance. Missing/partial values, series patterns
and exact descriptions do not depend on colour alone. Partial observations have
hollow markers and explicit coverage in the exact inspector.

## Historical browser evidence (parent) — 8 October

- 390: chart width301px, page client/scroll376;320:239px chart, client/scroll306.
  Light matrix visible with12px muted labels. The320/Light sample predates only the
  final matrix-height amendment.
- 2026 R1 chase: Antonelli7/Russell0/Hamilton13 gaps; independently read standings
  leader25 and points18/25/12. R16 race contributions Mercedes18/Ferrari27/McLaren10
  checked against the full22-entry classification, `hasMore:false`, partial coverage
  at publication `6d626406-a9da-40af-a0ca-4027f7c12e1e`.
- 2000:17 completed rounds/51 cells, Schumacher/Hakkinen/Coulthard latest gaps0/19/35,
  correct historical labels, no320 page overflow. This sample predates only matrix
  height, not the data projection or historical context checks.
- Final1440: chase82.70px high/matrix143.59px high, cards727.6989px unchanged by the
  taller matrix, both links bottom747.3295; client/scroll1426. Final390 matrix
  width300.77px/height163.27px, client/scroll376. Parent restored Home2026/System,
  normal viewport and closed details.

Proof is external under
`C:/Users/garya/OneDrive/Documents/ChatGPT/F1/audit-2026-10-08/implementation-evidence/site-wide/home-championship-graphics-{desktop,mobile}-final.jpg`.
These are narrow samples, not full historical/source accuracy or application visual
certification. Cards still exceed the original no-chart composition; the desktop
fit is measured, not claimed pixel-identical to a generated reference.

## Historical execution evidence — 8 October

Raw logs are external in the audit's `execution-evidence` directory, prefix
`home-championship-graphics-`. Meaningful initial API red9/client red8 preceded
implementation. API review red8/15 covered race-only/index/duplicates; final review
red2/17 covered false zero and calendar coverage, then17 passed. Client malformed
response review red4/13, compact layout/control red8/18, fit red2/22 and corrected
matrix-height red1/17 preceded their fixes. A separate matrix test-edit trial is
retained but is not claimed as a production defect. Latest compact focused97/7
and final matrix/palette focused38/4 passed. Final API `npm run check` passed180
tests, lint/format, OpenAPI checksum and Newman117 requests/197 assertions.
Final client pipeline (`npm run lint`, `npm test -- --maxWorkers=2`, `npm run build`)
passed627 tests/60files, lint/tokens/build and49 constructor/30 flag asset checks.
The default-parallel frozen run had626 passes/one5-second Ask fixture timeout;
the unchanged isolated Ask file passed8/8 and the full two-worker run passed.
Contention is a plausible explanation, not a diagnosed product fix. No timeout or
assertion was weakened and no Ask code changed. Final logs:
`home-championship-graphics-client-final-bounded-check.txt`,
`home-championship-graphics-api-frozen-check.txt`,
`home-championship-graphics-ask-isolated-check.txt`. Earlier refinement/full failures
remain archived, not frozen success claims. Generators are byte-idempotent;
format/diff/current-document links pass, no sampled QA markers in production JS.
Existing jsdom scrollTo/Vite large-chunk warnings remain. No commit/push/deploy/
source import/live mutation; no new deployment verification.
