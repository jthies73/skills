# Triage Labels

The skills speak in canonical triage roles. This file maps each role to the label strings this
repo's tracker actually uses. A role maps to **zero or more** labels: apply all of them, and a role
mapping to none is represented by the absence of any state label.

This is the **board** mapping, for a repo run off a kanban board. Its shape comes entirely from the
right-hand columns: the skills are unchanged, they just read a different mapping. For a repo with no
board, use [triage-labels-flat.md](./triage-labels-flat.md) instead.

## The board

Six lists. One card per merge request.

| List        | Label         | Carried by                   |
| ----------- | ------------- | ---------------------------- |
| Backlog     | `Backlog`     | Deliverable                  |
| TODO        | `TODO`        | Deliverable                  |
| In Progress | `In Progress` | Deliverable                  |
| Review      | `Review`      | Deliverable                  |
| On Hold     | `On Hold`     | Deliverable                  |
| Done        | *(closed)*    | Deliverable, closed by merge |

**Column labels are exclusive, and live on Deliverables only.** A **Subtask** never carries one,
which is the whole mechanism keeping subtasks off the board. It needs no work-item support, so it
behaves identically on GitHub and on any GitLab version.

**Done is the closed state, not a label.** Both hosts give a Closed list for free, so a `Done` label
would buy a column that already exists plus a ritual to keep it honest. This is why the tracker
config sets **merging closes the referenced issue** to `yes`: the human reviews the diff and merges,
and that merge *is* the Review to Done transition.

## State roles

| Canonical role    | Labels on a Deliverable   | Meaning here                                            |
| ----------------- | ------------------------- | ------------------------------------------------------- |
| `needs-triage`    | `Backlog`                 | The Backlog column: filed, not yet refined               |
| `needs-info`      | `On Hold`                 | Waiting on the reporter, or blocked on anything else     |
| `ready-for-agent` | `TODO`, `ready-for-agent` | Refined, spec filled, subtasks published, agent may start |
| `ready-for-human` | `TODO`, `ready-for-human` | Same, but needs judgment, access, or manual testing      |
| `wontfix`         | `wontfix`, plus closed    | Rejected, as distinct from closed because it shipped      |

`TODO` is the board's ready column, so both ready roles carry it, and the second label says which
kind of ready.

`needs-triage` carries a real `Backlog` label, where Done does not, because a label-driven board
cannot build a list out of the *absence* of a label: unlabelled work renders nowhere. Done gets away
with it because both hosts give a Closed list for free. Backlog has no such freebie, so the choice
is a label or no column. What it costs is that a freshly filed issue arrives carrying nothing, which
is what the discovery rule below has to absorb.

`wontfix` carries a real label because Done is the closed state: without it, closed-and-shipped and
closed-and-discarded would be indistinguishable, and the Closed list could not be read as Done.
With it, everything closed that is not `wontfix` is done.

## In-flight roles

Not optional on a board: `In Progress` and `Review` are columns, so the roles that move a card into
them have to be named.

| Role          | Labels on a Deliverable | Set by                                     |
| ------------- | ----------------------- | ------------------------------------------ |
| `in-progress` | `In Progress`           | `implement`, when it claims the Deliverable |
| `in-review`   | `Review`                | `land-the-work`, when the request opens     |

Nothing moves a card out of `Review`. The human reviews the diff and merges, and the closing
keyword in the request description does the rest.

## Readiness on a Subtask

A **Deliverable** carries a readiness label in full, as part of its ready role above. That is the
**grab gate**: `TODO` + `ready-for-agent` is what tells `implement` an agent may start.

**Every Subtask** carries a bare `ready-for-agent` or `ready-for-human` and **no column label**.
Not only the exceptions: a Subtask with no labels at all would be indistinguishable from a bare,
never-triaged issue in every label-based query, and identifying it instead by parentage means a
host-specific, version-specific lookup on every discovery pass. One label per Subtask buys a
discovery rule that is one line and works everywhere.

This is the one place a label is applied outside its role: the readiness label is the half of the
ready role that says *which kind* of ready, and a subtask may carry that half alone. On the
Deliverable the label means **may an agent start this**; on a Subtask it means **who does this
step**.

A Deliverable that is mostly agent work with one human-only step is therefore
`TODO` + `ready-for-agent`, with that one subtask labelled `ready-for-human` and the rest
`ready-for-agent`. `implement` works the subtasks in order, and stops at that one rather than
guessing.

**Discovery rule.** Untriaged work is an issue carrying `Backlog`, **or** carrying no column label
and no readiness label, and those two are the only things the untriaged bucket should contain. A
Subtask always carries a readiness label, so it never surfaces as triage work; a Deliverable in any
other column carries that column's label, so it doesn't either.

The second half of that rule is the price of labelling Backlog: an issue filed through the host's
UI, by a bot, or by an external reporter arrives bare, and a bare issue is on no board. So `triage`
applies `Backlog` to a bare issue the first time it surfaces one, which is the role that issue was
already in. Set the host's issue templates to apply `Backlog` on creation and most issues never take
that path.

## Containers

| Label  | Meaning                                                                    |
| ------ | -------------------------------------------------------------------------- |
| `epic` | Holds sibling Deliverables. No column label, so it is not on the board.     |

Used only in the overflow case: where a spec turns out to be more than one shippable merge request,
`to-tickets` creates sibling Deliverables with blocking edges between them, and the original issue
takes `epic` and leaves the board. The common case is two levels, and never needs this.

## Categories

| Canonical category | Labels in our tracker |
| ------------------- | ---------------------- |
| `bug`               | `bug`                  |
| `enhancement`       | *(none)*               |

`bug`-or-nothing: the absence of `bug` is what "not a bug" means, so enhancements need no label.

## Priority

`high`, `medium`, `low` may exist on the tracker. They are human-applied, and no skill reads or sets
them.

## Where these labels live

Ten labels: `Backlog`, `TODO`, `In Progress`, `Review`, `On Hold`, `ready-for-agent`,
`ready-for-human`, `wontfix`, `bug`, `epic`.

**On GitLab, a group-level board can only build its lists from group labels.** Project labels are
invisible to it. So where one board spans many repos in a group, create all ten as **group**
labels, once, and every repo's copy of this file just names them. Creating them per project means
creating them N times, and they will drift.

Edit the right-hand columns to match the vocabulary you actually use, and keep them honest: a table
asserting labels nobody created is worse than no table, because every skill reads it as fact.
