# Matt Pocock Skills

A collection of agent skills (slash commands and behaviors) loaded by Claude Code. Skills are organized into buckets and consumed by per-repo configuration emitted by `/setup-matt-pocock-skills`.

## Language

**Issue tracker**:
The tool that hosts a repo's issues: GitHub Issues, Linear, a local `.scratch/` markdown convention, or similar. Skills like `to-tickets`, `to-spec`, and `triage` read from and write to it.
_Avoid_: backlog manager, backlog backend, issue host

**Issue**:
A single tracked unit of work inside an **Issue tracker**: a bug, task, spec, or slice produced by `to-tickets`.
_Avoid_: ticket (use only when quoting external systems that call them tickets, or for a **Decision ticket**, see below)

**Decision ticket**:
A `wayfinder` unit: a child **Issue** of a `wayfinder:map` holding a *question* whose resolution is a decision, not a slice of a build to execute. The **decision** qualifier is what keeps it distinct from an implementation ticket; `wayfinder` introduces the term, then uses "ticket".

**Triage role**:
A canonical state-machine role an **Issue** occupies during triage (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). Each role maps to **zero or more** real label strings in the **Issue tracker** via this repo's `.agents/triage-labels.md` (other repos use `docs/agents/triage-labels.md`). A role mapping to none is carried by the absence of a state label, which is how a board's backlog column and a rejected-means-closed convention are expressed.

**In-flight role**:
An optional **Triage role** for work already moving, `in-progress` or `in-review`, named in the same mapping. Naming one is what licenses a skill to move an **Issue**: `implement` claims into `in-progress`, `land-the-work` moves to `in-review`. Where the mapping omits them, neither skill touches the tracker.

## Relationships

- An **Issue tracker** holds many **Issues**
- An **Issue** carries one **Triage role** at a time, represented by zero or more labels
- A **Decision ticket** is an **Issue** (a child of a `wayfinder:map`)

## Flagged ambiguities

- "backlog" was previously used to mean both the *tool* hosting issues and the *body of work* inside it. Resolved: the tool is the **Issue tracker**; "backlog" is no longer used as a domain term.
- "backlog backend" / "backlog manager". Resolved: collapsed into **Issue tracker**.
