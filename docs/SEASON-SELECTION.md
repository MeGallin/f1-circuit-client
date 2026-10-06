# Season selection correction

## Current selection/refresh review — 6 October 2026

Current-year refresh performs a bounded source check; historical refresh only reloads archive data. Season changes remount the refresh state, abort its pending request and clear its server-driven timer. A late current-year response cannot add feedback or reload a newly selected historical season. Refresh invalidates the catalogue and selected-season summary alongside calendar/standings, event and session caches. The overview uses only the selected summary publication for dependent calendar/detail queries.

Local history confirms client `fb7cbd0` and API `734a4ed`; both pushes are user-confirmed. Recorded checks passed 141 client tests with lint/build and 133 API tests with lint/format/contract checks, Newman 114 requests / 192 assertions. Deployment and production/live smoke are **PENDING**; Actions secrets/dispatch and real PostgreSQL multi-process locking remain unverified. See [current evidence](FUNCTIONALITY-VALIDATION.md) and [season behavior](SEASON-SLICE.md). The provider-index and dataset statements in the earlier correction below are September observations, not newly verified coverage.

## Historical correction — September 2026

The catalogue now comes from all pages of the API seasons collection, pinned to the first publication snapshot. No frontend year range is generated. Options are newest first, with per-season coverage labels.

Overview, calendar and standings default dynamically to the runtime UTC calendar year, and write that selection into the URL using replace navigation. An explicit historical selection stays selected across refresh and browser history. Changing season clears dependent event/round/pagination state. Main navigation retains the selected season; home branding also retains it.

If the runtime year is absent from the backend catalogue, one clearly labelled current-year unavailable choice is shown as UI state, not as a provider record. No dependent data is requested under a substituted year. A separate explicit link offers the newest season with imported calendar data. If the provider lists the year but event data is unimported, the overview states that directly; calendar and standings return explicit empty/unavailable responses.

Race detail is identified by its canonical event ID. A deep link without a season is canonicalized to the event's actual year. A contradictory season query is blocked with an explicit mismatch message and links to the requested season or the correct event year. Historical race results never masquerade as the current season.

Backend catalogue import reported 77 years (1950 through 2026) on 18 September 2026. Only the existing 2024 British GP datasets are imported. Listing a year does not imply its calendar, results or standings have been ingested. No Render or client deployment is included.
