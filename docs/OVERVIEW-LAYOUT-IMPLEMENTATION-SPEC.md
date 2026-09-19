# Approved overview layout implementation specification

**Status:** Approved for development

**Design reference:** `/design/overview-layouts`

**Approved layout:** `Put the season around the race`

**Audience:** Frontend development team

## 1. Purpose and implementation rule

This document is the implementation handoff for the approved overview layout. The composition shown by the mock-up is locked. The development task is to connect this composition to the existing API and reusable client components, not to rearrange the information architecture or redesign the page.

The implementation must preserve:

- the order of the bands;
- the desktop two-column relationship between the latest race and championship snapshot;
- the single reading surface containing the bands, rather than separate floating cards;
- the Apex design tokens, typography, spacing, borders, indicators and responsive behavior;
- the existing interaction patterns for race detail, calendar navigation, season markers and standings;
- JavaScript, React, Redux Toolkit and RTK Query. Do not introduce TypeScript or a component library.

If a new style is required, add a semantic token or a reusable design-system pattern. Do not add one-off visual values or generic utility classes to solve an individual screen problem.

## 2. User and page intent

The page is for an engaged F1 follower who wants the current season understood quickly:

1. What is the next race?
2. What happened in the latest completed race, including the podium?
3. Where does the championship stand?
4. How far through the calendar are we?
5. What was the previous event?

The page should read as one compact editorial brief. The next event is a quiet prompt at the top. The latest completed race and championship are the main reading area. Season progress provides navigation and context. The previous event closes the sequence.

## 3. Locked page structure

The page has two layers:

- **Overview introduction:** `OVERVIEW LAYOUT STUDY`, the title `Put the season around the race`, and the short explanatory paragraph used by the route-level page heading.
- **Overview surface:** one bordered Apex surface containing the following bands in this exact order:

| Order | Band | Desktop placement | Mobile placement |
|---:|---|---|---|
| 1 | Freshness line | Full width | Full width |
| 2 | Next event | Full width | Full width |
| 3 | Latest completed race | Left column | Full width |
| 4 | Championship snapshot | Right column | Full width, after race |
| 5 | Season progress | Full width | Full width |
| 6 | Previous event | Full width | Full width |
| 7 | Provenance line | Full width | Full width |

The surface uses a two-column grid at 900px and above:

```css
grid-template-columns: minmax(0, 1.3fr) minmax(22rem, 1fr);
grid-template-areas:
  "freshness freshness"
  "next next"
  "race standings"
  "progress progress"
  "previous previous"
  "provenance provenance";
```

At widths below 900px, use one column in the same reading order. Do not allow the championship panel to sit beside the latest race on narrow screens.

The surface is a single `canvas`-colored reading area with a 1px subtle line border and the existing 3px radius. Bands are divided by 1px design-system lines. Do not turn each band into an independent rounded card.

## 4. Band specifications

### 4.1 Freshness line

Display the current publication boundary at the top of the surface:

```text
Results through {latestCompletedEvent.name} · {latestCompletedEvent.schedule.date}
```

Use the API publication snapshot and UTC date. Do not invent a date or infer freshness from the browser clock. The line is compact IBM Plex Mono metadata in muted text with horizontal panel padding.

### 4.2 Next event

The next event is a full-width, quiet band immediately below freshness. Its exact information order is:

```text
NEXT EVENT
{round}   {event name}
         {circuit name}
         Countdown to race start · {remaining time}

{race date}                                      {status}
                                                [Explore the calendar →]
```

The current approved example is:

```text
NEXT EVENT
15       Azerbaijan Grand Prix
         Baku City Circuit
         Countdown to race start · 06 days 19 hours

26 Sept 2026                                      SCHEDULED
                                                Explore the calendar →
```

Requirements:

- The event round is a large Barlow Condensed value.
- The event name aligns with the top of the round number, not the baseline.
- The circuit sits below the event name in muted text.
- The countdown is a separate line below the circuit.
- Use the existing `RaceCountdown` component with the API race-start timestamp and its UTC handling. The countdown target is race start, not the beginning of the event weekend.
- Use the existing action-link treatment for `Explore the calendar`.
- If the schedule does not contain a precise race-start time, show the existing unavailable countdown state. Do not estimate a time.

### 4.3 Latest completed race

This is the primary content block on the left at desktop widths. It must answer “what happened?” without requiring a page change.

Top line:

```text
LATEST COMPLETED RACE                         [checkered flag] completed
```

Use the reusable `RaceStatus` component. The checkered flag is a small icon at the same visual scale as the status text and appears only for a completed status.

Race identity:

```text
ROUND {round} OF {event count}
{Grand Prix name}
CIRCUIT
{Circuit name}
```

Use the reusable `CircuitName` component so the `CIRCUIT` label and circuit value maintain the approved hierarchy. The Grand Prix name uses the large race-display treatment and may wrap naturally.

Track visual:

- Reserve the right side of the race identity on desktop and place the reusable `CircuitSilhouette`/track visual there when an asset is available.
- Do not add a decorative country flag in this area.
- Do not introduce a new card, background panel or visual treatment around the circuit image. The track visual is part of the race identity, not a separate content card.
- If no source asset is available, use the existing accessible fallback wording `Track layout not supplied`. Do not fabricate a circuit image.

Race result preview:

Place a `RACE RESULT` / `Top three` subsection below the race identity. Display exactly the top three classified finishers in a podium arrangement:

- winner in the center and highest block;
- second place on the left and lower than the winner;
- third place on the right and slightly lower than second;
- driver name above their podium block;
- API-backed driver number beside the driver name;
- constructor below the driver name;
- finishing position inside the podium block;
- points below the finishing position.

Use the reusable `DriverNumber` component. The number must be displayed without a hash prefix and with the lightest subtle border (`--apex-color-line`). The component must retain an accessible `Driver number {number}` label.

Approved podium proportions:

| Place | Block minimum height | Position number treatment |
|---:|---:|---|
| 1 | `7rem` | Largest; responsive display size |
| 2 | `4rem` | Approximately two-thirds of first |
| 3 | `3.25rem` | Approximately one-third of first |

The podium must retain its stepped silhouette at desktop widths. On narrow screens it must remain legible without horizontal overflow; do not reduce driver names below the existing caption role or allow the position number to leave its block.

Bottom actions:

- `Open race detail` uses the existing action treatment.
- The event date is placed on the opposite side with a calendar icon and UTC-normalized display value.

### 4.4 Championship snapshot

This is the right-hand desktop block aligned with the latest completed race. It is not an archive or import-status panel. Its purpose is to give the user the current championship order.

Header:

```text
CHAMPIONSHIP
Championship snapshot                         Drivers / Constructors
```

The production view must preserve the existing driver/constructor control behavior while retaining this visual position.

Driver view:

- Display the leading ten entries.
- Use a two-column list at desktop widths.
- Each row contains rank, driver number plus name, constructor and points.
- Use `DriverNumber` for every supplied driver number.
- The number is plain text with no `#` and a subtle `--apex-color-line` border.
- Preserve the staggered grid impression: even rows use the approved small vertical offset on desktop.
- At widths below 600px, collapse to one column and remove the stagger. This is required for readable sequential scanning.
- Long names and constructor names truncate safely rather than causing layout overflow.

Footer:

```text
Leading entries after {latest completed event}.
Open full standings →
```

Use live standings data from the API/store. Do not hardcode the example names, numbers, points or constructors in the production route.

### 4.5 Season progress

This band spans the full surface below the main race/championship row. It explains the season position and provides event navigation.

Header:

```text
SEASON PROGRESS
14 of 23 events                         Results through Spanish Grand Prix
```

The large `14` is the completed/results count. `of 23 events` is the supporting label. Do not use `Results available` as the label.

Event strip:

- Render one horizontal segment per calendar event.
- Completed segments use `--apex-color-accent`.
- Upcoming segments use `--apex-color-line`.
- Each segment uses the existing 3px active-indicator height and the approved small gap.
- The legend indicators must be the same horizontal line/dash shape and height as the event segments. Do not replace them with circular dots.

Legend and guidance:

```text
[red line] Completed    [muted line] Upcoming    Tap or click a marker to inspect that round.
```

Use the existing `SeasonEventStrip` for the production interactive implementation. The marker must be a real button with an accessible round/event label, not an `aria-hidden` decorative element. Selecting a marker opens the existing in-page event dialog and must not navigate away from the overview.

The guidance text must remain visible, concise and aligned with the legend on larger screens. At widths below 600px it becomes a full-width line below the two legend items.

### 4.6 Previous event

Use the same visual grammar as the next-event band so the page feels intentional:

```text
PREVIOUS EVENT
13       Italian Grand Prix
         Autodromo Nazionale di Monza

06 Sept 2026                                      COMPLETED
```

The event name must align with the top of the round number. Use `RaceStatus` so completed events receive the checkered flag. Do not add a countdown or calendar action to the previous event.

### 4.7 Provenance line

Keep the provenance line at the bottom of the surface as compact metadata:

```text
source only   partial coverage   Checked {UTC timestamp}   About the data
```

This is supporting trust information, not a primary page panel. It must never displace the race result or championship content above it.

## 5. Reusable component contract

Use existing components wherever the behavior or visual pattern already exists:

| Component | Required use |
|---|---|
| `RaceStatus` | Completed/scheduled status labels; adds the small checkered flag only for completed status |
| `CircuitName` | Circuit label plus circuit value hierarchy |
| `DriverNumber` | Driver number beside every driver name; no hash; subtle line border; accessible label |
| `CircuitSilhouette` | Track layout asset, applicability, attribution and safe fallback |
| `RaceCountdown` | Countdown to race start with unavailable/elapsed states |
| `SeasonEventStrip` | Interactive season markers, keyboard access and event selection |
| `EventInsightDialog` | In-page selected-round details and top-three result preview |
| Existing action-link/button primitives | Calendar, race-detail and standings actions |

Add a new shared component only when the same behavior is needed in at least two places. Prefer props and variants over duplicate markup. Do not create a second driver-number, status, circuit, countdown or event-marker implementation for this page.

The approved mock-up contains route-level composition helpers such as `MockupNextEvent`, `MockupRaceHero`, `MockupStandings` and `MockupEventStrip`. These are design reference boundaries. Production components may use the existing feature components, but must preserve the same responsibilities and resulting DOM hierarchy.

## 6. Data and state requirements

All displayed facts must come from the normalized API/store:

- selected season summary;
- latest completed event;
- next and previous event;
- event count and completed-results count;
- race start timestamp and time precision;
- circuit identity and layout evidence;
- podium results, driver numbers, constructors and points;
- championship standings and driver numbers;
- freshness and provenance metadata.

The mock-up values are visual examples only. Production must not copy its static 2026 values into the live route. Unknown, missing, partial and unavailable source states must remain explicit and use existing status/fallback patterns.

Use the existing Redux/RTK Query cache and selectors. Theme changes must not refetch the data. Selecting a season must update all bands from the same season-scoped snapshot so the freshness line, event progress, latest race, previous/next events and standings cannot describe different datasets.

## 7. Visual system contract

Use the generated Apex tokens from `src/design-system/apex.tokens.css` and the source JSON in `src/design-system/apex.tokens.json`. Do not hardcode replacement values in page CSS.

### Typography

- Display: `Barlow Condensed` for race names, large numbers and podium positions.
- Body: `IBM Plex Sans` for readable labels, names and supporting copy.
- Numeric/metadata: `IBM Plex Mono` for eyebrows, dates, round labels, statuses, points and progress metadata.
- Default body size: `--apex-type-body-size` (14px).
- Caption: `--apex-type-caption-size` (12px).
- Eyebrow: `--apex-type-eyebrow-size` (10px) with `--apex-type-eyebrow-tracking`.
- Points: `--apex-type-points-size` (18px).
- Do not introduce a second font family or ad-hoc font weights.

### Color and shape

- Default dark canvas: `--apex-color-canvas`.
- Surface: `--apex-color-surface`.
- Elevated podium blocks: `--apex-color-elevated`.
- Primary text: `--apex-color-text`.
- Supporting text: `--apex-color-muted`.
- Subtle borders and event lines: `--apex-color-line`.
- Accent and completed segments: `--apex-color-accent`.
- Accent text: `--apex-color-accent-text`.
- Controls/actions: existing `--apex-color-control-border` and action tokens.
- Standard border: `--apex-shape-border` (1px).
- Active indicator: `--apex-shape-active-indicator` (3px).
- Radius: `--apex-shape-radius` (3px).

The driver-number border is intentionally the lighter `--apex-color-line`, not the stronger control border. The podium blocks retain their subtle border and use the accent only for the winner's top indicator.

### Spacing

Use token spacing only. The approved composition uses the existing `--apex-space-*` scale, with the principal desktop band padding at `--apex-space-7`, frame padding at `--apex-space-8`, and mobile band padding at `--apex-space-6`.

## 8. Responsive and accessibility acceptance

The implementation is accepted only when all of the following are true:

- At 900px and above, the latest race and championship are side by side with the latest race on the left.
- Below 900px, all bands follow the locked single-column order.
- Below 600px, standings become one column, the standings stagger is removed, progress guidance becomes full width, and adjacent-event date/action rows do not overflow.
- The page has no horizontal scroll at 360px wide.
- All action targets remain at least `--apex-size-target` where they are interactive.
- Event markers are keyboard reachable buttons with useful accessible names.
- The selected event is exposed with `aria-current` or equivalent state.
- The event dialog traps focus, supports Escape, and returns focus to the selected marker.
- Status icons are decorative when the adjacent text communicates the status.
- Driver numbers have an accessible label and remain readable in both dark and light themes.
- Color is not the only signal for completed versus upcoming; the legend text remains present.
- Reduced-motion preferences are respected through the existing motion tokens.
- Missing circuit assets, missing race-start precision and partial provider coverage have explicit fallback states.

## 9. Out of scope for this handoff

Do not use this implementation task to:

- change the approved section order or introduce a new dashboard layout;
- add visitor analytics, cookies or personal-data collection;
- add an AI-generated factual layer;
- change the API schema or provider reconciliation rules;
- add a country flag to the race identity block;
- add decorative motion, gradients, shadows or a prebuilt UI library;
- replace the database-backed data flow with hardcoded mock data;
- deploy the client.

## 10. Definition of done

The overview implementation is complete when:

1. The live overview renders the locked bands in the exact order and grid relationship specified here.
2. All facts are sourced from the API/store and remain season-consistent.
3. Existing reusable components are used for statuses, driver numbers, circuit identity, track visuals, countdown and event markers.
4. The driver number presentation has no hash and uses the subtle line border.
5. Completed statuses show the small checkered flag, while the season-progress legend uses red horizontal line indicators.
6. The podium hierarchy, number placement and stepped block heights match the approved design.
7. Desktop, tablet and 360px mobile layouts pass visual and interaction review.
8. Missing and partial data states remain explicit and do not produce invented content.
9. `npm run check` passes, including lint, tests and production build.
10. A browser review confirms parity with `/design/overview-layouts` before deployment is considered.
