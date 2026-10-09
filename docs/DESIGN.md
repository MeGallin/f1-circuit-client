# Apex implementation

## Binding site-wide contract — 8 October 2026

[UI-CONSISTENCY.md](UI-CONSISTENCY.md) owns semantic identity variants, shared
body/header/action patterns, route inventory and verification. Home remains
separately approved. Added presentation limits/media derive from validated keyed
Apex source; retained structural/illustration values are not a zero-literals claim.

## Current audit/Home design contract — 8 October 2026

Approved [Home reference fidelity](HOME-REFERENCE-FIDELITY.md) now owns the combined left completed-race/podium and
simultaneous podium/top-three championship layout, source-country SVG flags and
responsive inline expansion. It supersedes the old Home tabs/container compact
rules, not the approved ribbon actions or countdown. Shared country-flag.css owns
image sizing; existing Apex frame/spacing/type tokens are reused. home-fidelity.css
owns Home composition; overview-focus.css retains countdown compaction only.
Current keyed900px media and80px preview-minimum generator validates safe positive
integers before writing. Desktop rows share scoped padding/minimum, not fixed
heights. Podium badges/team text and names use the existing markup in Home-only
grids; other shared identities keep their styling. Colors remain canvas/surface
roles, including the subtle Home gradient. Current525/48 plus127 focused/6files,
asset/build and measured browser/raster evidence are in the current record.

Preserve the accepted twelve audit gates and approved Season races composition;
Previous event is removed, and the footer actions alone have equal responsive sizing
with the existing expansion/Return labels. Shared table/reflow/scope/time styling
belongs in the design system, not a Race-only import or repeated local styles.
Audit limits/media aliases/icons derive from keyed Apex JSON; generators validate
finite positive values before writing and remain idempotent. Chart fallback colors
reuse exported Apex palette roles. Strict time/source semantics and recorded
460/44 plus12 focused/2files verification are in the [senior review](SENIOR-REVIEW-2026-10-08.md).
This prose update runs no tests/builds and verifies no new deployment.

Reading this as: a mobile-first historical sports data product for engaged F1 followers, with a trackside editorial language, leaning toward a custom CSS design system.

DESIGN_VARIANCE 5, MOTION_INTENSITY 3, VISUAL_DENSITY 6. Custom React components, no component library. Selected Apex tokens and licensed self-hosted Barlow Condensed / IBM Plex fonts are copied from the approved handoff. Dark is the default; light and system are explicit preferences. One theme covers the entire page.

Token source: src/design-system/apex.tokens.json; generated CSS and media constants from the approved handoff. Brand roles are separate from semantic status roles. Red remains selected. Spacing, typography, 3px radii, borders, elevation, layers, motion and breakpoints live in this layer. No decorative animation.

Build checkpoints: foundation, reusable components, real season overview, route groups, final verification. This is a local review build; deployment is not authorized.

Constructor identity extends Apex with neutral `logoTile` theme roles. Icon,
spacing and radius tokens remain shared; generated theme CSS comes from
`node scripts/generate-constructor-media.js`. The former Home-tab-only
`constructorIdentityCompact` container token/selectors were removed in Option3.
See [constructor asset and accessibility guidance](CONSTRUCTOR-LOGOS.md).
The constructor extension generates both tile roles from keyed JSON themes,
without patching the approved base token CSS or font roles. Invalid input does
not partially rewrite output; generation is deterministic.

`ConstructorLogo` / `ConstructorIdentity` share local artwork and API-backed names
across constructor identity surfaces. `logoTileDark` preserves the original pale
RB/HRT artwork without recolouring. Icon sizes, spacing and radius are existing
Apex roles. The podium selector outranks legacy descendant span rules so the
badge sits beside the team name beneath the driver; compact Home previews remove
the standings stagger and names wrap. No chart-label/select-option logos
or global layout redesign are introduced. Recorded senior review passed 296
tests across 28 files plus lint/build; [source and rights guidance](CONSTRUCTOR-LOGOS.md)
remains separate from visual acceptance and deployment permission.
