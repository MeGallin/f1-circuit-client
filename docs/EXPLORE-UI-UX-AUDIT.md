# Explore route UI/UX audit

Date: 20 September 2026  
Route reviewed: `/explore?season=2025`  
Audience: engaged Formula 1 followers, researchers and curious visitors looking for a specific person, team, circuit, race or season.

## Executive verdict

The Explore route has a good foundation: it is honest about the archive, the main search is backed by the normalized publication, the controls are labelled, and the route preserves search state in the URL. The dark trackside editorial system also fits the product.

The current experience is not yet a strong exploration surface. It reads as two stacked utility panels rather than one confident archive index. The user has to decide whether to browse or search before the page explains the difference, the result list is too thin to support fast scanning, and the empty state gives no useful next move. The strongest direction is a search-first archive index with visible season context, clearer result anatomy and browse paths that cover the complete set of supported record types.

This should be a targeted evolution, not a new route or a visual rewrite. Keep `/explore`, the existing design tokens, the current navigation labels, the source-of-truth model and the URL-driven search contract.

## Implementation status

The first implementation slice is complete in the React client. The route now uses the search-first composition described below, with season context, richer result rows, query-aware empty states, search-specific loading and error states, expanded browse routes and preserved provenance. The remaining checklist items are manual responsive and theme QA items that must be verified before release.

## Design read and working dials

Reading this as: a redesign-preserve audit of a research-oriented archive for engaged F1 followers, with a dark trackside editorial language and moderate information density, leaning toward a search-first index rather than a generic dashboard.

- `DESIGN_VARIANCE`: 5. The page should feel distinctive through hierarchy and editorial spacing, not decorative novelty.
- `MOTION_INTENSITY`: 2. Search and result transitions should be calm and functional.
- `VISUAL_DENSITY`: 5. Results need enough metadata for recognition, but the page must remain comfortable on mobile.

## What was reviewed

### Current information architecture

1. Page heading: “People, teams & places”.
2. Page description explaining published profiles and imported coverage.
3. A page-level “Compare records” action.
4. “Browse by task” with Find a race, Browse drivers and Browse constructors.
5. “Search the archive” with query, record type, and Search.
6. A pre-search empty state, loading state, result list, pagination and source note.

### Supported search model

The client sends `q`, optional `kind`, `cursor`, `snapshotId` and a fixed result limit to the `/search` endpoint. The search endpoint reads the normalized publication and does not query upstream providers at request time. Search is not season-filtered by the API; a season in the URL is used for navigation context and for links into season-aware pages.

### States observed

- Initial state with no query.
- Successful search for “Hamilton”.
- Empty search for “zzzzzzzz”.
- Record-type selector with All records, Drivers, Constructors, Circuits, Events and Seasons.
- URL-persisted season context.

## What is working well

- The page is clear about its purpose and does not pretend to cover every participant in F1 history.
- The description establishes trust by distinguishing published/imported records from total historical coverage.
- Search is progressive rather than firing on every keystroke, which is appropriate for a source-backed archive.
- Record type is an explicit filter and the available kinds map to actual archive entities.
- The URL preserves `season`, `q`, `type`, pagination cursor and publication snapshot state.
- Search results link to canonical profile, event or season routes rather than exposing raw API URLs.
- The pre-search browse links give a route into the archive for users who do not have a name in mind.
- The page reuses the existing design system, accessible field labels, shared buttons, shared loading/error boundaries and provenance components.
- The page uses a single accent, a consistent dark theme and restrained shapes that match the calendar route.

## Findings and recommendations

Severity uses `P0` for a task-blocking issue, `P1` for a major usability issue, and `P2` for refinement.

### P0. The page does not establish a visible archive context

The route can carry a season, but Explore does not show a season selector or a visible “2025 archive” context. The user can arrive from a season page and then lose the context visually. The Compare records action also has an inconsistent hard-coded fallback to 2024 when no season is present, while the browse links use the runtime year.

Recommendation:

- Add a compact season context control to the page heading using the existing shared `Select` component.
- Keep the search itself publication-wide unless the API gains an explicit season parameter. Do not label the search as season-filtered when it is not.
- Use one runtime-current-year fallback for all Explore links. Remove the inconsistent 2024 fallback.
- Make the relationship explicit in helper copy: “Search the published archive, then carry the selected season into the detail page.”

Acceptance criteria:

- The current season is visible when a user arrives from Overview, Calendar or Standings.
- Compare records, browse links and canonical result links use the same season fallback.
- No UI implies that the `/search` endpoint filters records by season unless the contract is extended.

### P1. Search is not clearly the primary task

The page presents Browse by task before Search the archive, even though search is the most direct job for a page called Explore. The three browse links are visually equal to one another and the separate Compare records action competes with the page’s main purpose.

Recommendation:

- Lead with a single search-first module immediately beneath the page heading.
- Keep browse paths, but make them a secondary “Browse by route” section below the search or a compact row beside the empty search state.
- Move Compare records to a quieter secondary action near the result header or into a clearly labelled “Compare” route shortcut.
- Extend browse coverage to Circuits, Events and Seasons, or explicitly explain why those are intentionally reached through Calendar and Search.

Acceptance criteria:

- A first-time visitor understands the primary action within two seconds.
- Search receives the strongest visual hierarchy without becoming a generic oversized form.
- Browse remains available without competing with the main search action.

### P1. The initial empty state spends too much space without helping the user

The initial Search the archive panel contains a large low-information area and the generic title “Find a record”. The content does not demonstrate what can be searched beyond the placeholder examples.

Recommendation:

- Replace the generic empty state with a compact, purposeful prompt: “Search drivers, constructors, circuits, events or seasons.”
- Add two or three text examples as low-emphasis, keyboard-accessible query suggestions, such as Hamilton, Silverstone and 2024.
- Keep the form visible and focused as the primary empty state. Do not create a decorative hero or a large blank container.
- Let the panel height follow its content rather than reserving a dashboard-sized empty region.

Acceptance criteria:

- The initial view explains the supported record types without requiring a search.
- The next action is obvious on desktop and mobile.
- No blank panel area is created by the generic empty-state minimum height.

### P1. Search results are too thin for confident scanning

The observed Hamilton result is displayed as the name “Lewis Hamilton” followed by the raw lowercase kind “driver”. That is enough to navigate, but not enough to distinguish duplicate names, understand the record’s relevance, or choose between event and profile results quickly.

Recommendation:

- Give every result a consistent anatomy: primary name, human-readable record type, optional context such as season or circuit, and a clear destination affordance.
- Format kinds as “Driver”, “Constructor”, “Circuit”, “Event” or “Season”; never expose the raw API enum directly as the primary label.
- Preserve supplied context exactly. Do not infer nationality, team, winner or dates if the search response does not provide them.
- Visually separate the result name from its metadata with the existing type scale and muted colour tokens.
- Keep the result row as a text-led list rather than introducing thumbnail cards that add no source-backed value.

Acceptance criteria:

- A user can identify what each result is before opening it.
- Results remain readable with long names and missing context.
- Keyboard users can reach one clear link per result.

### P1. The empty-result state is technically correct but not useful

For a query with no results, the page says “No records available” and “This source does not currently contain data for this selection.” That wording sounds like a coverage failure rather than a normal search miss, and it does not repeat the query or give a recovery action.

Recommendation:

- Use query-aware copy: “No records match ‘zzzzzzzz’.”
- Add a direct recovery action: “Clear search” or “Try another name”.
- If a record type is selected, include it in the message: “No Drivers match ‘…’.”
- Keep source coverage language for genuine coverage limitations, not ordinary zero-result searches.

Acceptance criteria:

- A user understands whether they searched unsuccessfully or the archive lacks a dataset.
- The recovery action resets `q`, `type`, `cursor` and `snapshot` without losing season context.
- The empty result does not claim that the source is unavailable when the request succeeded.

### P1. Loading and error states are too generic for the task

The shared boundary displays “Loading historical data”, which is accurate across the application but not specific enough here. Explore should tell the user that the archive search is in progress and preserve the submitted query in the layout.

Recommendation:

- Use a search-specific loading label such as “Searching the archive”.
- Shape the loading state like result rows, not a generic page block.
- Keep the form available but disable only the submit action while the request is active.
- Use error copy that distinguishes a failed publication request from an empty result and retains the retry action.

Acceptance criteria:

- Loading state communicates the exact operation.
- No layout jump removes the form or loses the query.
- Retry preserves all URL filters and the current publication snapshot when appropriate.

### P2. “Name or season” is narrower than the actual search job

The label says “Name or season”, but the system also searches constructors, circuits and events. The placeholder gives only a driver and circuit example.

Recommendation:

- Change the label to “Search the archive” or “Name, circuit, race or season”.
- Use a short supporting hint rather than relying on a placeholder as instruction.
- Keep the two-character minimum and show it only when relevant to validation.

### P2. The page-level Compare records action needs clearer intent

“Compare records” is useful, but on this page it appears before the user has selected a record and is visually equal to the search journey. It can be interpreted as the main task rather than a secondary capability.

Recommendation:

- Keep it as a secondary page action, but use more explicit wording: “Compare two records”.
- Repeat or surface it after a result is selected only if the comparison route can accept that selection without inventing another step.
- Keep the route link season-aware.

### P2. The source note is trustworthy but arrives too late

The provenance block is important to this product, but the current placement makes it feel like a footer disclaimer. It also uses the same “partial coverage” language that is appropriate for auditability but not for the normal empty search state.

Recommendation:

- Keep the full source note below the results for auditability.
- Add a concise inline sentence near the search heading: “Results come from the published archive snapshot.”
- Keep coverage detail expandable so it does not compete with result recognition.

## Recommended page composition

The recommended layout keeps the route and components but changes the hierarchy:

```text
Page heading: Explore the archive                         Season: 2025
Short trust line: Search the published archive.

Search the archive
  [Search drivers, constructors, circuits, races or seasons] [Record type] [Search]
  Examples: Hamilton · Silverstone · 2024

Results, when present
  1 result / 23 results                 Clear filters / Compare two records
  [primary name]  [record type]  [context]                         Open →
  [primary name]  [record type]  [context]                         Open →
  Pagination

Browse another route
  Find a race | Browse drivers | Browse constructors | Browse circuits | Browse seasons

Data provenance
```

On the initial state, the results area becomes a compact explanation and examples rather than a tall generic empty panel. On the result state, the browse links recede so the result list becomes the focus. On the empty-result state, the same results region explains the query and offers a clear recovery action.

## Responsive and interaction guidance

### Mobile

- Stack the query input, record type and Search button in that order.
- Keep the Search button full width or at least the full available touch target width.
- Keep the season selector visible near the heading; do not hide context in a menu only.
- Use one result per row with the primary name first, type and context beneath it, and the link affordance at the trailing edge or on a full-width row.
- Browse routes should become a vertically stacked list, not three equal buttons that dominate the page.
- Keep result and empty-state copy short enough to avoid pushing the next action below the viewport.
- Test at 320px, 390px and 430px widths with long driver, constructor and circuit names.

### Keyboard and assistive technology

- Keep the existing explicit labels and native form controls.
- Give the filter group a visible relationship to the result count.
- Announce new results and empty results with a polite status region if the route updates without a full navigation.
- Ensure the query field receives focus after an explicit “Clear search” action.
- Preserve visible focus rings for links, buttons and the record-type select.
- Do not rely on colour alone to distinguish record types or coverage.

### URL and data integrity

- Preserve `season`, `q`, `type`, `cursor` and `snapshot` semantics.
- Clear pagination and snapshot whenever the query or type changes.
- Never make the search request against an upstream provider from the browser.
- Never manufacture nationality, team, date, result or coverage metadata for a search result.
- Keep source warnings and freshness available through the shared provenance component.

## Component and design-system guidance

Use the existing JavaScript React components and tokens:

- `PageHeading` for the route heading and season context.
- `Input`, `Select` and `Button` for the search form.
- `Panel` only where it communicates a real group; avoid nested or oversized empty panels.
- `TextLink` for result names and canonical entity navigation.
- `ActionLink` for route-level movement, not for every result row.
- `Skeleton`, `ErrorState`, `CollectionPages` and `SourceNote` for consistent states.

Do not create one-off generic classes or introduce a component library. Any new visual pattern should be a named, route-owned pattern in the existing design system. If a result row or query suggestion is used on another route, promote it to a reusable component rather than duplicating markup. Do not over-componentize a single Explore-only composition.

## Implementation checklist for the development team

- [x] Add visible season context to Explore without implying that search is season-filtered.
- [x] Remove the inconsistent hard-coded 2024 fallback from Explore links.
- [x] Reorder the page so Search the archive is the primary task.
- [x] Reduce the initial empty-state height and replace generic copy with useful examples.
- [x] Expand or clarify browse routes for circuits, events and seasons.
- [x] Improve the query label and helper copy.
- [x] Add a result count and a clear-filter action once results exist.
- [x] Build a consistent result-row anatomy with human-readable type labels.
- [x] Preserve supplied context and leave missing fields explicit.
- [x] Make the empty-result state query-aware and recoverable.
- [x] Make loading and error states search-specific while preserving the current query.
- [x] Keep provenance visible but subordinate to the search task.
- [ ] Verify mobile layout at 320px, 390px and 430px.
- [ ] Verify keyboard navigation, focus management, contrast and reduced motion.
- [x] Add or update tests for URL state, filters, empty results, clear action and result labels.
- [ ] Run the full client check and inspect the live route in dark and light themes before release.

## Definition of done

The Explore route is ready when a first-time visitor can answer these questions without explanation:

1. What can I search here?
2. Is this search for the current season or the published archive?
3. What kind of record did I find?
4. What will happen when I open the result?
5. What should I do if there are no results?
6. How do I get to races, drivers, constructors, circuits and seasons without guessing?

The implementation is complete only when the answers remain clear in the initial, loading, successful, empty, error, filtered, paginated and mobile states.
