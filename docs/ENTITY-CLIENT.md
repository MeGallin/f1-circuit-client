# Entity and comparison client — 18 September 2026

## Routes and behavior

- `/explore`: deterministic published-archive search by name or keyword, scope-aware All/Drivers/Constructors/Circuits/Events/Seasons filters, canonical profile/event/season navigation, and cursor pagination pinned to a publication snapshot. It never calls the question layer.
- `/drivers/:id` and `/constructors/:id`: published identity, nullable profile facts/metrics, paginated classification history, season filtering, and championship progression (`view=progression`).
- `/circuits/:id`: published location, paginated event history and layout records (`view=layouts`). Supplied layout assets are external links, with attribution/licence shown when available.
- `/compare`: driver, constructor, circuit or season selection; name search for entities; exact metric and season-range query state; explicit unavailable coverage. Fractional values stay strings, missing values remain missing. Circuit points and invalid/reversed ranges are blocked.

Explore is available in desktop/mobile navigation. `/questions` is the separate AI-assisted natural-language archive route; its optional context is collapsed by default and its answer/details/evidence disclosures remain source-backed. Standings and race entries link to profiles. Existing Apex components, JavaScript, Redux Toolkit/RTK Query, responsive tokens and provenance display are reused; no dependencies were added. Favicon is now a declared local SVG.

## Verification

- `npm run check`: ESLint passed; 9 test files, 35 tests passed; production Vite build passed (JS 421.08 kB / 133.62 kB gzip).
- New entity suite: 10 tests covering contract mapping, search pagination/filter identity, driver/constructor/circuit profiles, history pagination and season changes, loading/404/retry, empty progression, comparison filters/unavailable data/invalid inputs, and exact decimal values.
- Live public-data checks: Hamilton and Mercedes profiles/results, Silverstone events/layout empty state, championship progression, search, full two-entity search/select/compare flow, comparison unavailable state.
- Automated accessibility checks: Explore, driver profile, constructor progression, circuit layouts and comparison passed in dark and light themes with zero violations and zero incomplete checks.
- All five route families at 320, 390 and 1440 pixels: no document-level horizontal overflow. Desktop comparison visually inspected. These checks do not substitute for exhaustive assistive-technology/device testing.
- Favicon returned HTTP 200.
- Theme-switch contrast finding resolved: button background previously transitioned for 120 ms while foreground changed immediately. Removing that background fade keeps paired theme colors synchronized; settled palette tokens were already compliant and were not changed.

## Contract and deployment limits

Driver/constructor classification history contains opaque session references but no event names or event IDs. The UI exposes supplied references without deriving names from IDs. Published career totals, comparison metrics and circuit layouts may remain unavailable; no totals or winners are inferred from partial data.

The currently deployed API returned HTTP 404 for a valid season comparison. The client preserves the selection and shows the existing error/retry state. API commit 0300ea5 corrects season-identity handling but has not been deployed; after deployment the API still deliberately returns unavailable metrics until scoring rules are qualified. Entity comparisons currently return explicit unavailable coverage successfully.

No API files, optional bulk work, environment files, archive jobs or activation settings were changed in this client phase. No deployment occurred. Archive run archive-20260918 remains under the existing 2019 hold; public browsing used only the 2024 calendar/British GP slice. This report supersedes the earlier validation report's statement that entity screens were unimplemented.
