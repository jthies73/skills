# The Deliverable, not the Subtask, is the unit of delivery

`to-tickets` has always promised "a set of **tickets**: tracer-bullet vertical slices", each sized for a single fresh context window, each declaring its **blocking edges**, each independently grabbable off a frontier. Read literally, that makes the slice the unit of delivery: one slice, one branch, one merge request, one close.

It isn't, and the reason surfaced while designing the optional board-shaped triage mapping. A **Deliverable** is the unit: one issue, one branch, one merge request, several commits. A **Subtask** is a slice *inside* it, sequenced rather than grabbable, worked on its parent's branch, and closed by `implement` as it completes.

## The trade-off

Both shapes were designed in full and the choice reversed twice, so the argument is worth recording rather than re-deriving.

**Subtask as the unit** buys fast iteration. Every slice ships on its own; a slice that would leave a half-finished state ships behind a feature flag; nothing waits on a sibling. It costs two things. The parent's board column becomes **derived state**: In Progress when any child is claimed, Review when none are left open, so every skill that touches a parent must first query its siblings. Worse, it empties the Review column. If each slice is reviewed and merged as it lands, then by the time the last one merges everything inside the parent has already been through review, and the parent arrives at Review with nothing left to look at. Review is only meaningful at the granularity that actually gets reviewed.

**Deliverable as the unit** buys a Review column that holds something and one coherent diff per human review, which is the whole point of a Review stage for a reviewer who reads diffs rather than tickets. It costs iteration speed: nothing inside a Deliverable ships until all of it does.

## Decision

The Deliverable is the unit of delivery.

- `to-tickets` produces one Deliverable with ordered Subtasks, and moves the Deliverable into the ready role as its final step.
- Where a spec turns out to be more than one shippable merge request, `to-tickets` creates **sibling Deliverables** with blocking edges between them, and the original issue becomes a container that leaves the board. Blocking edges exist between Deliverables only; within a Deliverable, sequence is the edge.
- `implement` claims the Deliverable, works its Subtasks in order across as many context windows as it takes, and closes each Subtask as it finishes.
- `land-the-work` opens one merge request referencing the Deliverable, never a Subtask.

## The assumption this rests on

**A run of Subtasks inside one Deliverable lands within about two days.** That is what makes the lost iteration speed affordable: work is not sitting unshipped for long, so shipping the whole Deliverable at once is close enough to shipping each slice.

If that stops holding, whether because Deliverables are being cut too large or because a single Subtask routinely takes days, the cost side of the trade-off changes and Subtask-as-unit becomes the better shape again. Reopen this ADR rather than working around it: the derived-state and empty-Review costs above are the price, and they are payable.

Feature flags are kept in `to-tickets`' slice rules for the eventuality, since a Subtask that cannot ship on its own is a signal about how the work was cut, and that is decided when the work is cut rather than when it is built.

## Invariants this creates

- One Deliverable, one branch, one merge request, one `Closes` reference.
- A Subtask never carries a board column label, and never appears on a board.
- `to-tickets`' blocking-edge machinery (native GitLab blocking links, GitHub issue dependencies, the frontier query, the expand-contract sequence for wide refactors) applies between Deliverables and nowhere else.
- Skills discovering work must exclude issues that have a parent, or every Subtask in the repo reads as untriaged.
