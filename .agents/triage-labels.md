# Triage Labels

The skills speak in canonical triage roles. This file maps each role to the label strings this
repo's tracker actually uses. A role maps to **zero or more** labels: apply all of them, and a role
mapping to none is represented by the absence of any state label.

This repo runs off a board (GitHub Issues on `jthies73/skills`). Its shape comes entirely from the
right-hand columns: the skills are unchanged, they just read this mapping.

**Verified against the tracker on 2026-08-28.** All eleven labels this mapping names exist.

## The board

Six lists. One card per merge request.

| List        | Label         | Carried by                   |
| ----------- | ------------- | ----------------------------- |
| Backlog     | `Backlog`     | Deliverable                  |
| TODO        | `TODO`        | Deliverable                  |
| In Progress | `In Progress` | Deliverable                  |
| Review      | `Review`      | Deliverable                  |
| On Hold     | `On Hold`     | Deliverable                  |
| Done        | `Done`, plus closed | Deliverable, closed by merge |

**Column labels are exclusive, and live on Deliverables only.** A **Subtask** never carries one,
which is the whole mechanism keeping subtasks off the board. It needs no work-item support, so it
behaves identically on GitHub and on any GitLab version.

**The terminal-label invariant.** An open Issue carries no terminal label. A closed Issue carries
exactly one **terminal label**, `Done` or `wontfix`, and no workflow label (no column label, and no
readiness label on a Subtask). The two terminal labels are mutually exclusive. This reverses the
earlier "Done is the closed state, not a label" convention, recorded in
[ADR-0004](adr/0004-terminal-labels-on-close.md): closing a card no longer implies `Done` by the
absence of `wontfix`, it requires the label. A scheduled reconciliation sweep applies what it can
derive (stripping workflow labels from a closed Issue, adding `Done` where a merge closed it) and
reports what it can't (a closed Issue with neither terminal label, or an open Issue with a merged
closing request behind it) rather than guessing.

## State roles

| Canonical role    | Labels on a Deliverable   | Meaning here                                            |
| ----------------- | ------------------------- | ------------------------------------------------------- |
| `needs-triage`    | `Backlog`                 | The Backlog column: filed, not yet refined               |
| `needs-info`      | `On Hold`                 | Waiting on the reporter, or blocked on anything else     |
| `ready-for-agent` | `TODO`, `ready-for-agent` | Refined, spec filled, subtasks published, agent may start |
| `ready-for-human` | `TODO`, `ready-for-human` | Same, but needs judgment, access, or manual testing      |
| `done`            | `Done`, plus closed       | Shipped: the merge that closed it is the Review to Done move |
| `wontfix`         | `wontfix`, plus closed    | Rejected, as distinct from `done` because it shipped nothing |

`TODO` is the board's ready column, so both ready roles carry it, and the second label says which
kind of ready.

`needs-triage` carries a real `Backlog` label, because a label-driven board cannot build a list out
of the *absence* of a label: unlabelled work renders nowhere. What it costs is that a freshly filed
issue arrives carrying nothing, which is what the discovery rule below has to absorb.

`done` and `wontfix` both carry real labels for the same reason: a label-driven board (and any
skill or query reading the tracker) cannot tell closed-and-shipped from closed-and-rejected out of
an absence either. The reconciliation sweep is what keeps `Done` honest without a human ritual: see
the terminal-label invariant above.

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

Eleven labels: `Backlog`, `TODO`, `In Progress`, `Review`, `On Hold`, `ready-for-agent`,
`ready-for-human`, `Done`, `wontfix`, `bug`, `epic`.

All eleven are **repository** labels here: GitHub has no organisation-level labels, so a single
repo's board reads them directly. On GitLab a group-level board can only build its lists from
**group** labels, which is where a board spanning many repos in a group would put them.

Keep the right-hand columns honest: a table asserting labels nobody created is worse than no table,
because every skill reads it as fact.
