---
name: implement
description: "Implement a piece of work based on a spec or set of tickets."
disable-model-invocation: true
---

Implement the work described by the user in the spec or tickets.

## Claiming

**Pick the Deliverable.** If the user named one, use it. If they named none, take the oldest open, unassigned **Deliverable** in the `ready-for-agent` role, and never one in `ready-for-human` unprompted, since that role means the work needs judgment, external access, or manual testing a person has to supply.

**Refuse unrefined work, whoever asked.** A Deliverable in `needs-triage`, or one in a ready role whose body is empty, a placeholder, or has no acceptance criteria, is not implementable. Say so, say which of the two it is, and recommend `/triage` by name. Then stop without building. Naming a ticket is a human deciding *which* work, not a human deciding it's ready: an agent that builds out of the backlog makes the tracker lie about what state the work is in, and thirty seconds of `/triage` is a better override than a flag.

**Then claim it, as your first write.** Only where the triage-labels config names an **in-progress role**; where it doesn't, skip this paragraph and build, since there is no state to move the work into. Self-assign, and move it to the in-progress role. Apply every label that role maps to and remove the ones belonging to the role it's leaving. Where the Deliverable is already in-progress and assigned to you, this is a no-op: you're picking up a later Subtask in a fresh context window.

## Building

A Deliverable's **Subtasks** are ordered, not independently grabbable. Work them in order, on the Deliverable's branch, one per context window where they're big enough to want one. Everything lands as commits on that one branch, and `land-the-work` opens one merge request at the end.

Use /tdd where possible, at pre-agreed seams.

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

**Close each Subtask as you finish it**, where the tracker holds them as real issues. Closing a Deliverable does not close its children on any host, and the Deliverable's child list is the only readable progress signal a human has while the work is in flight.

**Stop at a Subtask that needs a human.** Where a Subtask carries the `ready-for-human` readiness label, or turns out to need a credential, a dashboard, or a judgment call you can't make, don't guess and don't skip ahead. Comment on it saying what's needed, and recommend `/wizard`, which exists for exactly the steps only a person can take. Leave the Deliverable in the in-progress role: the branch exists and you hold it, so it is in progress. Move it to `needs-info` only where the block is genuinely external.

Once done, call the Skill tool with "code-review" to review the work, then stop. Landing the work is `land-the-work`'s job, and it is deliberately a separate decision: the diff stays uncommitted in the working tree until a human says otherwise.
