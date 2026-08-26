# Triage Labels

The skills speak in canonical triage roles. This file maps each role to the label strings this
repo's tracker actually uses. A role maps to **zero or more** labels: apply all of them, and a role
mapping to none is represented by the absence of any state label.

This is the **kanban** variant of the mapping, for a repo already run off a board. Its shape comes
entirely from the right-hand column: the skills are unchanged, they just read a different mapping.

## State roles

| Canonical role    | Labels in our tracker    | Meaning here                                        |
| ----------------- | ------------------------- | ---------------------------------------------------- |
| `needs-triage`    | *(none)*                   | The backlog column: unlabelled means not yet refined |
| `needs-info`      | `On Hold`                  | Waiting on the reporter, or blocked on anything else  |
| `ready-for-agent` | `TODO`, `ready-for-agent`  | Refined and agent-grabbable                           |
| `ready-for-human` | `TODO`, `ready-for-human`  | Refined, but needs judgment, access, or manual testing |
| `wontfix`         | *(none)*                   | Closing is the whole of it; the closed state says it  |

Both ready roles carry the board's ready-column label, with a second label saying which kind of
ready. Mapping `needs-triage` and `wontfix` to nothing is what keeps a backlog column unlabelled
and a rejection a plain close.

## In-flight roles

Optional, for work already moving. Skills act on these only because they are named here: leave the
section out and `implement` and `land-the-work` touch no labels at all.

| Role          | Labels in our tracker | Set by                       |
| ------------- | ---------------------- | ----------------------------- |
| `in-progress` | `In Progress`          | `implement`, when it claims   |
| `in-review`   | `Review`               | `land-the-work`, on publish   |

## Categories

| Canonical category | Labels in our tracker |
| ------------------- | ---------------------- |
| `bug`               | `bug`                  |
| `enhancement`       | `enhancement`          |

Map either to *(none)* where the absence of the other is what carries the meaning.

Edit the right-hand columns to match the vocabulary you actually use, and keep them honest: a table
asserting labels nobody created is worse than no table, because every skill reads it as fact.
