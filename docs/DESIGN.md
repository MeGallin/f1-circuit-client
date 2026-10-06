# Apex implementation

Reading this as: a mobile-first historical sports data product for engaged F1 followers, with a trackside editorial language, leaning toward a custom CSS design system.

DESIGN_VARIANCE 5, MOTION_INTENSITY 3, VISUAL_DENSITY 6. Custom React components, no component library. Selected Apex tokens and licensed self-hosted Barlow Condensed / IBM Plex fonts are copied from the approved handoff. Dark is the default; light and system are explicit preferences. One theme covers the entire page.

Token source: src/design-system/apex.tokens.json; generated CSS and media constants from the approved handoff. Brand roles are separate from semantic status roles. Red remains selected. Spacing, typography, 3px radii, borders, elevation, layers, motion and breakpoints live in this layer. No decorative animation.

Build checkpoints: foundation, reusable components, real season overview, route groups, final verification. This is a local review build; deployment is not authorized.

Constructor identity extends Apex with a neutral `logoTile` colour and the named
`constructorIdentityCompact` container breakpoint. Icon, spacing and radius tokens
remain shared; generated query CSS comes from `node scripts/generate-constructor-media.js`.
See [constructor asset and accessibility guidance](CONSTRUCTOR-LOGOS.md).
The constructor extension generates both tile roles from keyed JSON themes,
without patching the approved base token CSS or font roles. Invalid input does
not partially rewrite output; generation is deterministic.

`ConstructorLogo` / `ConstructorIdentity` share local artwork and API-backed names
across constructor identity surfaces. `logoTileDark` preserves the original pale
RB/HRT artwork without recolouring. Icon sizes, spacing and radius are existing
Apex roles. The podium selector outranks legacy descendant span rules so the
badge sits beside the team name beneath the driver; compact panel-width queries
remove the standings stagger and names wrap. No chart-label/select-option logos
or global layout redesign are introduced. Recorded senior review passed 296
tests across 28 files plus lint/build; [source and rights guidance](CONSTRUCTOR-LOGOS.md)
remains separate from visual acceptance and deployment permission.
