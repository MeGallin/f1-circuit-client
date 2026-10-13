# Senior review — 13 October 2026

Current outcome: all approved findings closed, full client720 tests/65 files and
API300/check/Newman117/197 green, explicit parent visual acceptance received for
the frozen sampled matrix. Ready for manual commits; no commit was performed.

## Initial findings and approved phase 2

Reviewed20 client dirty files:8 source/style,4 tests,1 contract,6 docs and AGENTS.
No broad DRY/SOLID/KISS refactoring is justified. ModalShell extraction and SourceNote
inline variant stay narrow; Ask/general collection transforms are unchanged.
Compiled cross-repository findings are in
[the API review](../../api/docs/SENIOR-REVIEW-2026-10-13.md).

CE-01 (P2): scenario validation accepts possible-with-unproven-condition, secured
without method, guaranteed path without proof totals, and no-opportunities with
future evidence. Read-only probes confirmed acceptance. Add fail-first transport
regressions and status/evidence guards, not a second championship calculator.

CE-02 (adjacent P2, approved): the cutoff calendar was unpinned before this diff;
pinned standings can inherit the latest publication's event/date caption. Pin it
to standing evidence and test explicit/implicit pins with an initially mismatched
calendar. Keep the approved controls/summary/notes layout unchanged.

CR-01: parent identified generated schema domain/status mismatches. Fix the keyed
generator and both affected contracts only. Standing.number and older missing
client endpoints are inherited; preserve unrelated contract differences.

## Mandatory visual gate and evidence plan

Before coding, Cody inspected approved rendered references:
`C:/Users/garya/OneDrive/Documents/ChatGPT/F1/audit-2026-10-08/implementation-evidence/site-wide/title-outlook-redesign-2026-10-13-{page,desktop-cards}.jpg`
and their Standings/TitleScenariosDialog/ModalShell/Apex source. Reuse Panel,
PanelBody, Metric, StatusBadge, shared modal lifecycle, typography18/700 body family,
space6, existing borders/colors/breakpoints; no presentation redesign is planned.

Parent review matrix after final code freeze: both Standings kinds, latest/selected
historic/unavailable, desktop and actual CSS390/320, Light/Dark, modal default/details/
scroll/keyboard/close/focus restoration, relevant loading/error context. Sample Home
event dialog as shared consumer and confirm unaffected Ask transport. Explicit
parent acceptance is mandatory; until then implementation is ready for review or
verification pending, never finished.

Full API gate and full client suite/lint/build/assets/design/idempotence/diff checks
ran after functional freeze. Raw red/green logs stay external under
`C:/Users/garya/OneDrive/Documents/ChatGPT/F1/audit-2026-10-13/execution-evidence/`.
Final results and visual acceptance are recorded below; earlier55-focused/269API
counts remain historical. No application or live data writes outside approved code,
tests, generated scoped contracts and documentation. No commits/push/deploy/imports.

## Final resolutions, full gate and explicit visual acceptance

CE-01 now checks status/evidence relationships directly, without calculating title
math: secured needs its method; unresolved states have none; future next states
need event/gain/budget; no-opportunities carries no future data; possible limits
cannot be null; proven paths need target/proof totals and unproven paths have null
targets; gap threshold/budget presence matches. CE-02 pins the existing calendar
query to the standing publication (or URL pin before data), rejects mismatched
calendar context and uses round-only text while matching context loads. Controls,
styles, shared modal lifecycle, page/footer hierarchy and existing layout are intact.

Initial fail-first:38 cases,22 pass/16 intended failures (14 evidence,2 publication
contexts). Frozen focused38/38 passed. Entire `npm run check`: **720 tests/65 files**,
lint, production build and prebuild asset checks passed. Design/token/semantics/
cascade/season-panel regression files are included in that full suite, not merely
the earlier focused55. API full gate300/Newman117/197 passed. Both repository diff
checks and scoped contract/design regeneration idempotence passed. All31 captured
dirty source/test/contract hashes stayed unchanged through gates and regeneration.
Built assets were physically validated and byte-compared to public originals:
49 constructors/1,169,191 bytes and30 flags/207,805 bytes, including retained flag
license. Existing Vite >500kB warnings remain; no new assets/packages were added.

External logs in the directory above: `senior-client-red.log`,
`senior-client-frozen-focused.log`, `senior-client-full-check.log`,
`senior-design-idempotence.log`, `senior-build-assets.log`,
`senior-contract-semantic-final.log`, `senior-frozen-code-hashes.json`.
The API report records its red/green/contract evidence and preserved inherited
Standing.number property/requirement and endpoint differences.

Parent explicitly accepted the final frozen rendering, conditional on no later
functional UI change; Cody confirms none since13:35. Actual sampled matrix:

| Viewport/theme                | Route/state and observed result                                                              |
| ----------------------------- | -------------------------------------------------------------------------------------------- |
| Desktop actual1041/790, Dark  | Both Standings kinds;150/49 and258/125; expected scenario totals/layout                      |
| CSS390, Dark                  | Constructors, expanded proof, reachable sticky close; no horizontal overflow                 |
| CSS320, Dark/Light            | Drivers, Enter disclosure, Escape close and returned trigger focus; no horizontal overflow   |
| CSS390, Light                 | R16 drivers183/100, next Sprint10Oct unproven, US earliest, Mexico403/397                    |
| CSS390, Light                 | Historical2000 unavailable; no borrowed scoring rules                                        |
| Desktop1041 and CSS320, Light | Home EventInsightDialog correct3 podium rows, Escape restores ribbon focus and body overflow |

Forward Tab from the title close reached the modal summary. Shift-Tab from the
first control may move to browser chrome/body, not an observed background control;
do not describe body as a dialog or claim an exhaustive focus-trap audit. No
horizontal overflow was observed in these samples, which is not alone proof
against all clipping. Empty/error/loading UI states have fixture evidence only,
not this browser matrix. Ask transport is unchanged by diff inspection; no new
live Ask submission was performed or required to claim transport was untouched.

External parent proofs, all under
`C:/Users/garya/OneDrive/Documents/ChatGPT/F1/audit-2026-10-08/implementation-evidence/site-wide/`:
`senior-review-2026-10-13-{desktop-dark,constructors-dark,mobile390-dark,mobile390-details,mobile320-dark,mobile320-light,round16-light,historical2000-light,event-desktop-light,event-mobile320-light}.jpg`.
Parent indicated restoration to original Questions/System/normal viewport; Cody
did not operate the browser or independently certify that restoration.

No unreviewed visual deviation is outstanding in the accepted scope. Sampled
acceptance is not full accessibility/source correctness or exhaustive UI proof.
Final documentation-only updates did not rerun application tests. No commits,
pushes, deployment, source imports or live database writes occurred.

## Phase-2 changed absolute paths

Client: `C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/client/`:
`src/api/titleScenarios.js`, `src/pages/Standings.jsx`,
`tests/title-scenarios.test.jsx`, `tests/standing-presentation.test.jsx`,
`contracts/openapi.json`, `docs/SENIOR-REVIEW-2026-10-13.md`,
`docs/CHECKPOINT.md`, `docs/STANDING-SCENARIOS.md`.

API: `C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/api/`:
`src/models/championship-points.js`, `src/models/season-date.js`,
`src/services/standing-podiums.service.js`, `src/services/standing-outlook.service.js`,
`src/services/title-scenarios.js`, `scripts/update-standing-outlook-contract.js`,
`tests/standing-podiums.test.js`, `tests/standing-outlook.test.js`,
`docs/openapi.json`, `docs/contract-manifest.json`,
`docs/SENIOR-REVIEW-2026-10-13.md`, `docs/STANDING-OUTLOOK.md`.
Shared memory: `C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/memory.md`.
Other existing dirty work is preserved; this is not a claim of ownership over it.

## Suggested manual commit messages (not executed)

API: `feat(standings): derive publication-pinned podiums and title outlooks`

Client: `feat(standings): present evidence-aware championship outlooks`

Include reviewed regression/contract/documentation changes in the appropriate
repository. Root memory/AGENTS and personal role configuration are outside both
repositories and need separate preservation. User retains staging/commit control.
