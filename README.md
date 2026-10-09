# F1 Circuit Client

## Latest uncommitted review — 9 October 2026

[Current findings, checks and limits](docs/SENIOR-REVIEW-2026-10-09.md) supersedes
the execution totals below. Approved Home geometry/40×30 flags are preserved;
no new deployment is verified. Earlier checkpoints remain dated evidence.

## Site-wide UI handoff checkpoint — 8 October 2026

[Binding UI contract and route inventory](docs/UI-CONSISTENCY.md): shared semantic
identities, padded bodies, heading/action hierarchy and responsive controls now
apply across record/detail routes, preserving Home. Final589 tests/55files,
lint/build/token/assets passed; final sampled parent browser matrix is recorded.
Parent live Ask now answered19 wins in2023; earlier transient failures were not
reproduced, with unknown cause. No API change or new deployment is claimed.

## Current approved Home Option3 — 8 October 2026

Home now has a combined left race header/podium and simultaneous top-three Drivers/
Constructors with one pinned View standings link each, race-results-only inline
expansion and source-owned bundled country flags.
Countdown and approved Season races controls remain; no Previous event band.
[Current reference, TDD and measured browser proof](docs/HOME-REFERENCE-FIDELITY.md) owns
this local uncommitted handoff; final checks are recorded there. No new deployment
is verified. Earlier senior-review checks below remain dated evidence.

## Historical completed senior review — 8 October 2026 (before Option3)

[Review findings, current checks and external evidence inventory](docs/SENIOR-REVIEW-2026-10-08.md)
supersede earlier audit/Home check totals below. Source-context, metric, time and
chart-tooltip guards are strengthened; keyed Apex generation preserves approved
dimensions. The reusable QA fixture stays in tests, outside the production entry.
Raw execution captures are archived outside both repositories, not shipped.

Recorded coding-review checks: client460 tests/44 files plus12 focused/2files
after whitespace-only generator cleanup; API163 tests, Newman114 requests/
192 assertions. All twelve browser gates and Home amendments are accepted locally.
The62-file/265,860-byte archive is SHA-256 verified. This documentation pass
reruns no tests/builds; no new commit, push or deployment is verified.

Final local HEAD observed:9b5c3a9; implementation is locally committed, while this
documentation alignment remains dirty. This is not remote/push/deployment evidence;
the review agent made no commit. Earlier uncommitted wording below is dated history.

## Historical Home followup — 8 October 2026 (before senior review)

The redundant Previous event band is removed on all devices by user approval;
the approved Season races ribbon/history/details and next-event/countdown remain.
[Scoped verification and browser proof](docs/HOME-PREVIOUS-EVENT-REMOVAL.md).
No API change or deployment; existing local edits remain uncommitted.

## Historical accepted audit handoff — 8 October 2026 (before Home followup)

All twelve UI/UX audit gates are implemented and parent-browser accepted.
Final client `npm run check` passed lint,436 tests/43 files, keyed ribbon tokens,
49-asset guard and production build; companion API passed160 tests,
lint/format/contract and Newman114 requests/192 assertions, zero failures.
Existing jsdom scrollTo and >500kB chunk warnings remain. Full counts are executed
8 October evidence, not results inferred from documentation changes.

[The authoritative audit matrix](docs/UX-AUDIT-IMPLEMENTATION-VERIFICATION.md)
records source definitions, retained meaningful red logs, exact browser geometry,
controlled recovery and200% root-font (not native zoom) proofs. Championship and
selected totals stay distinct; time preference is shared; evidence is record-aware;
telemetry bounds remain explicitly unknown. Approved ribbon unchanged.
Audit code/docs remain uncommitted; no push/deploy/import/live write.
Earlier dated checkpoints below are historical; production/live smoke,
source publication/cron/locking and exhaustive accessibility remain separate.

Frontend repository for the F1 Circuit historical and post-race application, using the selected Apex design direction.

The Apex client covers the season overview, calendar, standings, race/session analysis, entity profiles and comparisons, analytics, source coverage and field-level evidence. Explore is the separate archive-search surface; Ask provides database-backed questions with optional server-side interpretation, while factual answers remain grounded in published database records. The standalone Records surface remains deferred. Run `npm ci` then `npm run dev`; review http://127.0.0.1:5173/. Run `npm run check` for lint, tests and production build.

## Historical handoff checkpoint — 6 October 2026

The user-approved Option 2 Season races ribbon and senior-review fixes are
committed locally as `f7f9ba6` (`feat(overview): replace season progress markers
with race history ribbon`). Before this documentation-only pass, client `main`
was clean and matched cached `origin/main`; companion API `c7dd38d` was also
clean and matched its cached ref. No fresh remote or live deployment check was
performed. Production verification remains **PENDING**.

Recorded 6 October review evidence: lint, 354 tests across 33 files, 49-asset
prebuild guard and production build passed; focused checks passed 56 tests across
seven files, with 17 intended regressions failing before fixes. These checks and
browser proofs were not rerun for this prose update. Preserve the approved visual
reference unless a new scoped change is authorised. The calendar query returns
all validated snapshot-pinned pages; card labels match visible actions, equivalent
refreshes preserve scroll/focus, and keyed token generation validates before writing.
See [current Git/handoff status](docs/CHECKPOINT.md), [recorded validation](docs/FUNCTIONALITY-VALIDATION.md),
[QA evidence](docs/LOCAL-QA.md) and [approved specification](docs/OVERVIEW-LAYOUT-IMPLEMENTATION-SPEC.md).
Shared root memory/guidance are maintained separately outside these Git repositories.

## Historical race-update review — 6 October 2026

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
The logo implementation/review entered local history as client `1092bec`
(`feat: add constructor logos across the historical archive`). Its earlier
one-commit-ahead checkpoint is historical; current client `f7f9ba6` and API
`c7dd38d` match their respective cached origin refs as recorded above. This is
not fresh remote verification or a new user-confirmed push claim. Logo deployment,
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
