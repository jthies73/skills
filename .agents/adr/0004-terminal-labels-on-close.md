# Terminal labels on close, replacing the closed-means-done convention

`.agents/triage-labels.md` used to read "Done is the closed state, not a label." The stated
objection to a real `Done` label was cost: both hosts hand you a Closed list for free, so a `Done`
label would buy a column that already exists, plus a ritual to keep it honest. Under that
convention, "everything closed that is not `wontfix` is done" is not enforced anywhere; it is
assumed. Nothing verified it, and three paths broke it: a human closing an issue in the host UI
keeps whatever column label it held; `wayfinder` had no documented `wontfix` step when ruling a
Decision ticket out of scope; and `triage`'s `wontfix` sub-bullets said "close" without repeating
the label rule stated earlier in the skill. The gap ran in reverse too: a merge request carrying
`Refs #123` where `Closes #123` was meant leaves a finished Deliverable open in Review.

## Decision

Reverse the convention. An open Issue carries no terminal label. A closed Issue carries exactly
one **terminal label**, `Done` or `wontfix`, and no workflow label. `Done` becomes a real label a
closed-and-shipped Issue always carries, not an inference from the absence of `wontfix`.

The ritual the old objection warned about is what a scheduled **reconciliation sweep** removes: it
reads the tracker, strips workflow labels from closed Issues, applies `Done` where a merge closed
the Issue, and reports the cases it can't derive rather than guessing. Once a sweep keeps the label
honest for free, the cost side of the original objection no longer holds, and the benefit does:
a closed Issue says whether it shipped or was rejected without anyone opening it to reconstruct
what happened, and `Done` becomes available as a board column instead of an inference over the
host's built-in Closed list.

See [issue #13](https://github.com/jthies73/skills/issues/13) for the full spec: the `reconcile`
seam, the GitHub and GitLab adapters, and the skill changes that stop agents producing
unclassifiable closes.

## Invariants this creates

- An open Issue carries no terminal label; a closed Issue carries exactly one and no workflow
  label. The two terminal labels are mutually exclusive.
- `Done` and `wontfix` are real repository labels, named in `.agents/triage-labels.md`'s state-role
  table alongside every other role.
- A closed Issue with neither terminal label, or an open Issue with a merged closing request behind
  it, is a defect the sweep reports rather than silently accepts.
