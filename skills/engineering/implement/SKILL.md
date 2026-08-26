---
name: implement
description: "Implement a piece of work based on a spec or set of tickets."
disable-model-invocation: true
---

Implement the work described by the user in the spec or tickets.

## Claiming

Only where the triage-labels config names an **in-progress role**; skip this section where it doesn't.

Pick the ticket. If the user named one, use it, whatever role it's in: naming it is a human deciding. If they named none, take the oldest open, unassigned issue in the `ready-for-agent` role, and never one in `ready-for-human` unprompted, since that role means the work needs judgment, external access, or manual testing a person has to supply.

Then claim it, as your first write: self-assign, and move it to the in-progress role. Where the ticket has no actionable body (no acceptance criteria, empty, or a placeholder), return it to `needs-triage` with a comment saying why instead, and stop without building.

## Building

Use /tdd where possible, at pre-agreed seams.

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

Once done, use /code-review to review the work.
