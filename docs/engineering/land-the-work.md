## What it does

`land-the-work` takes work that is finished but uncommitted, puts it on a branch of its own, and commits it as a [Conventional Commit](https://www.conventionalcommits.org/en/v1.0.0/). It then offers to push the branch and open the merge or pull request, and only does either after you say yes.

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

The other half of landing is choosing where. The default branch is the default base, and one branch per **Deliverable** is the shape. A Deliverable is one unit of delivery: one issue, one branch, one merge request, several commits. Where it has **Subtasks**, they are slices inside it that [implement](https://aihero.dev/skills-implement) already closed as it finished each one, so this skill references and closes the Deliverable only:

| The work | Base to branch from |
| --- | --- |
| Independent of anything unmerged | The default branch, fetched and up to date |
| Builds on commits that only exist on a feature branch | That feature branch |
| Genuinely could go either way | Ask before branching |

Staging is scoped the same way. The skill adds the paths the work touched, and asks about anything else it finds dirty rather than sweeping it into the commit, so two unrelated pieces of work in one tree become two commits.

## Publishing, on request

The skill's job doesn't have to stop at the commit anymore, but it never pushes or opens a request without asking first, since both put the work in front of other people. Say yes and it pushes the branch, then opens the PR or MR itself (`gh pr create` or `glab mr create`, picked from the remote), filling the repo's own template where one exists and otherwise writing a description with the feature description and the ticket it's for. Say no, or leave neither CLI configured, and it stops at the commit exactly as before, handing you the branch and the SHA to push yourself.

How the issue gets referenced is a decision, not a formality. GitHub and GitLab both close a linked issue the moment the request merges, but only where the description carries a closing keyword: `Closes #123` closes it, a bare `#123` links it and leaves it open forever. So the skill picks on what the work actually did. Finished the issue outright, and it writes the keyword, so merging clears the tracker without anyone remembering to. Did part of it, and it references the issue without one and notes what is still outstanding, because an issue auto-closed with scope remaining is worse than one left open.

Two tracker-config fields change this, both optional. Set a **default reviewer** and it goes on every request it opens. Say **merging does not close the referenced issue** and it writes `Refs` throughout, leaving closing to you. If your triage-labels mapping also names an **in-review role**, it moves the Deliverable there as the request opens.

On a board, leave merging-closes at `yes`. The Review column is where a human reads the diff, and the **merge is what moves the card to Done**: `Refs` there leaves every finished card sitting in Review forever. Nothing else moves a card out of that column, by design.

## Common questions

**Does it push and open the request automatically?**

No. It reports the branch and SHA first and asks before doing either, because publishing the work is a decision worth making on purpose, not the reflexive tail of a commit. Say yes once and it does both together; say no and it stops, same as before this skill could publish at all.

**Does `implement` not commit its own work?**

No. It builds the work and closes out with [code-review](https://aihero.dev/skills-code-review), then stops, which leaves finished work sitting in a dirty tree on whatever branch you happened to be on. This skill is that missing step, and being model-invoked is what lets it fire there without being asked.

**The work came from five Subtasks. Should the request reference all five?**

No, just the Deliverable. The Subtasks are slices inside one unit of delivery, all landing as commits on its one branch, and `implement` closed each as it finished it, so a footer naming all five tells a reader nothing they need. One Deliverable, one branch, one merge request, one closing reference. That is also why `implement` runs once per Subtask but this skill runs once per Deliverable, at the end.

**My issue didn't close when the request merged. Why?**

Three usual reasons. The description linked the issue without a closing keyword, so the host had nothing to act on. Or the request targeted a feature branch rather than the default branch, which is the only merge the keyword fires on. Or the ticket lives in Jira, Linear, or Asana, where a GitHub or GitLab keyword means nothing and only that tracker's own integration can close it. The skill states which issues will close on merge when it reports the request, so a silence there is the signal to check.

**What if the repo's own commits don't look like Conventional Commits?**

Conventional Commits is still the default. A messy history is a reason to start converging on a shape, not a reason to match the mess. An explicit override in `CONTRIBUTING.md`, `AGENTS.md`, `CLAUDE.md`, or a commitlint config still takes precedence, since that's a documented decision rather than habit.

## It's working if

- You are never on the default branch when the commit lands.
- The branch name and the subject line are in Conventional Commits shape, unless the repo documents something else.
- Every subject fits in 50 characters, prefix included, and `git log --oneline` reads as a list rather than a wall of truncations.
- The commit body tells you something the diff does not, including anything the work found and left for later.
- Nothing you did not intend to commit is in `git diff --cached --stat`.
- It reports a branch and a SHA and asks before it pushes or opens anything; the request, when opened, has the feature description and the ticket in it, not a blank body.
- Merging a request that finishes an issue closes that issue, and you were told it would before the merge happened. An issue the work only partly addresses stays open, with the remainder written down.
- On a board, exactly one card moves to Review when the request opens, and it is the Deliverable, not any of its Subtasks.

## Where it fits

The last step of the main idea-to-ship flow: [implement](https://aihero.dev/skills-implement) builds the work, one Subtask per session, and runs [code-review](https://aihero.dev/skills-code-review) over it, and this is what turns the reviewed result into a commit on a branch, and, on request, a merge or pull request too. It runs once per Deliverable, at the end, not once per Subtask. It is also a reach-for-it-anytime standalone, since any finished change needs landing whether a spec produced it or not. Its nearest neighbour is [resolving-merge-conflicts](https://aihero.dev/skills-resolving-merge-conflicts), which owns the other place commits get made, mid-merge rather than end-of-work. [ask-matt](https://aihero.dev/skills-ask-matt) is the map for everything around it.
