---
"mattpocock-skills": patch
---

Land each Subtask as it finishes, behind a draft request, and fix Deliverables never closing on merge.

`land-the-work` now runs **once per Subtask** rather than once per Deliverable. It stays the only thing that commits, so the review-before-commit gate survives and fires per slice, and it asks before anything leaves the machine on every run. The first Subtask opens the merge request as a **draft**, titled from the Deliverable rather than from that first commit; middle Subtasks push a commit onto the branch and request that already exist; the last one marks the draft ready, which is now when the Deliverable moves to the in-review role instead of when the request opens. Commit footers reference the Subtask they landed (`Refs #<subtask>`), and the request description carries the single closing reference to the Deliverable. Because five runs expose the old "branch now" fallback five times, step 2 is now an explicit guard: a run that reaches for `git checkout -b` has gone wrong, and it looks for the Deliverable's existing branch first.

`implement` pushes the branch as soon as the worktree exists, so the branch is on the host from the moment the card enters In Progress, and it hands off to `land-the-work` per Subtask rather than leaving everything uncommitted until the end.

Separately, `land-the-work` no longer reads ticket conventions out of the git log. A `(#42)` on a subject is the number of the pull request the host squashed, not a reference to a ticket, so a log full of them looked like a settled convention while containing no ticket references at all, and requests shipped with no `Closes` line while Deliverables survived their own merge. The tracker config is now the only source for that decision, steps 4 and 5 point at **Referencing the work** by name rather than at what step 1 found, a repo PR template no longer excuses the reference, an unticketed change says so in place of the line, and the skill reads the request description back after writing it to confirm the line landed.
