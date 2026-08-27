# Matt Pocock Skills

A collection of agent skills (slash commands and behaviors) loaded by Claude Code. Skills are organized into buckets and consumed by per-repo configuration emitted by `/setup-matt-pocock-skills`.

## Language

**Issue tracker**:
The tool that hosts a repo's issues: GitHub Issues, Linear, a local `.scratch/` markdown convention, or similar. Skills like `to-tickets`, `to-spec`, and `triage` read from and write to it.
_Avoid_: backlog manager, backlog backend, issue host

**Issue**:
A single tracked unit of work inside an **Issue tracker**. The generic term: a **Deliverable**, a **Subtask**, and an untriaged bug report are all Issues. Use the specific term wherever the distinction matters, which is wherever a branch, a merge request, or a board column is involved.
_Avoid_: ticket (use only when quoting external systems that call them tickets, or for a **Decision ticket**, see below)

**Deliverable**:
An **Issue** that is one unit of delivery: one branch, one merge request, one card on a board, several commits. What `implement` claims and `land-the-work` lands. On a board-shaped tracker it is the only thing that carries a column label.
_Avoid_: card, epic, parent ticket

**Subtask**:
A child **Issue** of a **Deliverable**: a vertical slice sized for one fresh context window, worked in order on its parent's branch, and closed by `implement` as it completes. Subtasks are sequenced, not independently grabbable, and they never carry a column label, so they never appear on a board.
_Avoid_: ticket, slice used as a noun

**Decision ticket**:
A `wayfinder` unit: a child **Issue** of a `wayfinder:map` holding a *question* whose resolution is a decision, not a slice of a build to execute. The **decision** qualifier is what keeps it distinct from an implementation ticket; `wayfinder` introduces the term, then uses "ticket".

**Triage role**:
A canonical state-machine role an **Issue** occupies during triage (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). Each role maps to **zero or more** real label strings in the **Issue tracker** via this repo's `.agents/triage-labels.md` (other repos use `docs/agents/triage-labels.md`). A role mapping to none is carried by the absence of a state label, which is how a board's backlog column and a rejected-means-closed convention are expressed.

**In-flight role**:
An optional **Triage role** for work already moving, `in-progress` or `in-review`, named in the same mapping. Naming one is what licenses a skill to move an **Issue**: `implement` claims into `in-progress`, `land-the-work` moves to `in-review`. Where the mapping omits them, neither skill touches the tracker. A board-shaped mapping cannot omit them, since In Progress and Review are columns.

## Relationships

- An **Issue tracker** holds many **Issues**
- A **Deliverable** and a **Subtask** are both **Issues**
- A **Deliverable** holds zero or more **Subtasks**; a **Subtask** has exactly one **Deliverable**
- An **Issue** carries one **Triage role** at a time, represented by zero or more labels
- A **Decision ticket** is an **Issue** (a child of a `wayfinder:map`)

## Flagged ambiguities

- "backlog" was previously used to mean both the *tool* hosting issues and the *body of work* inside it. Resolved: the tool is the **Issue tracker**; "backlog" is no longer used as a domain term, except as the name of a board column.
- "backlog backend" / "backlog manager". Resolved: collapsed into **Issue tracker**.
- **Issue** previously covered "a bug, task, spec, or slice produced by `to-tickets`" in one breath, flattening the unit of delivery together with the slices inside it. Resolved: **Deliverable** and **Subtask** name the two, and **Issue** is the generic parent term. See [ADR-0003](.agents/adr/0003-deliverable-is-the-unit-of-delivery.md).
