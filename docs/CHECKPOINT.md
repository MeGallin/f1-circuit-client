# Foundation and components review

Local preview: http://127.0.0.1:5173/design. Run `npm ci` then `npm run dev` to restart. Do not deploy this checkpoint.

Complete: React JavaScript foundation, Redux store shell, self-hosted approved fonts, Apex token layer, dark/light/system preference, responsive navigation, buttons/links, panels, inputs/selects, keyboard tabs, table overflow region, pagination, loading/empty/error states and provenance component. The specimen labels all content as demonstration material, not race data.

Review: hierarchy, charcoal/red palette, type pairing, narrow-screen controls and both themes. Use the three specimen tabs to inspect controls, data states and responsive table. The accessibility button performs an in-browser WCAG A/AA audit; this supplements manual inspection.

Next: RTK Query API integration and season overview, then calendar, race/session analysis, standings and source views. Navigation currently leads to an explicit foundation checkpoint rather than simulated feature screens. The public API is already configured in `.env.example`; do not put secrets in client configuration. Real data is not connected in this checkpoint.

Production domain remains https://f1.livenotice.co.uk. No deployment was performed.

## Next checkpoint completed

The real season overview now runs at http://127.0.0.1:5173/. See SEASON-SLICE.md for API behaviour and scope. Dedicated route groups remain next; the original component specimen is still at /design.
