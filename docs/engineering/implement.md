## What it does

`implement` builds work that has already been decided. You point it at a **Deliverable** on the tracker, a [spec](https://www.aihero.dev/ai-coding-dictionary/spec), or the plan you just agreed in the conversation, and it writes the code, drives [tdd](https://aihero.dev/skills-tdd) at the seams, typechecks as it goes, and runs [code-review](https://aihero.dev/skills-code-review) at the end, then stops there and leaves the commit to [land-the-work](https://aihero.dev/skills-land-the-work).

It never reopens the plan. There is no interview, no clarifying round, no proposal of a different approach. Whatever was settled upstream is the input, and the skill's whole job is to turn that into working, reviewed code. That is what separates it from typing "build this" at a fresh [agent](https://www.aihero.dev/ai-coding-dictionary/agent), which will happily redesign the work while it builds it.

The one thing it will not do is build unrefined work. A Deliverable still sitting in your backlog, or one in a ready state with an empty body or no acceptance criteria, is refused with [triage](https://aihero.dev/skills-triage) recommended by name, whoever named it. Naming a ticket is you deciding *which* work, not you deciding it is ready.

## When to reach for it

You invoke this by typing `/implement` yourself: the agent won't reach for it on its own. It ships with `disable-model-invocation: true`, so no other skill can call it either. Wherever [ask-matt](https://aihero.dev/skills-ask-matt) or [to-tickets](https://aihero.dev/skills-to-tickets) says "then `/implement` per Subtask", that is an instruction to you, not something the agent will do unprompted.

Where the work currently lives decides whether this is the right skill:

| The work is… | Reach for |
| --- | --- |
| A Deliverable with Subtasks on the tracker | `/implement #42`, one Subtask per [session](https://www.aihero.dev/ai-coding-dictionary/session), [clearing](https://www.aihero.dev/ai-coding-dictionary/clearing) context between them |
| A spec, not yet split up, and the build spans sessions | [to-tickets](https://aihero.dev/skills-to-tickets) first, then `/implement` per Subtask |
| A spec, and the build is small | `/implement` directly against the spec |
| Only in the conversation you just had, and it's still small | `/implement` right there, in the same window |
| Not written down anywhere yet | [grill-with-docs](https://aihero.dev/skills-grill-with-docs), or [grill-me](https://aihero.dev/skills-grill-me) if there's no codebase |
| One concrete behaviour you want test-first, with no spec | [tdd](https://aihero.dev/skills-tdd) directly |
| Already built, and you want it checked | [code-review](https://aihero.dev/skills-code-review) directly |

The same-session case is worth naming because the skill's own first line doesn't cover it. `SKILL.md` says "the spec or tickets", which nudges the [model](https://www.aihero.dev/ai-coding-dictionary/model) to go hunting for a file that doesn't exist. If the plan lives only in the thread, say so when you invoke it.

## Prerequisites

`implement` takes the branch and the working directory itself. It creates the Deliverable's branch, named `type/slug` in Conventional Commits shape, in a [git worktree](https://git-scm.com/docs/git-worktree) of its own at `../<repo>-<slug>`, and builds there rather than in the checkout you invoked it from. The branch you were sitting on is left exactly as it was. What it still does not do is commit for you. Everything a Deliverable's Subtasks produce lands on that one branch, across as many sessions as it takes, and [land-the-work](https://aihero.dev/skills-land-the-work) opens one merge request from it at the end, run from inside that worktree.

If the Subtasks came from [to-tickets](https://aihero.dev/skills-to-tickets), the tracker they live on was configured by [setup-matt-pocock-skills](https://aihero.dev/skills-setup-matt-pocock-skills). `code-review` reads the same configuration to find the originating spec at close-out.

## What one run does

A run is seven beats, in order:

1. Claim the Deliverable: refuse it if it is unrefined, otherwise self-assign and move it to the in-progress role, as the first write.
2. Take the branch: `type/slug` from the default branch, in its own worktree, with dependencies installed. Reattach where a worktree for this Deliverable already exists.
3. Read the Subtask or spec and work out the seams.
4. Drive [tdd](https://aihero.dev/skills-tdd) at the pre-agreed seams, one red-green slice at a time.
5. Typecheck often, run single test files as it goes.
6. Run the full test suite once, at the end. Close the Subtask.
7. Run [code-review](https://aihero.dev/skills-code-review), then stop, reporting the worktree path.

One run covers one **Subtask**. The Subtasks [to-tickets](https://aihero.dev/skills-to-tickets) produces are tracer-bullet vertical slices sized to fit a single fresh [context window](https://www.aihero.dev/ai-coding-dictionary/context-window), so the intended rhythm is: clear context, implement the next Subtask, clear again. They are ordered, not independently grabbable, and they all land on the Deliverable's one branch. Claiming is idempotent, so a second run on an already-claimed Deliverable is just picking up the next Subtask.

Where a Subtask needs a person (it carries the `ready-for-human` readiness label, or turns out to need a credential, a dashboard, or a judgment call), the run stops there rather than guessing or skipping ahead, comments what is needed, and points at [wizard](https://aihero.dev/skills-wizard).

## One Deliverable, one worktree

A [worktree](https://git-scm.com/docs/git-worktree) is a second checkout of the same repository: its own working directory, its own index, its own `HEAD`, sharing one object store and one set of refs with the original. `implement` creates one per Deliverable at `../<repo>-<slug>`, takes the branch there, and does every subsequent thing in it. Nothing about the checkout you invoked it from changes, including how dirty it was.

That isolation is the whole reason it is there: it is what makes several agents at once safe, one per Deliverable. Four consequences are worth knowing before the first run.

**The diff lives in the worktree, and only there.** Committed work is shared, so `git diff main...feat/42-slug` reads it from any checkout of the repo. An uncommitted diff is not shared: it belongs to one worktree's index. `implement` deliberately leaves the work uncommitted, so the finished diff is read with `git -C ../repo-42-slug diff`, or by opening that directory in your editor. It is also why [land-the-work](https://aihero.dev/skills-land-the-work) has to run **inside** the worktree; run it in your original checkout and it finds a clean tree and nothing to land.

**A fresh worktree is missing everything gitignored.** No `node_modules`, no `.env`, no build cache. The skill installs dependencies before running anything, because otherwise the first test run fails on the wrong thing entirely. Machine-local files it cannot regenerate, credentials most of all, are yours to copy across.

**A later Subtask reattaches to the same worktree.** One Deliverable gets one branch and one directory, across as many sessions as it takes. `git worktree add` refuses a branch already checked out elsewhere, and the skill reads that refusal as "go find it", never as "make a second branch".

**`git stash` is still shared.** `refs/stash` is a ref, and refs are the one thing worktrees do not separate. A stash pushed in one session is popped by another. The skill is told not to reach for it; the same caution applies to you while parallel runs are in flight.

## Pre-agreed seams

The idea the skill runs on is the **seam**: the public boundary you observe behaviour at, without reaching inside. Tests live at seams. Working at a seam agreed before any code is written is what keeps the tests durable, because the implementation underneath can be rewritten without the tests moving.

The word "pre-agreed" is doing real work, and it is also the skill's weakest joint. Nothing inside `implement` agrees the seams. `tdd` is the skill that asks, and it refuses to write a test at an unconfirmed seam. So in practice the agreement happens either upstream in the spec, or in the first exchange of the run. If it happens nowhere, the precondition never fires and the run quietly becomes "just write the code". Naming the seams in the spec is what stops that.

## Common questions

**It finished, but my Deliverable is still open and the acceptance criteria are still unchecked.**

The Deliverable is meant to still be open. `implement` closes each **Subtask** as it finishes it, because the Deliverable's child list is the only readable progress signal while work is in flight and closing a parent closes no children on any host. The Deliverable itself closes on merge, from the closing keyword [land-the-work](https://aihero.dev/skills-land-the-work) writes.

What it still does not do is tick the `- [ ]` boxes in an issue body, or act on the findings `code-review` produced. Reconcile those yourself.

At the *start*, if your triage-labels mapping names an **in-progress role**, `implement` claims the Deliverable before it builds: it takes the oldest unassigned `ready-for-agent` one when you name none, self-assigns, and moves it into that role. Leave the role out of your mapping and it makes no state writes at all.

**Can I point it at all my Subtasks at once, or run several in parallel?**

Not at once, and inside one Deliverable that is by design: the Subtasks are ordered and share a branch, so there is nothing to parallelise. Across sibling Deliverables whose blockers are done, run as many as you like. That is what the worktree is for: each session gets its own working directory, index, and HEAD, so the failure people used to hit here (a `git commit --amend` in one session landing on another session's commit, commits arriving on the wrong branch, all in a single afternoon across three issues) has nothing left to collide over. Open a session per Deliverable and invoke `/implement` in each.

Two things worktrees do not fix. `refs/stash` is shared across all of them, so `git stash` is still a cross-session hazard; the skill is told not to reach for it, and neither should you. And batch dispatch across a ticket queue, one invocation that burns down five Subtasks, still does not exist: dispatch is one `/implement` per session, by you.

**Why doesn't it commit or open a pull request for me?**

It used to commit straight to the current branch at the end of a run, which several people found too eager: the code landed before they had a chance to verify it worked. It now stops after `code-review` instead, leaving the diff sitting uncommitted in the worktree it built in. [land-the-work](https://aihero.dev/skills-land-the-work) is the step after it, and it is the one that commits and offers to push and open the request. It is model-invoked, so the agent will often reach for it once the work is finished; run it by hand in a fresh window when you want the split to be deliberate, and run it **in the worktree**, since an uncommitted diff is invisible from anywhere else.

**`code-review` says it cannot see my changes.**

`code-review` reviews `git diff <fixed-point>...HEAD`, which excludes staged and working-tree changes. `implement` runs it against your uncommitted working tree, so unless an interim commit already exists there is nothing in that diff to review. Multiple people have reported this and it is unfixed on both sides. Commit first, then review against the point you branched from.

Separately, some people deliberately do not want the review inside the run at all, because an agent reviewing the code it just wrote is biased toward its own solution. Running [code-review](https://aihero.dev/skills-code-review) in a fresh session against a fixed point is a legitimate alternative, and is the same reason that skill runs its two axes in separate sub-agents.

**One Subtask burned 150k tokens. Am I using it wrong?**

Probably the Subtask is too big rather than the skill being misused. A run does codebase exploration, a red-green loop per seam, a full suite, and a review, so a non-trivial slice exceeding 100k [tokens](https://www.aihero.dev/ai-coding-dictionary/token) is normal rather than a sign something broke. The lever is upstream: right-size the Subtasks in [to-tickets](https://aihero.dev/skills-to-tickets) so each fits one fresh window. If one keeps blowing out, split it rather than raising the [effort](https://www.aihero.dev/ai-coding-dictionary/effort) level.

**`/implement #2` in a fresh session worked on something completely unrelated.**

`#2` is resolved against whatever numbered list the agent can see, which in a fresh session may be a todo file, a checklist, or another work list rather than the configured tracker. The resolution is confident rather than fail-closed, so the mistake is not obvious until it has started. Pass the full reference, the issue URL or `owner/repo#2`, and ask it to confirm the title back before it begins.

## It's working if

- The session opens by reading the Subtask or spec and restating what it will build, rather than asking you what to build.
- An unrefined Deliverable gets refused with `/triage` named, instead of built.
- The first tracker write is the claim: self-assigned, moved into the in-progress role.
- A worktree appears next to your repo, named for the Deliverable, and the branch you were on when you invoked it is untouched.
- A second session on the same Deliverable reattaches to that worktree instead of creating a second branch.
- You can see an actual `/tdd` invocation in the trace, not just tests appearing in the diff.
- Typechecks and single test files run repeatedly during the run, and the full suite runs once near the end.
- The Subtask closes when it is done, so the Deliverable's child list reads as a progress bar.
- The run reaches `code-review` without you prompting it to carry on, then stops there, reporting the worktree path and leaving the diff uncommitted inside it.
- The diff is one Subtask's worth of change: a vertical slice through every layer, not several swept together.

## Where it fits

`implement` is the build step of the main chain, second from the end:

```txt
grill-with-docs → to-spec → to-tickets → implement → code-review
```

Its neighbours are [to-tickets](https://aihero.dev/skills-to-tickets), which produces the Deliverable and the ordered Subtasks it consumes; [tdd](https://aihero.dev/skills-tdd), which it drives internally at each seam; [code-review](https://aihero.dev/skills-code-review), which it runs as the last step; and [land-the-work](https://aihero.dev/skills-land-the-work), which takes the reviewed diff from the worktree into a commit and a merge request. It sits downstream of the planning skills and trusts them. It does not re-validate the shape of what it was handed, so a badly-structured map or a horizontally-layered ticket gets built as written.

That trust is why [wayfinder](https://aihero.dev/skills-wayfinder) merges onto the chain at [to-spec](https://aihero.dev/skills-to-spec) rather than looping its map straight into `implement`. Go straight to `implement` from a map only when the effort turned out genuinely small.

[ask-matt](https://aihero.dev/skills-ask-matt) is the router over the whole set when you are not sure which flow you are in.
