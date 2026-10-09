# Standings route

## Current audit contract — 8 October 2026

Compact mobile context keeps the leader above the fixed navigation; selected round
and championship kind remain explicit and keyboard reachable. Published rank and
decimal points are retained. Analytics links pin the championship season, publication
and round, never substitute a filtered result total. Shared enlarged-text reflow
and measured navigation reserve prevent obscured final content; these are accepted
browser scenarios, not full WCAG certification. [Current review](SENIOR-REVIEW-2026-10-08.md)
records460/44 client plus12 focused/2files and163 API/Newman114/192 checks;
no tests or deployments are performed for this documentation update.

## Current constructor integration — 6 October 2026

Constructor rows and driver affiliations use the shared `ConstructorIdentity` /
`ConstructorIdentities` with the selected standings year. API ordering, names,
points and pagination remain authoritative. Repeated contract-valid constructor
records retain their names without duplicate React keys; unknown IDs, unsupported
years and failed images retain text. No successor-logo aliasing is used.
The reviewed archive covers 40 IDs, 287 ID/year pairs and 49 assets; full current
and 2000 standings loaded 11/11 images in recorded browser checks, including
390px current standings without page overflow. See [verification and rights](CONSTRUCTOR-LOGOS.md)
and [commit/deployment status](CHECKPOINT.md). This prose update runs no tests.

## Historical first standings slice

The first-slice scope/placeholder and archive-size statements below are historical;
overview, sources, profiles and analytics now exist.

`/standings?season=2024&kind=drivers&round=12` selects driver standings after round 12. `kind=constructors` selects constructor standings. Omit `round` for latest published within the archive, never implied current real-world standings.

The documented `/seasons/{year}/standings/{kind}` endpoint supplies rows, rank, exact string points, wins, nullable podiums, metadata and pagination. Rows retain API order. Missing values remain explicit. The calendar populates round choices without implying that standings for every round are imported. Missing round responses never fall back to latest. Switching championship kind preserves the round; changing season resets round and pagination.

Navigation retains season, kind and round. Next-page links retain the server cursor, publication snapshot and supplied standing snapshot; refresh is safe. Expired-snapshot retry clears pagination and invalidates season data. The current archive fits on one 50-row page. No standings progression or inferred rank changes are included.

Responsive rows use stacked rank/name/statistics on mobile and aligned columns at desktop widths. Shared tabs support arrow-key navigation. Shared loading, empty, retry and source disclosures preserve partial coverage, freshness, attribution and retrieval dates. Development-only reviewState=loading|empty|error provides explicitly labelled state simulations without fake records.

Scope stops at standings. Sources and other unbuilt routes remain explicit placeholders. No final hardening or deployment is included in this slice.
