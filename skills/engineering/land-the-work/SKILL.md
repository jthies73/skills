---
name: land-the-work
description: "Land a finished slice on the branch it belongs on, commit it as a Conventional Commit, then offer to push and open or update the draft merge/pull request. Use when finished work is sitting uncommitted, when the user asks to branch, commit, or open a PR/MR, or when a skill that built something closes out. Not mid-build or mid-review: implement and code-review run first."
---

Finished work is not delivered while it sits in a dirty tree. Land it.

One **Deliverable**, one branch, one worktree, one request, one commit per **Subtask**. This runs once per Subtask, not once per Deliverable: `implement` builds a slice and deliberately leaves it uncommitted, and nothing reaches the branch until a human runs this. That is the whole gate. Run it before the next Subtask starts, or two slices pile up in one tree and land as one commit that nobody chose.

**The request is a draft until the work is done.** The first run opens it as a draft, so the branch and its diff are visible on the host while the work is in flight without asking anyone to review a third of a feature. The last run marks it ready, which is the moment the Deliverable moves to review and becomes mergeable. Every run in between adds a commit to the branch and pushes it.

**One branch and one request for all of them.** Every run after the first finds what already exists and adds to it. A second branch, or a second request, for Subtask 3 is the failure this shape exists to prevent, and it is what step 2 guards.

1. **State the shape, then check for an override.** The default is [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/): a subject of `type: summary` in the imperative, `type` from `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `build`, `ci`, `style`; and a branch name of `type/slug` (`type/ticket-slug` when a ticket exists). That default holds even where the repo's own history doesn't already look like it, since a history of unconventional commits is exactly the debt this fixes going forward. Check `CONTRIBUTING.md`, `AGENTS.md`, and `CLAUDE.md` for a documented override (a different subject shape, a custom type list, a required footer) and a commitlint config (`.commitlintrc*`, `commitlint.config.*`) the same way, and follow either where one exists. Then `git status -sb` for where you are. The tracker config is the only source for how work gets referenced: read its landing conventions for whether merging should close the referenced issue, and let **Referencing the work** below turn that answer into the two lines steps 4 and 5 write. The git log does not answer this and reads as though it does: a `(#42)` on a subject is the number of the pull request the host squashed, not a reference to a ticket, so a log full of them is a log with no ticket references in it at all. Done when you can quote the subject shape in force, the footer line step 4 will write, the description line step 5 will write, and whether merging closes the Deliverable.

   **The subject is capped at 50 characters**, counted across the whole line including the `type:` prefix and any scope. The cap is not one of the things an override can lift: an override sets a *maximum*, so a documented limit shorter than 50 wins and a longer one buys nothing. Git's own tooling assumes it: `git log --oneline` and every host's commit list truncate around there.

2. **Land on the Deliverable's branch, in the worktree that holds it, and create neither.** `implement` takes both before it builds and leaves the diff sitting there uncommitted, so on every run this is a lookup, not a decision: `git status -sb` for the branch you are on, and `git worktree list` where the tree you were invoked in is clean and the work is next door. Run the rest of these steps in that directory, since an uncommitted diff belongs to one worktree's index and is invisible from every other.

   **A run that reaches for `git checkout -b` has gone wrong.** Every Subtask after the first arrives to a branch that already exists, and a Subtask you did not personally build in this session looks exactly like fresh work sitting on a stranger's branch. Before branching anything, look: `git branch --list '*<ticket-number>*'` and the Deliverable's own linked branch. Where one exists, use it.

   Branch here in exactly one case: the work never came through `implement` and no branch for it exists. Then `git fetch`, name it in the shape from step 1 (`fix/842-flaky-e2e-timeout`), and take the default branch as the base unless this work builds on commits living only on a feature branch. Where both bases are defensible, ask. Say which base you picked either way. However the branch got there, the commit lands on a ticket branch and the default branch stays untouched.

3. **Stage this slice, and only this slice.** Read `git status --short` in full, then add the paths this Subtask touched. Where something unexpected is dirty (a stray edit, a generated file, another task's leftovers), ask rather than sweeping it in. Two unrelated pieces of work in one tree are two commits, staged separately. Done when `git diff --cached --stat` is exactly the slice.

4. **Write the commit in the shape from step 1.** The subject describes the Subtask, not the Deliverable: this is one slice of several, and a subject naming the whole feature is a lie repeated on every commit. Then a body carrying what a reviewer would otherwise have to reconstruct: the decisions behind the change, the constraint that forced an odd-looking choice, and anything the work uncovered and deliberately left alone. Footer carrying the Subtask line from **Referencing the work**. Where a hook rejects the commit, fix what it flagged and commit again, keeping the hook in the loop.

   Measure the subject rather than eyeballing it: `git log -1 --pretty=%s | awk '{ print length }'` reports the exact count. Over the cap, `git commit --amend` it down, cutting rather than truncating: the detail moves into the body, which has no limit, and a subject that still won't fit once the detail has moved is telling you this is two commits.

5. **Work out where the request stands, then offer, then follow through only if told to.** Report the landing first: branch, SHA, subject. Then read two things, and say both out loud before you ask anything.

   **Is a request already open on this branch?** `gh pr list --head <branch>` on a GitHub remote, `glab mr list --source-branch <branch>` on GitLab, chosen from `git remote -v`.

   **Was this the last Subtask?** Read it from the Deliverable's open Subtasks: none left open means yes, since `implement` closes each as it finishes. Say which you concluded and from what count, so a miscount is caught before the request flips rather than after. A Deliverable with no Subtasks at all, or standalone work with no Deliverable, is its own last slice.

   Those two answers pick the offer, and each one asks for a yes before anything leaves the machine:

   | Request | Last Subtask | Offer |
   | --- | --- | --- |
   | None | No | Push the branch and open the request **as a draft** |
   | None | Yes | Push the branch and open the request **ready for review** |
   | Open | No | Push the commit to the existing draft |
   | Open | Yes | Push, then **mark the draft ready for review** |

   On no, stop at the commit and report the branch and SHA to push yourself. Same where neither CLI is configured.

   On yes, opening a request: `gh pr create` or `glab mr create`, `--draft` where the table says draft. **Title it from the Deliverable, not from this commit**, since the request spans every Subtask and the first slice's subject is the wrong name for all of it. If the tracker config names a default reviewer, pass it (`--reviewer <name>`); if it names none, don't. Fill the repo's own template if it has one (`.github/PULL_REQUEST_TEMPLATE.md`, `.gitlab/merge_request_templates/`); otherwise write the feature description yourself: what changed and why, in the reader's terms, not a diff summary. Either way the description ends with the Deliverable line from **Referencing the work**, appended where a template gives it no slot.

   On yes, marking ready: `gh pr ready <n>` or `glab mr update <n> --ready`. Bring the description up to date with what the finished work actually does, since it was written when one slice of it existed, and confirm the Deliverable line is still in it. Where the triage-labels config names an **in-review role**, move the Deliverable into it now, clearing whichever state it was in before. **Not on the draft**: a draft request is work in progress, and a card sitting in Review for four days while three Subtasks are still being built is a board that lies. On a board this is the Review column, and nothing moves a card out of it: the human reads the diff and merges.

   Either way, read the description back once the request exists (`gh pr view <n> --json body`, `glab mr view <n>`) and confirm the Deliverable line is in it, since a description missing it is a Deliverable that stays open through its own merge, and the merge is the only place anyone finds out.

## Referencing the work

Two lines, at two granularities, and steps 4 and 5 write one each.

**The commit footer references the Subtask it landed**: `Refs #<subtask>`, never a closing keyword. `implement` already closed it, and a commit is the record of which slice produced which change.

**The request description references the Deliverable, once.** No Subtask gets a line here: they are slices inside one unit of delivery, and a description naming all five says nothing a reader needs. Where the change answers no Deliverable at all, write that in place of the line rather than leaving it out, so a reader can tell an unticketed change from a forgotten reference.

Where the tracker config says merging should *not* close the referenced issue, that line is `Refs #123`, and you report which issue moved rather than which will close.

Otherwise: GitHub and GitLab close a linked issue on merge only where the description carries a closing keyword; a bare `#123` links and leaves it open, which is how issues outlive the work that finished them. Where the finished work leaves nothing of the Deliverable undone, write `Closes #123`. Where it leaves part of it, write `Refs #123` plus what is still outstanding, since a half-answered issue closed by a keyword is worse than one left open. Cannot tell: ask. Two silent failures to check for: the keyword fires only on merge into the default branch, and it reaches the host's own issues only, so a Jira, Linear, or Asana ticket closes through that tracker's integration or not at all. Report whether the Deliverable will close before the merge happens.
