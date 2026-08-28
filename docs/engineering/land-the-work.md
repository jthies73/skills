## What it does

`land-the-work` takes work that is finished but uncommitted, gets it onto the branch it belongs on, and commits it as a [Conventional Commit](https://www.conventionalcommits.org/en/v1.0.0/). It then offers to push, and to open or advance the merge or pull request, and only does any of it after you say yes.

It runs **once per Subtask**, not once at the end. [implement](https://aihero.dev/skills-implement) builds a slice and deliberately leaves it uncommitted, so this skill is the gate every slice passes through on its way to the branch: nothing gets committed without you invoking it, and it asks again before anything reaches the remote. The request it opens is a **draft** until the last Subtask lands, so the branch and its diff are visible on the host the whole time without anyone being asked to review a third of a feature.

Work that came through [implement](https://aihero.dev/skills-implement) is already on its branch, in the worktree that skill built it in, so the branch half of the job is confirming rather than creating. Run this **in that worktree**: an uncommitted diff belongs to one working tree and is invisible from every other checkout of the repo. Work that never came through `implement`, sitting dirty on your default branch, still gets branched here.

Conventional Commits is the fixed default for both the subject line and the branch name, not something inferred from the repo's own history: a `type/slug` branch and a `type: summary` subject apply even in a repo whose past commits don't already look that way, since that history is exactly the debt the convention fixes going forward. A documented override in `CONTRIBUTING.md`, `AGENTS.md`, `CLAUDE.md`, or a commitlint config still wins where one exists.

## When to reach for it

Type `/land-the-work`, or the [agent](https://www.aihero.dev/ai-coding-dictionary/agent) reaches for it automatically when a task fits.

Reach for it at the moment the work is done and the tree is still dirty.

| Your situation | Skill |
| --- | --- |
| Work finished, nothing committed yet | This one |
| Work finished, and you want it reviewed before it is committed | [code-review](https://aihero.dev/skills-code-review) first, then this one |
| Mid-merge or mid-rebase, git stopped on conflicts | [resolving-merge-conflicts](https://aihero.dev/skills-resolving-merge-conflicts), which finishes with its own commit |

## Prerequisites

Landing the commit needs nothing beyond the repo itself. Pushing and opening the request need `gh` (GitHub) or `glab` (GitLab) authenticated against the remote; without one configured, the skill stops at the commit the way it always did.

## Landing, not saving

A commit is not a save point. It is the unit a reviewer reads, and a month later it is the only account of why the change looks the way it does. So the message carries what the diff cannot: the decision behind the change, the constraint that forced an odd-looking choice, and anything the work turned up and deliberately left alone. That last one is the line most often missing, and the most expensive: a finding nobody wrote down is a finding rediscovered from scratch.

The subject line has a hard budget: **50 characters, including the `type:` prefix**. That is the width `git log --oneline` and every host's commit list are built around, so a longer subject is one that gets truncated at exactly the moment someone is scanning for it. The cap is not something a repo can raise, only lower, since a `commitlint` limit sets a maximum and a stricter subject satisfies it either way.

The budget does most of its work as a diagnostic rather than an edit. Detail that will not fit belongs in the body, which has no limit; a subject that still will not fit once the detail has moved is usually one commit doing two things, and the fix is to split it rather than to shorten the words.

The other half of landing is where. One branch per **Deliverable** is the shape: one issue, one branch, one worktree, one merge request, one commit per **Subtask**. Every run after the first arrives to a branch and a request that already exist and adds to them, and a run that reaches for `git checkout -b` has gone wrong. The giveaway is that a Subtask you did not personally watch get built looks exactly like fresh work sitting on a stranger's branch, so the skill looks for the Deliverable's branch before it considers making one.

The two granularities get different references. Each commit footer carries `Refs #<subtask>`, so the history says which slice produced which change. The request description carries the Deliverable once, with the closing keyword, so one merge closes one issue.

Where the branch has to be created here, the base is a choice:

| The work | Base to branch from |
| --- | --- |
| Already on a branch, from `implement` or from you | None. Confirm and commit |
| Independent of anything unmerged | The default branch, fetched and up to date |
| Builds on commits that only exist on a feature branch | That feature branch |
| Genuinely could go either way | Ask before branching |

Staging is scoped the same way. The skill adds the paths the work touched, and asks about anything else it finds dirty rather than sweeping it into the commit, so two unrelated pieces of work in one tree become two commits.

## Publishing, on request

The skill's job doesn't have to stop at the commit anymore, but it never pushes or opens a request without asking first, since both put the work in front of other people. Say yes and it pushes the branch, then opens the PR or MR itself (`gh pr create` or `glab mr create`, picked from the remote), filling the repo's own template where one exists and otherwise writing the feature description itself. Either way the description ends with the reference to the issue, appended where a template gives it no slot. Say no, or leave neither CLI configured, and it stops at the commit, handing you the branch and the SHA to push yourself.

What it offers depends on where the request already stands, which it works out from two lookups it states out loud: whether a request is open on this branch, and whether this was the last Subtask (no open Subtasks left on the Deliverable, since `implement` closes each as it finishes).

| Request | Last Subtask | What it offers |
| --- | --- | --- |
| None | No | Push the branch, open the request as a **draft** |
| None | Yes | Push the branch, open the request **ready for review** |
| Open | No | Push this commit to the existing draft |
| Open | Yes | Push, then **mark the draft ready for review** |

The request is titled from the **Deliverable**, not from the commit that opened it: it spans every Subtask, and the first slice's subject is the wrong name for all of it. When the draft flips to ready, the skill brings the description up to date with what the finished work actually does, since it was written back when one slice of it existed.

How the issue gets referenced is a decision, not a formality. GitHub and GitLab both close a linked issue the moment the request merges, but only where the description carries a closing keyword: `Closes #123` closes it, a bare `#123` links it and leaves it open forever. So the skill picks on what the work actually did. Finished the issue outright, and it writes the keyword, so merging clears the tracker without anyone remembering to. Did part of it, and it references the issue without one and notes what is still outstanding, because an issue auto-closed with scope remaining is worse than one left open.

That decision comes from your tracker config and nowhere else, in particular not from the repo's own history. A `(#42)` on a subject line is the number of the pull request the host squashed, not a reference to a ticket, so a log full of them looks like a settled convention while containing no ticket references at all. Reading the log for this is how requests end up shipping with no reference in them. The skill also reads the request body back after opening it and checks the line is there, because a missing reference is invisible until the merge that should have closed the issue doesn't.

Two tracker-config fields change this, both optional. Set a **default reviewer** and it goes on every request it opens. Say **merging does not close the referenced issue** and it writes `Refs` throughout, leaving closing to you. If your triage-labels mapping also names an **in-review role**, it moves the Deliverable there when the draft is marked ready, not when it opens: a card sitting in Review for four days while three Subtasks are still being built is a board that lies.

On a board, leave merging-closes at `yes`. The Review column is where a human reads the diff, and the **merge is what moves the card to Done**: `Refs` there leaves every finished card sitting in Review forever. Nothing else moves a card out of that column, by design.

## Common questions

**Does it push and open the request automatically?**

No. It reports the branch and SHA first and asks before doing either, because publishing the work is a decision worth making on purpose, not the reflexive tail of a commit. Say yes once and it does both together; say no and it stops, same as before this skill could publish at all.

**Does `implement` not commit its own work?**

No. It builds the work and closes out with [code-review](https://aihero.dev/skills-code-review), then stops, which leaves finished work sitting in a dirty tree, on the branch and in the worktree it created for the Deliverable. This skill is that missing step, and being model-invoked is what lets it fire there without being asked. What changed is the division of labour: `implement` owns the branch now, this skill owns the commit.

**I ran it and it found nothing to land.**

Almost always the wrong directory. `implement` builds in a worktree of its own next to your repo, and an uncommitted diff belongs to that working tree alone, so the checkout you started from looks clean because it is clean. `git worktree list` shows where the work is; run the skill there. The same goes for reading the diff yourself: `git -C <path> diff`.

**The work came from five Subtasks. Should the request reference all five?**

No, just the Deliverable, once, with the closing keyword. The Subtasks are slices inside one unit of delivery, and a description naming all five tells a reader nothing they need. They are not unreferenced, though: each slice's own commit carries `Refs #<subtask>` in its footer, which is where per-slice traceability belongs. One Deliverable, one branch, one merge request, one closing reference, five commits.

**Why a draft request instead of waiting until the work is finished?**

Because a branch nobody can see is a Deliverable nobody can check on. The draft puts the branch, the commits, and the accumulating diff on the host from the first Subtask, so you watch the change take shape instead of meeting all of it at once. The draft flag is what stops that visibility from becoming a review request: hosts keep drafts out of review queues and block merging them, so an unfinished Deliverable cannot be merged by accident and nobody is pinged to read a third of a feature. Marking it ready is the single moment the work becomes reviewable, and the moment the card moves to Review.

**It asked me before every push. Can it not just get on with it?**

That ask is the gate, and it is what you have instead of `implement` committing on its own. Every slice reaches the branch because you said yes, and reaches the remote because you said yes again; five Subtasks is five prompts. If they feel like friction rather than checkpoints, the Deliverable is probably cut too fine: a Subtask should be a session's worth of work, not a commit's.

**My issue didn't close when the request merged. Why?**

Four usual reasons. The description carried no reference at all, so the host had nothing to link. Or it linked the issue without a closing keyword, so the host had nothing to act on. Or the request targeted a feature branch rather than the default branch, which is the only merge the keyword fires on. Or the ticket lives in Jira, Linear, or Asana, where a GitHub or GitLab keyword means nothing and only that tracker's own integration can close it. The first is the one this skill used to produce on its own, by reading ticket conventions out of a git log full of squash-merge PR numbers; it now takes that answer from the tracker config and verifies the line landed in the request. The skill states which issues will close on merge when it reports the request, so a silence there is the signal to check.

**What if the repo's own commits don't look like Conventional Commits?**

Conventional Commits is still the default. A messy history is a reason to start converging on a shape, not a reason to match the mess. An explicit override in `CONTRIBUTING.md`, `AGENTS.md`, `CLAUDE.md`, or a commitlint config still takes precedence, since that's a documented decision rather than habit.

## It's working if

- You are never on the default branch when the commit lands.
- Work from `implement` gets committed on the branch that already existed, in the worktree holding it, with no second branch created.
- The branch name and the subject line are in Conventional Commits shape, unless the repo documents something else.
- Every subject fits in 50 characters, prefix included, and `git log --oneline` reads as a list rather than a wall of truncations.
- The commit body tells you something the diff does not, including anything the work found and left for later.
- Nothing you did not intend to commit is in `git diff --cached --stat`.
- It reports a branch and a SHA and asks before it pushes or opens anything; the request, when opened, has the feature description and the ticket in it, not a blank body.
- The reference to the issue is in the request body, template or no template, and the skill says it checked. A change that answers no issue says so, rather than saying nothing.
- Merging a request that finishes an issue closes that issue, and you were told it would before the merge happened. An issue the work only partly addresses stays open, with the remainder written down.
- Five Subtasks produce five commits on one branch and one request, with no second branch and no second request anywhere.
- The request exists as a draft from the first Subtask, and flips to ready exactly once, on the last.
- On a board, exactly one card moves to Review when the draft is marked ready, and it is the Deliverable, not any of its Subtasks.

## Where it fits

The last step of the main idea-to-ship flow: [implement](https://aihero.dev/skills-implement) builds the work, one Subtask per session, and runs [code-review](https://aihero.dev/skills-code-review) over it, and this is what turns each reviewed slice into a commit on that branch, and, on request, into a pushed draft request that grows with it. It runs once per Subtask, right after `code-review`, and the one request it manages spans all of them. It is also a reach-for-it-anytime standalone, since any finished change needs landing whether a spec produced it or not. Its nearest neighbour is [resolving-merge-conflicts](https://aihero.dev/skills-resolving-merge-conflicts), which owns the other place commits get made, mid-merge rather than end-of-work. [ask-matt](https://aihero.dev/skills-ask-matt) is the map for everything around it.
