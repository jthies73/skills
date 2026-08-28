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

## Taking the branch

One Deliverable, one branch, one worktree. Take both before you build, as the first thing after the claim.

**Name the branch `type/slug`**, in [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) shape, `type` from `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `build`, `ci`, `style`, and `type/ticket-slug` where the Deliverable has a number (`feat/42-notification-preferences`). Check `CONTRIBUTING.md`, `AGENTS.md`, and `CLAUDE.md` for a documented branch shape and follow that instead where one exists. The commit shape is `land-the-work`'s business, not yours.

**Branch from the default branch**, fetched first so the base isn't behind its remote. Branch from another feature branch only where this work builds on commits that live nowhere else, and say which base you picked either way.

**Build in a worktree of its own, never in the checkout you were invoked from.** `git worktree add ../<repo>-<slug> -b <branch>`, then work there for the rest of the run. A dirty checkout doesn't block it: a worktree gets its own working tree and its own index, which is what lets several agents run at once, one per Deliverable. Install dependencies in the new directory before running anything, since a fresh worktree has no `node_modules` and the suite will fail on the wrong thing until it does. Where the harness has its own worktree command, use that and let it place the directory.

`refs/stash` is shared across worktrees, so `git stash` remains a cross-session hazard: don't reach for it.

**Publish the branch the moment it exists.** `git push -u origin <branch>` from the worktree, before the first Subtask. A branch living only in your clone is a Deliverable nobody can see being built, and the first Subtask is a whole session long. It carries no commits yet, and that's the point: the name is the claim, and `land-the-work` pushes the first commit onto a branch the host already knows. On a reattach the upstream is already set and the push is a no-op.

**Where the branch already exists, reattach rather than create.** A later Subtask in a fresh context window is the ordinary case: `git worktree list` finds the worktree holding the Deliverable's branch, and the run continues in it. `git worktree add` refuses a branch checked out elsewhere, and that refusal is the signal to go find it, never to invent a second branch.

## Building

A Deliverable's **Subtasks** are ordered, not independently grabbable. Work them in order, in the Deliverable's worktree, one per context window where they're big enough to want one. Everything lands as commits on that one branch, one per Subtask, put there by `land-the-work` at the end of each run: it opens a single draft request on the first Subtask and marks it ready on the last.

Use /tdd where possible, at pre-agreed seams.

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

**Close each Subtask as you finish it**, where the tracker holds them as real issues. Closing a Deliverable does not close its children on any host, and the Deliverable's child list is the only readable progress signal a human has while the work is in flight. It is also how `land-the-work` tells a middle slice from the last one: no open Subtasks left means the request can leave draft.

**Stop at a Subtask that needs a human.** Where a Subtask carries the `ready-for-human` readiness label, or turns out to need a credential, a dashboard, or a judgment call you can't make, don't guess and don't skip ahead. Comment on it saying what's needed, and recommend `/wizard`, which exists for exactly the steps only a person can take. Leave the Deliverable in the in-progress role: the branch exists and you hold it, so it is in progress. Move it to `needs-info` only where the block is genuinely external.

Once done, call the Skill tool with "code-review" to review the work, then stop. Landing the slice is `land-the-work`'s job, once per Subtask, and it is deliberately a separate decision: the diff stays uncommitted in the worktree until a human runs it. Expect that before the next Subtask starts, since two uncommitted slices in one tree land as one commit nobody chose.

**Report the worktree path as you stop.** The diff is uncommitted inside it, which makes it invisible from the checkout you were invoked from: only committed work is shared between worktrees. Give the human the path, the command that reads the diff from anywhere (`git -C <path> diff`), and the fact that `land-the-work` has to run in that directory, on this slice, before the next one.
