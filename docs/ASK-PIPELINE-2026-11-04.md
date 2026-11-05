# Ask client checkpoint — 4 November 2026

Subsequent review/fixes and current verification are recorded in the
[5 November review](SENIOR-REVIEW-2026-11-05.md). The results and acceptance below
remain dated4 November evidence.

Local implementation, uncommitted/undeployed; explicit parent visual acceptance complete.
The existing dirty CHECKPOINT.md and SENIOR-REVIEW-2026-10-13.md are preserved.

The existing Questions/ArchiveQuestionResult composition is the approved reference.
The parent inspected its rendered baseline; source reuse remains Button, Panel,
StatusBadge, existing disclosures, and `questions.css` Apex type/space/color tokens.
There are no new styles, tokens, components, icons, dialogs or redesign.

Questions explicitly state that they are independent. Canonical clarification
choices retry the original submitted text and forward validated optional
`context.entitySelections`, including comparison/construction slots. They no longer
append a button label to the question. The synchronized optional contract extension
preserves existing request/response shapes. The URL's season is not a career filter.

Tests-first client regression failed on the missing stateless notice before the
behavior change. The updated integration regression preserves original wording and
second-slot selections; API tests validate both request and choice-response schemas
and reject unknown selection fields. Full client verification passed: lint,
721 tests/65 files with two workers, 49 constructor assets/30 flags and production
build (exit0). The initial unbounded run was aborted for resource pressure; it is
not counted as a passing run. Existing scrollTo and large-chunk warnings remain.
After this full gate, the parent authorized one labels-dictionary-only correction
in ArchiveQuestionResult. Its readability regression failed first; **10 affected
question tests**, lint, asset checks and build37.51s passed afterward. The parent
explicitly requested no repeat of the full721 suite for this narrow follow-up.
Final source/contract hashes are recorded after the correction. No CSS/layout changed.

Accepted parent matrix: **17 distinct question texts / 18 final checks**, real-model
event/driver/circuit/history/leaderboard and
comparison paraphrases with independent archive oracles; genuine zero, partial,
unavailable, unsupported and ambiguity choices; desktop and actual CSS390/320,
Light/Dark; evidence disclosure, choice/clear keyboard interaction, focus and
wrapping/clipping. Actual desktop1097/client1084, CSS390/client376Dark and
CSS320/client306Light plus preceding paired Light/Dark views were accepted, with
no observed root or field clipping. Enter choices/details/evidence and Clear flows
passed. No new modal exists. Normal viewport, System appearance and Viewer local
were restored; the final tab shows Max19 with disclosures closed. This is selected
evidence, not exhaustive accessibility or language coverage.

External verdict: F1/audit-2026-11-04/browser-evidence/browser-acceptance.json;
all attempts: accepted-question-runs.json; final screenshot:
browser-evidence/final-desktop-max-2023.png. Interim generic transport errors have
unproven cause; successful final frozen retries do not establish a causal repair.

Backend architecture, period/metric/finality semantics, observed runtime evidence,
index lifecycle amendment, benchmark limits and external proof paths are recorded
in [the API checkpoint](../../api/docs/ASK-PIPELINE-2026-11-04.md).
