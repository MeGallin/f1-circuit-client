# Ask senior review — 5 November 2026

See the [cross-repository findings and evidence](../../api/docs/SENIOR-REVIEW-2026-11-05.md).
Local changes remain uncommitted/undeployed. Existing dirty CHECKPOINT and13 October
review documents are preserved.

Confirmed client fix: Clear/replacement/unmount aborts a pending Ask fetch; Clear
restores focus to the empty question textarea. Original wording, optional year and
canonical slot context survive retries. A late cleared response cannot replace a
new request. Captured abort regression failed first; final13 focused tests pass.
The first late-response test trial omitted required meta and was corrected; its
failure is not attributed to production code.

Fresh full gate passed lint, 725 tests/65 files with maxWorkers2 (553.42s),
49 constructor/30 flag asset checks and production build (19.49s), exit0. Source
hashes remained unchanged through the build. Existing scrollTo/chunk warnings and
a RacePodium duplicate-key warning in an unrelated fixture remain. No duplicate
full run or application rerun solely for documentation.

Parent explicitly accepted final Clear/retry/choices and the retained Apex layout:
desktop1368/client1355, CSS390/client376 Light/Dark and CSS320/client306 Light/Dark;
no observed clipping/overflow, correct pending Clear/new-request ownership,
keyboard focus, canonical choices and native details. Normal viewport, System
appearance and Viewer local restored. External `browser/acceptance.json` and
`browser/final-desktop.png` record acceptance; the full matrix/screenshots are in
the linked report. Optional-year transport retry is fixture-only, not forced live.
No CSS, layout, token, asset or dialog change was introduced.

No assigned gate remains. Source remains local/uncommitted/undeployed; historical
and the new interim generic loading-error causes remain unproven. A successful
frozen retry does not establish a watcher-restart cause or a causal repair.
