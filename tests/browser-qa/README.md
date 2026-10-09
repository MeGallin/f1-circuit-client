# Isolated browser QA

Reusable test infrastructure, retained after the completed8 October review and
excluded from production. [Current checks/archive/browser boundaries](../../docs/SENIOR-REVIEW-2026-10-08.md)
record460/44 client plus12 focused/2files,163 API/Newman114/192; this documentation
update reruns none of them and does not restart the stopped5175 server.

Start from the client repository:

`npx vite --config tests/browser-qa/vite.config.js`

Open `http://127.0.0.1:5175/?season=2025`. This separate entry imports the actual
application and shared styles. Production `index.html` does not import it.
Overview's GET transport is synthetic and deterministic, shared with the Vitest
recovery test; other routes use the configured API GET proxy. Browser transport
and server middleware both reject non-GET requests. No imports/source checks are
performed. Current configured proxy verified local `127.0.0.1:3001`.

1. Keep responses held. Known Season selection remains enabled while the summary
   is pending. After eight seconds, Retry load appears with announced feedback.
2. Repeated Retry load checks the existing RTK request, not a concurrent restart.
   Counts/maximum active per season remain one. The ordinary 75-second request
   timeout still applies. You may select another known season while waiting;
   each argument has its own query, and old-argument data is not displayed.
3. Release failure (503): the selected season's error has Try again. Select Hold
   future responses, then Try again. Its count increases once; maximum active
   per season remains one. Release success replaces loading with the explicit
   synthetic No race data imported state, not invented race results.
4. Restart controlled Overview reloads the document/reset transport and counters.

For enlarged-text geometry, open the actual published Race URL on port5175,
preserving season/session/view, or `/standings?season=2026&qaText=200`. Toggle
200% root-font test style (also available via `qaText=200` on this entry only).
**Collapse Isolated QA controls before measurements.** This is a root-font test
stylesheet, not native browser zoom or a claim of WCAG conformance. Measure actual
viewport/document widths, control clipping/reflow and sticky identity against
points/status/evidence at320 and390. Close controls before keyboard table proof.
The named shared Apex identity cap is40vw; at320/200% it is128px rather than280px.
That arithmetic/stylesheet contract is not browser proof; actual measurements
remain required.

The fixture transport is exercised by `tests/audit-load-recovery.test.jsx`;
production API timeouts/hardening and page tests remain separate. All fixture
content is labelled synthetic. No production QA route or flag was added.

8 October handoff: parent browser gates completed; the isolated5175 process was
stopped, leaving5173/3001 running. Fixture files remain for repeatable checks.
