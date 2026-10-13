# Standings presentation correction — 13 October 2026

Latest additive [Title outlook tidy](STANDING-SCENARIOS.md) moves its single modal
action into the cutoff context row and removes the redundant metric heading/action.
The initial scenario modal appearance was rejected; its replacement uses compact
Apex cards and one closed technical footer. Mathematical/page-footer contracts and
the four-stat layout below remain unchanged; earlier visual measurements are dated.

This client-only amendment supersedes the initial outlook presentation described
in [the earlier math checkpoint](STANDING-OUTLOOK.md). Counts, score gaps, title
math, API contracts, publication/round selection and transport are unchanged.

## Current presentation contract

- The summary above the rows contains the leader, maximum points remaining,
  **Safe target (not minimum)** and a brief unavailable label when applicable.
  It uses the existing `PanelBody` and `Metric` components. Title outlook reuses
  the Home/Apex red mono `eyebrow`; the leader uses Home's existing narrow-title
  tokens. Metric sizes remain shared, rather than new display-size literals.
- Desktop places the leader beside the two metrics. Below the established768px
  breakpoint the leader spans the width and the metrics stay in two columns.
  Shared grid tracks/subgrid align their labels and values as content wraps.
  The four row stats and accessible short Gap label retain their existing layout.
- Exactly one native **Calculation and source details** disclosure follows the
  standings and pagination. It starts closed and contains the outlook context,
  schedule counts, sufficient-target explanation, assumptions, oversized-target
  qualification, rule sources, podium coverage notes, publication explanation,
  provenance/rights text, retrieval information and source warnings.
- Podium coverage explanations are no longer repeated in row hover tooltips.
  Essential `observed`/`Not supplied` value labels remain. Full coverage notes
  are available in the keyboard-accessible footer.
- `SourceNote` adds an explicit `collapsible={false}` variant for content already
  inside a parent disclosure. Its default source dropdown is unchanged elsewhere;
  the same rights, retrieval, warnings, coverage and About the data link render in
  both variants. No nested source dropdown remains on Standings.

Only current controls, context/error feedback, essential unavailable states and
metric labels remain above the data. There is no second explanation dropdown or
visible wall of calculation copy. Removed title-stat/heading/dropdown selectors
have no remaining consumers. All new presentation rules live in Apex and reuse
existing type/space/color/border tokens; no new assets or packages were introduced.
The requested design-taste skill was inspected for applicability: its explicit
dashboard/data-table exclusion applies, so marketing defaults were not used.

## Verification

Four integrated presentation tests failed before implementation: two championship
kinds with three disclosures instead of one, missing combined footer interaction,
and missing shared padded/metric hierarchy. Later assertions separately failed on
the remaining podium hover explanation and missing Home eyebrow class before
their fixes. The eyebrow assertion extends an existing hierarchy test; these are
failure observations, not six distinct newly added tests.

The presentation file has six tests, including the default/inline SourceNote guard.
Final focused48 tests/six files, lint and production build passed after the eyebrow
amendment. Prebuild validated49 constructor assets/30 country flags; the existing
Vite large-chunk warning remains. Full client suite was not rerun. Native summary
focus, Tab navigation, click open/close and content visibility are covered in jsdom;
real Enter/Space activation is separate parent browser evidence.

Parent desktop measured the compact summary106.5px, down from244.969px; initial
first-row document position was822.219px. Parent verified the final red eyebrow in
Light, one closed footer below rows, Enter close/Space open, all notes/provenance
inside and no nested disclosure. Driver150/49 and constructor258/125 remain intact.
At390px client/scroll376 and at320306, leader text wraps and metrics retain two
columns without page overflow. Parent saved external proofs:
`site-wide/standing-presentation-2026-10-13-{desktop,mobile,details}.jpg` and restored
normal viewport/2026 Drivers/System/disclosure closed. These are sampled UI checks,
not whole-application certification. Formatting and both repository diff checks
passed; final documentation annotations did not rerun application tests.

API files and transport are untouched by this amendment; API tests were not rerun.
The earlier257-test API and49-test outlook gates retain their dates and scopes.
No commit, push, deployment, provider import or database write occurred.

## Changed absolute paths for this amendment

- `C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/client/src/pages/Standings.jsx`
- `C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/client/src/components/ui.jsx`
- `C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/client/src/design-system/standings-context.css`
- `C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/client/tests/standing-presentation.test.jsx`
- `C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/client/tests/standing-outlook.test.jsx`
- `C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/client/tests/standings.test.jsx`
- `C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/client/docs/STANDING-PRESENTATION.md`
- `C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/client/docs/STANDING-OUTLOOK.md`
- `C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/client/docs/STANDING-PODIUMS.md`
- `C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/client/docs/UI-CONSISTENCY.md`
- `C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/client/docs/CHECKPOINT.md`
- `C:/xampp/htdocs/WebSitesDesigns/developments/f1-circuit/memory.md` (outside both repositories)
