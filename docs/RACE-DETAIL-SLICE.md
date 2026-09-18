# Race detail

Route: `/events/:eventId?season=2024`. IDs are opaque and URL encoded. Overview and selected calendar rounds link to this route; calendar return links retain the event and season.

The documented event endpoint supplies summary, sessions, winner, fastest lap and feature coverage. Session endpoints are limited to results, qualifying, laps and pit-stops. Tabs and the session picker use `view` and `session` URL parameters. Invalid explicit sessions are not silently replaced. Qualifying tab selects a supplied qualifying session; other tabs return from qualifying to the race session where available.

Each dataset requests 20 rows using the documented limit. Next page stores the server cursor and snapshot in the URL, along with session/view. Direct links and reloads use the same snapshot. First page removes the cursor. Browser Back also restores earlier pages. Snapshot-expired retries clear pagination and refresh the latest event publication. Section failures do not remove the event summary. Missing datasets and event sessions are explicit empty states, with source metadata retained.

Times are formatted from integer milliseconds. Points remain exact strings. Time gaps, lap gaps and pit-lane starts are distinct. Pit-lane duration never substitutes for stationary duration. Nullable pit-lap flags stay unknown. Fastest-lap validity stays as supplied. Driver names for lap/pit rows are resolved from same-session classification entry IDs; unresolved names are stated as missing, never guessed.

The same labelled records adapt from two-column facts on mobile to denser desktop layouts. Native buttons and shared keyboard tabs retain focus treatment; all colors, spacing and fonts use Apex tokens. Source coverage and freshness appear before each dataset. Retrieval timestamp, attribution and source warnings remain in the shared provenance disclosure.

Development-only `reviewState=loading|empty|error` provides labelled route-state simulations without fabricated records. Production ignores this parameter. Practice-session missing data and Bahrain's missing session archive are verified against the real API.

Scope stops at race detail. Standings and sources remain separate future routes. No API, Render or client deployment changes.
