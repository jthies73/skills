---
"mattpocock-skills": patch
---

`triage`, `wayfinder`, and `implement` now apply a terminal label at the moment they close an issue, instead of leaving it to a general labelling rule stated earlier in each skill. `triage` names `wontfix` inside each of the three sub-bullets that close an issue (already implemented, rejected bug, rejected enhancement). `wayfinder` applies `wontfix` when ruling a Decision ticket out of scope, and `Done` when resolving one. `implement` applies `Done` when it closes a completed Subtask.

This is the first half of the terminal-label invariant (see [ADR-0004](../.agents/adr/0004-terminal-labels-on-close.md)): a closed Issue should carry exactly one terminal label, `Done` or `wontfix`, and no workflow label. A scheduled reconciliation sweep, landing separately, enforces the invariant across the rest of the tracker's history; this change is what stops the skills producing new unclassifiable closes for it to report.
