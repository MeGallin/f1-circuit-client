# F1 Circuit Client

Frontend repository for the F1 Circuit historical and post-race application, using the selected Apex design direction.

The Apex client covers the season overview, calendar, standings, race/session analysis, entity profiles and comparisons, analytics, source coverage and field-level evidence. Explore is the separate archive-search surface; Ask provides database-backed questions with optional server-side interpretation, while factual answers remain grounded in published database records. The standalone Records surface remains deferred. Run `npm ci` then `npm run dev`; review http://127.0.0.1:5173/. Run `npm run check` for lint, tests and production build.

## Race-update review — 6 October 2026

Local Git history confirms client `fb7cbd0` and companion API `734a4ed`. Both pushes are user-confirmed; deployment and production/live smoke verification for these commits are **PENDING**. Current-year source refresh uses server-driven cooldown/busy timers, aborts on unmount/season changes and invalidates catalogue, season summary/calendar/standings, event and session caches. Historical refresh reloads archive data only. Precise pending-result selection handles final races and unknown statuses without resurfacing older unknown races after newer completed results.

Recorded `npm run check` passed lint, 141 tests and production build; the final focused regressions passed 36/36. API checks passed 133 tests, lint/format, contract verification and Newman 114 requests / 192 assertions, zero failures. The client build retains the existing large-chunk warning. See [current validation and limits](docs/FUNCTIONALITY-VALIDATION.md), [local QA](docs/LOCAL-QA.md), [season behavior](docs/SEASON-SLICE.md) and [trust surfaces](docs/TRUST-SURFACES.md). Actions secrets/dispatch and real PostgreSQL multi-process locking are unverified. Older checkpoint documents retain their dated historical evidence.

## Architecture

Constructor identity uses reviewed, sponsor-free local assets with conservative
year handling and accessible text fallback. See [asset provenance, rights and
coverage](docs/CONSTRUCTOR-LOGOS.md); trademark/commercial-use clearance is not implied.
The 6 October expansion covers all 40 published 2000–2026 constructor IDs,
287 observed ID/year pairs and 49 local assets, with explicit undated defaults.
Ferrari shield, Aston wings, Cadillac crest and distinct sponsor-free Red Bull/RB
artwork are included. The initial expanded delivery passed 281 tests; the senior
follow-up passed lint, 296 tests across 28 files and production build, including
historical-year, generator and build-asset guard regressions.
See the current verification in [constructor guidance](docs/CONSTRUCTOR-LOGOS.md).
Local history now records the logo implementation/review in client `1092bec`
(`feat: add constructor logos across the historical archive`). The cached client
`origin/main` is one commit behind; no fresh remote check or user-confirmed logo
push is recorded. Companion API HEAD `c7dd38d` contains documentation only and
matches its cached origin ref, not independent remote verification. Logo deployment,
live smoke and brand-use clearance remain pending. The race-update push confirmation
above applies only to the earlier named commits.

React with plain JavaScript, Redux Toolkit and RTK Query. The client consumes the normalized F1 Circuit API; provider credentials and database access belong on the server. The Apex design system provides reusable tokens, components and patterns.

| Directory           | Responsibility                                                          |
| ------------------- | ----------------------------------------------------------------------- |
| `src/app`           | Application setup, store and shared state slices                        |
| `src/components`    | Reusable application components                                         |
| `src/features`      | Feature modules                                                         |
| `src/pages`         | Route-level views                                                       |
| `src/api`           | API query definitions and response adapters                             |
| `src/design-system` | Apex tokens, primitives, components, patterns, assets and documentation |
| `src/styles`        | Application-level styles                                                |
| `public`            | Public static assets; never secrets                                     |
| `config`            | Reviewed tooling configuration when implementation begins               |
| `tests`, `fixtures` | Tests and clearly labelled synthetic examples                           |
| `contracts`         | Pinned API contract artifacts and version manifests                     |
| `docs`              | Frontend documentation                                                  |

Empty directories are retained using `.gitkeep` placeholders. No TypeScript is introduced.

The API is a separate repository. This client must build independently and must not depend on untracked sibling files or a parent npm workspace. Keep credentials and local environment files out of Git. Client configuration is public once bundled; never put secrets in it.
