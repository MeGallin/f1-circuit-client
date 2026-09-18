# Functionality validation — 18 September 2026

## Fixes

Standings pagination retains the original filters and pins only the publication snapshot; introducing a standings-snapshot filter on page two invalidated cursor identity. Regression tests cover latest and round-specific pagination. Missing points, calendar totals, and fastest-lap numbers now have explicit text instead of blank, perpetual loading, or null labels.

## Verification

- `npm run check`: lint, eight test files / 25 tests, production build passed.
- Browser against the existing public API: 2024 overview/calendar, British GP results, qualifying, lap pagination, pit stops, fastest-lap summary, driver/constructor standings, sources, practice-session empty state, missing round 11, unavailable 2026 and 1950, 2024 → 2026 → 2024 selector navigation, unknown-route page, and a deliberately aborted API request showing retry messaging. Initial loading state was observed.
- Automated accessibility audits on loaded overview, calendar, event detail, standings and sources: zero violations in dark and light themes.
- All five routes checked at 320, 390 and 1440 pixels: no document-level horizontal overflow. This is not a claim of exhaustive device or assistive-technology certification.
- RTK pagination and missing-data behavior covered by component tests. Public data remains the 2024 calendar/British GP slice; staged archive data was not exposed.

## Limitations

Dedicated profile/history/comparison pages are not implemented; their API contracts were checked separately. No deployment occurred. Existing deployed API behavior does not include the API fixes made alongside this client change. A favicon request returned 404 during browsing; no application failure was associated with it. Network failure was intentionally injected and interception was removed afterward.
