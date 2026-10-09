# Site-wide Apex consistency

## Binding presentation contract

Home's latest scoped [championship graphics amendment](HOME-CHAMPIONSHIP-GRAPHICS.md)
uses shared Apex chart primitives and full-width stacked cards below900px.
Earlier paired390 Home measurements are historical, not the current chart layout.

Preserve the approved [Home contract](HOME-REFERENCE-FIDELITY.md), URLs, source/
publication ownership, real record values and accessible interaction states.
This is consistency implementation, not a new visual design or new asset system.

- Driver identity uses `DriverIdentity`: shared number/name baseline and spacing;
  a badge only for a supplied number. Home's mobile stack remains approved.
  Record/table and headline contexts use semantic typography variants, not copied
  markup or identical page layouts. Names and teams remain readable.
  All small DriverNumber numerals use `--apex-color-text`, matching podium position
  numerals, not muted or accent text. Existing red identity outlines remain
  `--apex-color-accent-border`; no size/spacing/layout change is authorized.
- Constructor record/team identity uses `ConstructorIdentity`: compact20px desktop/
  16px mobile logos,8px gap,14px regular muted team text; profile headlines may use an
  explicit semantic heading variant. No inherited strong typography or logo-size
  overrides for the same context. Dated assets use each record's season, never
  the browsing URL's season. Undated records retain the manifest's explicit
  identity default without making a dated-period claim; see
  [constructor provenance](CONSTRUCTOR-LOGOS.md).
- Use shared Button/ActionLink, Panel/PageHeading and padded PanelBody. Comparable
  navigation actions sit on their own left-aligned next line; toolbars, tabs,
  pagination and the approved Home race-header action retain their semantic roles.
- Apex owns presentation. Reuse named type/space/size/color/border/layer tokens.
  Breakpoint aliases derive from keyed JSON; generators validate finite safe values
  before writing and are idempotent. Structural zero/100%/grid ratios are not
  decorative magic sizes. Remove only confirmed-unused overrides.
- Lists have consistent between-row separators, no accidental last-row removal
  or double borders. Tables keep semantic headers, deliberate contained scrolling
  and visible keyboard focus. Controls reflow within available width at narrow and
  enlarged text; page overflow alone is not proof against clipping.

## Complete route/component inventory

Latest narrow sizing amendment (8 October): compact/championship variants share
`--apex-type-body-size` (14px), `--apex-size-icon` (20px desktop) and
`--apex-size-icon-small` (16px mobile). Gap remains `--apex-space-4` (8px), weight
`--apex-type-body-weight` (400), line `--apex-type-control-line` (1.4), colour
`--apex-color-muted`. Explicit heading variants are unchanged. Shared identity CSS
owns both responsive sizes; the competing Home logo-size override is removed.
This supersedes earlier 12px text/16–12px logo evidence, not the approved layouts.
Four resolved-style sizing tests failed before; two additional wrapping tests
failed on nowrap after parent found Mercedes splitting in a320 podium slot.
Compact variants now reflow logo/name with word-safe text: intact names can move
below the logo; unusually long single words may break only when wider than the
whole available slot. Gap stays8px. Final112 tests/8files passed, including
heading/cascade/asset/fallback/record-season/generator guards. Raw logs are external under
`execution-evidence/constructor-identity-size-amendment-*.txt`. No new layout
choice or API change is implied.
Parent's final Home sample:1440 client/scroll1426, nine identities14px regular/
20px logos/8px gap; Light uses the same sizes and muted rgb(88,99,107).390
client/scroll376 and320 client/scroll306 resolve14px/16px/8px. At320 Mercedes
remains one19.6px line,61.39px wide; shared wrapping permits the logo above it.
Approved2–1–3 podium composition remains. External screenshots:
`implementation-evidence/site-wide/constructor-size-mobile-final.jpg` and
`constructor-size-desktop-final.jpg`. System restored/viewport reset. This is
narrow parent browser evidence, not whole-site certification.
Final lint/build passed;49 constructor assets/30 flags validated. Keyed audit,
Home and constructor-media generator reruns preserved all design-system hashes;
formatting/diff checks passed. Existing Vite large-chunk warning remains. No
full-suite/API rerun or new deployment verification for this narrow amendment.

Latest narrow numeral correction (8 October): two resolved-theme regressions
failed on accent-red numerals before implementation; final47 tests/4files passed,
with lint/build/keyed-token/asset checks. The visible aria-hidden duplicate inherits
badge colour rather than generic route span colour. Parent verified all six Home
badges match podium numerals: Dark rgb(240,242,243), Light rgb(32,40,46); red borders
remain rgb(240,82,77)/rgb(186,51,47). Mobile390 client/scroll376; System restored and
viewport reset. External site-wide/driver-number-neutral-final.jpg records this
narrow sample; no browser was navigated by Cody. Earlier full589/55 remains dated,
not rerun for this colour-only correction. External executions:
`driver-number-neutral-colour-resolved-red.txt`,
`driver-number-neutral-colour-final-green.txt`, and corresponding lint/build logs.
An earlier test-fixture trial and jsdom border-shorthand trial are retained,
not claimed as production defects. No API changes or Git/live writes.

| Route/state                                           | Principal consumers                                                       | Review batch                                                                                 |
| ----------------------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `/` + history dialog/full results                     | CompletedRaceOverview, RacePodium, LeaderList, history, shared identities | Preserve approved composition; identity regression guards                                    |
| `/calendar` + expanded completed/upcoming round       | calendar podium, ScheduleTime, circuit/layout, shared controls            | Record identities; source/unknown states                                                     |
| `/events/:eventId` + all session datasets             | RaceRecords/results/qualifying tables, Panel, picker, evidence links      | Record identities, compact controls, semantic table scrolling                                |
| `/standings?kind=drivers/constructors`                | StandingRows, context toolbar, pagination                                 | Canonical identities, context controls                                                       |
| `/drivers/:id`                                        | Profile details/history/results/progression                               | Padded bodies, heading vs record identity                                                    |
| `/constructors/:id`                                   | Profile details/history                                                   | Compact record vs semantic heading identity                                                  |
| `/circuits/:id`                                       | Profile details/events/layouts                                            | Padded bodies, country/context ownership                                                     |
| `/explore` + search/error/empty                       | SearchResultItem, EntityPicker, collections                               | Record identities, actions, form containment                                                 |
| `/compare` + selection/results                        | EntityPicker, comparison table                                            | Shared controls, own-range context, no invented metrics                                      |
| `/analytics` + all analyses/context disclosure        | scope summary, snapshot, spotlight, intelligence, recent results, charts  | Canonical identities, action ownership, responsive contexts                                  |
| `/questions` + unavailable/input/result               | Questions, ArchiveQuestionResult                                          | Shared controls/body/action spacing; fixture result coverage, parent live submissions failed |
| `/sources`                                            | provider cards/rights                                                     | Padded bodies, type/spacing; retain rights/source semantics                                  |
| `/evidence/:evidenceId` + record/technical disclosure | Evidence fields/return link                                               | Padded bodies, human/technical hierarchy, own record context                                 |
| `/design/overview-layouts`                            | dated reference mockups                                                   | Historical compositions stay dated; shared primitives audited                                |
| `/design` (development only)                          | component gallery/state/table                                             | Canonical identity examples and shared primitive contracts                                   |
| `?audit=1` (development only overlay)                 | DevAudit                                                                  | Shared Button, contained technical output; no production debug expansion                     |
| unmatched path                                        | PageHeading/EmptyState/ActionLink                                         | Shared semantics/reflow, navigation unchanged                                                |

## Frozen implementation and verification — 8 October 2026

Canonical identities now serve Calendar, classifications, Standings, profiles/
history, Explore, analytics and dialogs. Semantic heading/record variants preserve
Home. Known countries reuse bundled flags; absent numbers/countries are not invented.
Shared padded bodies, stacked headings/left actions, intrinsic status badges and
responsive controls replace confirmed competing overrides. Analytics nested
headings, unpaired chart placement, axis names and confined tooltips are covered.
Compare's source footer is padded without double-padding its table. Navigation
does not transfer Compare's `kind=season` to Standings; valid championship context
and canonical/legacy standing-snapshot parameters remain supported.

Final frozen `npm run check`: **589 tests / 55 files**, lint and production build passed.
Final token/semantics/cascade-focused: **33 tests / 4 files**; preceding expanded
follow-up106/11 passed. Earlier569/53 and68/9 are pre-follow-up evidence.
Prebuild validated49 constructor assets
(1,169,191 bytes) and30 flags (207,805 bytes). Owned token generation is idempotent;
production bundles contain no checked isolated-QA/gallery markers. Both diff
checks passed. Existing jsdom `scrollTo()` and Vite >500kB warnings remain.
API tests were not rerun: backend code is unchanged; five pre-existing dirty API
documentation files remain preserved.

Executions are external under
`C:/Users/garya/OneDrive/Documents/ChatGPT/F1/audit-2026-10-08/execution-evidence/`.
Current green: `ui-consistency-frozen-final-check.txt` and
`ui-consistency-final-token-green.txt`; `ui-consistency-token-aria-calendar-final-green.txt`
records106/11. Older `ui-consistency-full-client-final.txt` and
`ui-consistency-freeze-focused-green.txt` precede the final review follow-up.
Retained fail-before logs cover identity,
body, Calendar, charts, control, heading, token-validation and provenance contracts.
The first full run caught an incorrect ambient-season artwork change; the existing
expectation was restored, with only its wording clarified. Undated identity
defaults make no dated-period claim; the earlier artwork-red hypothesis is
superseded. `ui-consistency-route-context-red.txt` actually passed after an import
raced implementation: it is not claimed as fail-before evidence.

Parent reported all route-pattern desktop/390 inspection including details,
fallback, gallery and dated mockups; updated profiles, completed/upcoming Calendar,
Standings, Compare, Explore, Sources, Ask error, analytics/context and More menu
were sampled. Alternate layouts loaded; Compare2000/2001 unavailable metrics
stayed explicit. The final post-freeze parent matrix below is received. Proofs are
external under `implementation-evidence/site-wide/`; this is not every-state proof.

### Parent post-freeze browser matrix

| Sample                                           | Observed state                                                                                                                                                  |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home desktop/390                                 | Approved composition retained; full results/Show less, all rounds/Return to ribbon and Chinese history modal worked.                                            |
| Analytics desktop/390                            | Full-width heatmap; mobile tooltip x16.9/right240.85 within client376. Expanded snapshot/result headings and left actions matched.                              |
| Compare to Standings                             | Season comparison navigation targeted `/standings?season=2026`, invalid-selection count0.                                                                       |
| Sources desktop Dark/Light,320 Light             | Healthy source state, no horizontal page overflow.                                                                                                              |
| Gallery Controls                                 | Sampled button scan reported “No automated WCAG A/AA violations detected”; not a whole-site accessibility certification.                                        |
| Gallery Responsive Table320                      | Intentional horizontal scrolling contained in the table region.                                                                                                 |
| Home DevAudit final sample                       | After semantic fix: violations[], passes28; incomplete only color-contrast66 nodes. No prohibited-ARIA incomplete remains; manual contrast assessment required. |
| Race qualifying desktop/390                      | Qualifying rendered; unavailable Weather disabled explicitly.                                                                                                   |
| Evidence desktop/390                             | Technical publication disclosure accessible;390 no page overflow.                                                                                               |
| Explore desktop/390                              | Silverstone search1 match and Ask link verified.                                                                                                                |
| Profiles and both championship kinds desktop/390 | Previous post-freeze driver/constructor/circuit profile and both standing-type proofs received.                                                                 |
| Calendar320 final cascade                        | Display grid; all three filters x28.892, width248.5795, height43.99; client/scroll306.                                                                          |

**Current live Ask proof:** parent UI returned “Max Verstappen won 19 races in
2023.” for “How many races did Max Verstappen win in 2023?” Details showed Count19,
From/To year2023 and selected-season-only coverage. Archive Details and Source
Evidence opened successfully; mobile390 document/scroll widths both376. External
`implementation-evidence/site-wide/ask-answer-mobile.jpg` records that sample.
Desktop answer and both disclosure toggles also passed; Clear restored empty
composer/counter0/500 (`ask-answer-desktop.jpg`). No cause-fixed claim follows
from this successful retry; code and configuration were unchanged.

### Final review follow-up

Active control/card/marker dimensions, tracking, icon gaps and selection borders
in the audited analytics/components/entities styles now use existing or finite,
unit-validated keyed tokens with independent old-value/resolved-style assertions.
The mobile Calendar grid has scoped specificity to survive both lazy stylesheet
orders. Number badge/position/ribbon labels use real sr-only text with decorative
duplicate digits aria-hidden, rather than naming generic spans or inventing roles.
Meaningful red captures:13 token/validator failures,3 semantics/cascade failures,
and3 remaining card-minimum failures; final focused33/4 plus preceding106/11 green.
The preceding focused trial's obsolete aria-label assertion was replaced with
screen-reader-text/absence-of-prohibited-attribute checks, not weakened.

Parent's final Home desktop/390 composition/identities were unchanged,390 page
width376/scroll376. Raw initial/final Home accessibility samples and final Calendar/
Home screenshots are external in site-wide; the initial prohibited-ARIA findings
are superseded by the final sample above. Gradient/single-character contrast
incompletes are not certified clean and require manual assessment. The final full
gate is the run started after all edits/formatting, with no source edits during it:
`ui-consistency-frozen-final-check.txt`,589/55. The concurrent intermediate
`ui-consistency-post-review-full-check.txt` run is not frozen-source proof.
Final token idempotence, asset inclusion, production QA exclusion and formatting/
diff checks were separately rechecked after the build. No API suite was rerun.

**Historical transient failure investigation:** parent's two earlier normal UI submissions failed after Interpreting.
Sources/readiness GETs succeeded, but failed response/server error detail was
unavailable, so cause is unverified. Interpreter failure cannot be inferred from
a generic request error. Fixture answer/unavailable/error coverage is distinct
from the later parent live UI success. Backend, keys, model and environment
configuration are unchanged.

Read-only timeout follow-up: the currently served Vite module and unchanged HEAD
both configure RTK Query at75,000ms; proxy timeout/proxyTimeout are90,000ms. There
is no30-second Ask endpoint override. Thus the reported roughly30-second failure
does not match these configured client/proxy limits; its original request status
and server result remain unknown. API logging is stdout-only; this task has no
attached API terminal and process ancestry revealed no log-file redirect. Database
statements are limited to15,000ms, but that is configuration, not proof of a failed
query. That initial trace executed no replacement request/model call. Recovering the owning
terminal's original request log or a retained sanitized response is needed to
distinguish server500, transport failure, parsing failure or actual client abort.

Subsequently the parent authorized one controlled direct local Ask request. It
returned HTTP200 in14,719ms (request ID
`28e2d616-9fe1-42a3-a629-3989f3df4b1b`), with no error code, so the prior failure
was not reproduced. The sanitizer checked the wrong response-envelope level;
answer status was not captured and is not claimed. No second request was made.
External `execution-evidence/ui-consistency-ask-controlled-diagnostic.md` records
this precisely. Prior browser error cause remains unknown, rather than inferred
from current healthy GETs or configured timeouts.

Legacy illustration geometry, structural zero/100%/grid ratios and approved
viewport/reference limits remain; no zero-literals, full WCAG, source-accuracy or
pixel-fidelity certification for unrelated pages is claimed. No commit, push,
deployment, provider import or live write occurred in this task.
Retained examples are illustrative donut diameters4.5/3.75rem and the intrinsic
text-relative1em status icon. Active card/control minimums are token-owned, not
classified as illustration exceptions.
