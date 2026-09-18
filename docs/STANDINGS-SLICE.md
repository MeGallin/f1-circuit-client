# Standings route

`/standings?season=2024&kind=drivers&round=12` selects driver standings after round 12. `kind=constructors` selects constructor standings. Omit `round` for latest published within the archive, never implied current real-world standings.

The documented `/seasons/{year}/standings/{kind}` endpoint supplies rows, rank, exact string points, wins, nullable podiums, metadata and pagination. Rows retain API order. Missing values remain explicit. The calendar populates round choices without implying that standings for every round are imported. Missing round responses never fall back to latest. Switching championship kind preserves the round; changing season resets round and pagination.

Navigation retains season, kind and round. Next-page links retain the server cursor, publication snapshot and supplied standing snapshot; refresh is safe. Expired-snapshot retry clears pagination and invalidates season data. The current archive fits on one 50-row page. No standings progression or inferred rank changes are included.

Responsive rows use stacked rank/name/statistics on mobile and aligned columns at desktop widths. Shared tabs support arrow-key navigation. Shared loading, empty, retry and source disclosures preserve partial coverage, freshness, attribution and retrieval dates. Development-only reviewState=loading|empty|error provides explicitly labelled state simulations without fake records.

Scope stops at standings. Sources and other unbuilt routes remain explicit placeholders. No final hardening or deployment is included in this slice.
