# Standings podiums — 13 October 2026

The [API counting and coverage contract](../../api/docs/STANDING-PODIUMS.md)
owns this server projection. Drivers and Constructors show published final-race
podiums through the selected standing round, on every page. The browser adds no
per-row requests or calculations. Existing identities, tokens and row layout are
retained; no CSS, assets, Home or Season races ribbon changes were needed.

The shared standing note explains final-race-only scope, per-car constructor
credit, verified/expected race coverage and the distinction between complete
podium positions and partial overall source coverage. Incomplete numbers are
labelled `observed`, including `0 observed`; unavailable remains `Not supplied`.
Detailed podium coverage now lives in the single keyboard-accessible footer,
following the [current presentation correction](STANDING-PRESENTATION.md), rather
than repeated cell hover descriptions. Exact
zero means no podium entry in the complete published podium scope, not an
unqualified claim about real-world source accuracy.

Four coverage cases failed before implementation. All nine standings tests then
passed. Final focused contract/standing/entity/race/season run passed40 tests in
four files. Lint and production build passed, including49 constructor/30 flag
prebuild checks; the existing Vite large-chunk warning remains. Full client suite
was not rerun. Generated client contract changes are limited to podium properties
and coverage schema; unrelated API/client contract differences are preserved.

Parent independently compared every2026R17 standing driver/team to full pinned
raw results: all23 drivers/all11 teams matched; both ordinary non-shared sums51.
Browser checked latest and2026R1 drivers, latest constructors and2000R1 constructors
(Ferrari2/Williams1). Latest refresh recovered old cached null values after the
API's derived-data ETag fix. Coverage note remained honest with partial source
metadata. At390px, client and scroll widths were376; existing rows fitted.
External parent screenshots:
`site-wide/standing-podiums-2026-10-13-{constructors,drivers,mobile,historical}.jpg`.
These samples do not certify every historical season or all accessibility states.
Normal viewport/2026 Drivers Latest/System were restored. Cody did not use the browser.

All work remains local. No commit, push, deployment, imports or live data writes.
The final documentation annotations did not trigger additional application tests.
