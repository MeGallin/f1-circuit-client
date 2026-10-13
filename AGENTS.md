# Client implementation guidance

## Mandatory visual-consistency completion gate

Every UI-affecting assignment must pass the gate in
[docs/UI-CONSISTENCY.md](docs/UI-CONSISTENCY.md), without another user reminder.
Inspect an approved rendered reference/source before coding and identify reused
components/tokens. Match the complete pattern, not only its shell or colours.
Tests and visual acceptance are separate: review affected desktop, actual CSS390/320,
Light/Dark and relevant states; correct and recheck after the final visual edit.
The parent currently owns browser review and must explicitly accept it before
either agent says finished. Record external screenshots, actual checks and remaining
deviations; otherwise report verification pending. Non-UI work needs a specific N/A
reason, not invented browser evidence.

Read parent `../AGENTS.md`, shared `../memory.md`, current checkpoint/QA and
[the binding Apex consistency contract](docs/UI-CONSISTENCY.md) before UI changes.
Use canonical identities, shared controls/padded bodies and semantic context
variants; preserve approved Home and historical/source/publication ownership.
Run meaningful fail-first regressions and proportionate checks; browser bounds
are separate from jsdom contracts. Preserve unrelated dirty changes. Evidence
logs/images belong in the external audit archive, not application source/docs.
No commit/push/deploy/provider imports/live mutations without explicit authority.
