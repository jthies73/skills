## What it does

`to-tickets` takes a plan, a [spec](https://www.aihero.dev/ai-coding-dictionary/spec), or the conversation you are in, and breaks it into one **Deliverable** with ordered **Subtasks** on your issue tracker.

A **Deliverable** is one unit of delivery: one issue, one branch, one merge request, several commits. Usually it is the issue you already had. A **Subtask** is a **tracer bullet** inside it: a narrow but complete path through every layer of the change (schema, API, UI, tests) that can be demoed on its own the moment it lands, sized to fit a single fresh [context window](https://www.aihero.dev/ai-coding-dictionary/context-window), because the thing that will pick it up is a [session](https://www.aihero.dev/ai-coding-dictionary/session) that has never seen your spec.

Subtasks are **ordered, not independently grabbable**. That is the constraint that makes this behave differently from the obvious way to split work. They land as commits on one branch, so "blocked by" collapses to "comes after", and one human review reads one coherent diff instead of five.

## When to reach for it

You invoke this by typing `/to-tickets`. The [agent](https://www.aihero.dev/ai-coding-dictionary/agent) won't reach for it on its own.

| Where you are | What to run |
| --- | --- |
| You have a spec issue and the build spans several sessions | `/to-tickets`, or `/to-tickets #<spec_issue>` |
| The plan is only in the conversation, never written up | `/to-tickets` reads the thread directly, no spec needed |
| The whole change fits in one context window | [implement](https://aihero.dev/skills-implement), skip the tickets |
| Nothing is decided yet | [grill-with-docs](https://aihero.dev/skills-grill-with-docs), then [to-spec](https://aihero.dev/skills-to-spec) |
| A [wayfinder](https://aihero.dev/skills-wayfinder) map has cleared | [to-spec](https://aihero.dev/skills-to-spec) first, to collapse the map, then `/to-tickets` |

Subtasks that `to-tickets` produced are refined by construction. Don't run [triage](https://aihero.dev/skills-triage) over them: it excludes them from discovery for that reason. Triage is for work that arrived from someone else.

## Prerequisites

`to-tickets` publishes into a tracker, so [setup-matt-pocock-skills](https://aihero.dev/skills-setup-matt-pocock-skills) must have configured one for this repo, along with the triage-label vocabulary. Either kind works: a real tracker like GitHub or Linear, or local markdown files under `.scratch/`, which is supported out of the box.

## Tracer bullets, not layers

A **horizontal** slice ships one layer of the change. Nothing works until every layer has landed, and each slice's acceptance criteria have to reach into work another slice owns. A **vertical** slice (the tracer bullet) ships one thin path through all the layers at once, so it is verifiable alone and owns everything it grades.

A slice that genuinely can't ship on its own ships behind a feature flag, and the flag is part of the slice.

This is the rule people break most often, and the consequences are well documented. One team ran a 26-ticket stack sliced by layer (corpus, producer, aggregator, selector) and got roughly twenty agent runs per closed ticket, about three quarters of them rework. Their own post-mortem traced every failure class back to the horizontal slicing rather than to the implementations.

Two things happen before anything is published. `to-tickets` looks for prefactoring (the principle "make the change easy, then make the easy change") and orders that work first. Then it presents the breakdown as a numbered list and quizzes you on it: is the granularity right, is the order right, should anything merge or split, and is this one merge request or more than one. Nothing reaches the tracker until you approve, and that quiz is the place to push back.

## Order, and where blocking edges live

Inside a Deliverable there are no edges. Subtasks are numbered in build order, land as commits on one branch, and are worked top to bottom, one per fresh session.

Edges exist **between Deliverables**, and only in the overflow case below. That is a deliberate narrowing: an edge is a promise that two things can proceed independently, and two Subtasks on the same branch cannot.

`to-tickets` finishes by moving the Deliverable into the ready role, which is what puts it in a board's ready column. It is earned: a card reaches ready by having both a filled spec and published Subtasks, so a ready column full of half-specified work stops being possible.

## Overflow: more than one merge request

Where the approved breakdown is more than one shippable merge request, one Deliverable can't hold it: the Subtasks would land as one unreviewable diff, which is the thing a review stage exists to prevent. `to-tickets` says so out loud, then goes to three levels: sibling **Deliverables** with real blocking edges between them, each with its own Subtasks, and the original issue becomes a container that leaves the board.

The clearest case is a **wide refactor**: a single mechanical change (rename a column, retype a shared symbol) whose **blast radius** fans across the whole codebase, so one edit breaks thousands of call sites and no vertical slice can land green. It sequences as **expand-contract**, and each step is its own Deliverable, because no one of them is a merge request the others can wait inside:

- **Expand**: add the new form beside the old, so nothing breaks.
- **Migrate**: move call sites over in batches sized by blast radius (per package, per directory), one Deliverable per batch, each blocked by the expand. CI stays green because the old form still exists.
- **Contract**: delete the old form once no caller remains, blocked by every migrate batch.

Where even the batches can't stay green alone, they share an integration branch and all block a final integrate-and-verify Deliverable. Green is promised only there.

Work the **frontier**: any Deliverable whose blockers are all done.

## Common questions

**Why one card with subtasks, instead of twelve independent tickets?**
Because review only means something at the granularity that actually gets reviewed. If every slice is merged as it lands, then by the time the last one merges everything has already been through review, and the card arrives at your review stage with nothing left to look at. One Deliverable, one branch, one merge request, one coherent diff. The cost is real: nothing inside a Deliverable ships until all of it does, which is affordable only while a run of Subtasks lands in a couple of days. If yours routinely take longer, you are cutting Deliverables too large.

**It produced twelve tickets for a three-line change.**
Over-decomposition is the most reported friction on this skill, and it is consistent across practitioners: the [model](https://www.aihero.dev/ai-coding-dictionary/model) defaults to atomic units and loses the grouping that would make them meaningful. The quiz step exists for exactly this: ask it to merge, and it will. The deeper answer is that the tickets have a floor: if the whole change fits in one context window, you don't need this skill at all. Go straight to [implement](https://aihero.dev/skills-implement).

**The tickets came out one per layer: all the schema in one, all the API in another.**
This is the failure the vertical-slice rule is written against, and the skill still produces it sometimes. Catch it at the quiz step by asking one question per ticket: what can I demo when this is done? A ticket with no answer is a horizontal slice. Some people add a "demo path" line to each ticket for this reason, and report it nudges the model toward vertical decomposition.

**On GitHub the Subtasks weren't created as sub-issues of the Deliverable.**
Known and unfixed. It has been reported across a dozen runs and several models, [most fully in issue #554](https://github.com/mattpocock/skills/issues/554), and it is worse on Codex than on Claude. `gh` has supported this natively since v2.94: `gh issue create --parent <n>`, and `gh issue edit <parent> --add-sub-issue <n>` after the fact. Until the tracker template prefers those, wiring the parent links yourself after a run is the reliable move.

**"Blocked by" was written into the issue body instead of a real blocking link.**
Same class of problem, [reported in issue #513](https://github.com/mattpocock/skills/issues/513), where the agent went as far as asserting GitHub has no native blocking relationship at all. It does: `gh issue create --blocked-by 12,15`. Because blockers are published first, their numbers are always available at creation time. The body text is meant to be the fallback for trackers with no native edge, not the default. Note this now only applies between sibling Deliverables in the overflow case: inside a Deliverable there is nothing to link, just an order.

**Where do the local Subtask files go? The v1.1 notes said a root-level `tickets.md`.**
They did, and that was a bug: a single shared file also raced when parallel agents wrote to it. Local mode now writes one file per Subtask under `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, in build order, matching the layout the local tracker template already described. The `NN` prefix is a real ID, so `/implement 03` works instead of retyping a long title.

**It kept truncating when it tried to read my spec.**
A very large spec can outgrow what a tracker issue serves back cleanly, and there is no local copy to fall back on, so the agent then burns [tool calls](https://www.aihero.dev/ai-coding-dictionary/tool-call) re-fetching chunks and never reaches the end. Don't [clear](https://www.aihero.dev/ai-coding-dictionary/clearing) or [compact](https://www.aihero.dev/ai-coding-dictionary/compaction) between `/to-spec` and `/to-tickets`. Run them in the same context window and the spec never has to be fetched back at all.

**The acceptance criteria graded nothing: some passed before any work was done.**
The template asks for criteria and says nothing about whether they can fail, so this happens. Three shapes recur: a criterion already true at the base commit, a criterion that can only be satisfied by work another ticket owns, and one that restates the request rather than deriving from the artifact. Vertical slicing prevents most of it (a slice that delivers behaviour which didn't exist before is red at the base commit by construction), but the check is worth doing by hand. For each criterion, name the observation that would show it false, and confirm it fails at the commit the implementer starts from.

**The Subtasks are published. How do I actually run them?**
The skill stops at the artifact, and there is no auto-dispatch mode. Dispatch is manual and, inside one Deliverable, serial: run [implement](https://aihero.dev/skills-implement) on the first Subtask, [clear](https://www.aihero.dev/ai-coding-dictionary/clearing), run it on the next. Everything lands on one branch, a commit at a time: [land-the-work](https://aihero.dev/skills-land-the-work) runs after each Subtask, opens one draft merge request on the first and marks it ready on the last. Parallelism lives one level up: sibling Deliverables whose blockers are done can run at once, an agent each, since `implement` gives every Deliverable its own branch and its own worktree.

## It's working if

- Every Subtask has an answer to "what can I demo when this is done?", and the answer is behaviour, not a layer.
- The list comes back to you numbered in build order, and one of the questions it asks is whether this is one merge request or more.
- The Deliverable ends up in your ready column, and it got there by having both a spec and published Subtasks.
- Nothing in a Subtask body is a file path or a line number, except a snippet a prototype produced.
- Each Subtask reads like something a fresh session could finish without you in the room.
- Prefactoring, where it found any, is the first Subtask rather than mixed into feature work.
- You get told, before anything is published, when the spec turned out to be more than one merge request.

## Where it fits

`to-tickets` is a step in the main build chain:

```txt
grill-with-docs → to-spec → to-tickets → implement → code-review
```

Upstream is [to-spec](https://aihero.dev/skills-to-spec), which hands it a settled spec to slice against; keep both in one unbroken context window. Downstream is [implement](https://aihero.dev/skills-implement), which claims the Deliverable and builds one Subtask per fresh session, driving [tdd](https://aihero.dev/skills-tdd) for the tests and closing with [code-review](https://aihero.dev/skills-code-review). Then [land-the-work](https://aihero.dev/skills-land-the-work) commits each slice onto the Deliverable's branch as it is finished, growing one draft merge request until the last Subtask marks it ready. When you're unsure which skill or flow fits, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
