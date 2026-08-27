---
name: to-tickets
description: Break a plan, spec, or the current conversation into one Deliverable with ordered tracer-bullet Subtasks on the configured tracker, then move the Deliverable into the ready role.
disable-model-invocation: true
---

# To Tickets

Break a plan, spec, or conversation into one **Deliverable** and its ordered **Subtasks**.

A **Deliverable** is one unit of delivery: one issue, one branch, one merge request, several commits. A **Subtask** is a tracer-bullet vertical slice inside it, sized for one fresh context window, worked in order on the Deliverable's branch. Subtasks are **sequenced, not independently grabbable**: sequence is the only edge they have. The Deliverable is the unit because Review is only meaningful at the granularity that actually gets reviewed: slices merged one by one arrive at Review with nothing left to look at.

Usually the Deliverable already exists: it's the issue the user brought you, and `to-spec` has filled its body. Where a spec turns out to be **more than one shippable merge request**, see Overflow below.

The issue tracker and triage label vocabulary should have been provided to you. If not, tell the user to run `/setup-matt-pocock-skills`.

## Process

### 1. Gather context

Work from whatever is already in the conversation context. If the user passes a reference (a spec path, an issue number or URL) as an argument, fetch it and read its full body and comments.

### 2. Explore the codebase (optional)

If you have not already explored the codebase, do so to understand the current state of the code. Subtask titles and descriptions should use the project's domain glossary vocabulary, and respect ADRs in the area you're touching.

Look for opportunities to prefactor the code to make the implementation easier. "Make the change easy, then make the easy change."

### 3. Draft the Subtasks

Break the work into **tracer bullet** Subtasks, in the order they will be built.

<vertical-slice-rules>

- Each slice cuts a narrow but COMPLETE path through every layer (schema, API, UI, tests): vertical, NOT a horizontal slice of one layer
- A completed slice is demoable or verifiable on its own
- A slice that can't ship on its own ships behind a feature flag, and the flag is part of the slice
- Each slice is sized to fit in a single fresh context window
- Any prefactoring should be done first

</vertical-slice-rules>

Subtasks are **ordered**, not edged. They land as commits on one branch, so "blocked by" collapses to "comes after". Blocking edges exist between Deliverables only, which matters in the two cases below.

**Wide refactors are the exception to vertical slicing.** A **wide refactor** is one mechanical change (rename a column, retype a shared symbol) whose **blast radius** fans across the whole codebase, so a single edit breaks thousands of call sites at once and no vertical slice can land green. Don't force it into a tracer bullet; sequence it as **expand-contract**. First expand: add the new form beside the old so nothing breaks. Then migrate the call sites over in batches sized by blast radius (per package, per directory), keeping CI green batch to batch because the old form still exists. Finally contract: delete the old form once no caller remains.

A wide refactor is therefore an **Overflow** case: expand, each migrate batch, and contract are each their own **Deliverable** with real blocking edges between them, not Subtasks of one. Nothing else can be true, since no one of them is a merge request the others can wait inside. When even the batches can't stay green alone, keep the sequence but let them share an integration branch that all block a final integrate-and-verify Deliverable; green is promised only there.

### 4. Quiz the user

Present the proposed breakdown as a numbered list, in build order. For each Subtask, show:

- **Title**: short descriptive name
- **What it delivers**: the end-to-end behaviour this Subtask makes work
- **Needs a human**: only where it does, and why (judgment, external access, a credential, manual testing)

Ask the user:

- Does the granularity feel right? (too coarse / too fine)
- Is the order right: does each Subtask only assume work that comes before it?
- Should any Subtasks be merged or split further?
- Is this one merge request, or more than one? (see Overflow)

Iterate until the user approves the breakdown.

### 5. Publish

Publish the approved breakdown. **How** depends on the tracker `/setup-matt-pocock-skills` configured.

**On a real issue tracker (GitHub, GitLab, Linear, …):**

1. **Publish the Subtasks** in build order, as children of the Deliverable, using the host's native child type per the tracker config's Deliverable and Subtask operations. Where the host has none, put `Part of #<deliverable>` at the top of each Subtask and a task list in the Deliverable's body.
2. **Label each Subtask** `ready-for-agent`, or `ready-for-human` where the Subtask needs a person. Read the label strings from the triage-labels mapping; never assume a role's label is its own name. A Subtask gets the **readiness label only**: on a board-shaped mapping it must not carry a column label, or it becomes a card.
3. **Move the Deliverable into the ready role**, as the final step. Apply **every** label that role maps to and remove the ones belonging to the role it's leaving. Its readiness is the grab gate: `ready-for-agent` where an agent can start, `ready-for-human` where the very first step needs a person. This is what earns the Deliverable its place in a board's ready column, and it is earned by having both a filled spec and published Subtasks.

**On local files:** write one file per Subtask under `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01` in build order, using the template below. One Subtask per file, never a single combined file. The Deliverable is the feature folder itself, plus a `spec.md` if `to-spec` wrote one.

Beyond setting its role, do NOT otherwise modify the Deliverable, and never close it.

### Overflow: more than one merge request

Where the approved breakdown is **more than one shippable merge request**, one Deliverable can't hold it: the Subtasks would land as one unreviewable diff, which is the thing a Review stage exists to prevent.

Then, and only then, go to three levels:

1. Group the Subtasks into **sibling Deliverables**, each one merge request's worth.
2. Publish them in dependency order (blockers first) so edges can reference real identifiers, and give each its **blocking edges** using the tracker config's native blocking relationship. Edges exist here and nowhere else.
3. Publish each Deliverable's Subtasks under it, as above.
4. The original issue becomes a **container**: label it `epic` (or whatever the mapping calls the container) so it carries no column label and leaves the board. On a flat mapping, just leave it be.

Work the **frontier**: any Deliverable whose blockers are all done. For a purely linear chain that means top to bottom.

Say out loud that you're doing this, and why, before you publish. A user who expected one card and got four should hear it from you first.

<local-subtask-template>

# <NN>: <Subtask title>

**What to build:** the end-to-end behaviour this Subtask makes work, from the user's perspective, not a layer-by-layer implementation list.

**Comes after:** `<NN-1>`, or "Nothing (first)".

**Readiness:** ready-for-agent

- [ ] Acceptance criterion 1
- [ ] Acceptance criterion 2

</local-subtask-template>

<subtask-template>

## Part of

A reference to the Deliverable this is a Subtask of.

## What to build

The end-to-end behaviour this Subtask makes work, from the user's perspective, not layer-by-layer implementation.

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2

## Comes after

The Subtask immediately before this one, or "Nothing (first)". Subtasks are ordered, not edged: they land as commits on one branch.

</subtask-template>

In either form, avoid specific file paths or code snippets: they go stale fast. Exception: if a prototype produced a snippet that encodes a decision more precisely than prose can (state machine, reducer, schema, type shape), inline it and note briefly that it came from a prototype. Trim to the decision-rich parts, not a working demo, just the important bits.
