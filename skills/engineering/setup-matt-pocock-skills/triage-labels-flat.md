# Triage Labels

The skills speak in canonical triage roles. This file maps each role to the label strings this repo's issue tracker actually uses. A role maps to **zero or more** labels: apply all of them, and a role mapping to none is represented by the absence of any state label.

This is the **flat** mapping, for a repo with no board: one label per role, named after the role. For a repo run off a kanban board, use [triage-labels.md](./triage-labels.md) instead.

| Canonical role    | Labels in our tracker | Meaning                                  |
| ----------------- | --------------------- | ---------------------------------------- |
| `needs-triage`    | `needs-triage`        | Maintainer needs to evaluate this issue  |
| `needs-info`      | `needs-info`          | Waiting on reporter for more information |
| `ready-for-agent` | `ready-for-agent`     | Fully specified, ready for an AFK agent  |
| `ready-for-human` | `ready-for-human`     | Requires human implementation            |
| `wontfix`         | `wontfix`             | Will not be actioned                     |

| Canonical category | Labels in our tracker |
| ------------------- | ---------------------- |
| `bug`               | `bug`                  |
| `enhancement`       | `enhancement`          |

When a skill mentions a role (e.g. "apply the AFK-ready triage label"), use the corresponding label strings from these tables.

Edit the right-hand column to match whatever vocabulary you actually use. A role can map to several labels, or to none at all: see [triage-labels.md](./triage-labels.md) for the board mapping, where `ready-for-agent` costs two labels and `needs-triage` costs none.

## In-flight roles (optional)

Add this section to have `implement` claim tickets and `land-the-work` move them on publish. Leave it out, the default, and neither skill touches the tracker.

| Role          | Labels in our tracker | Set by                       |
| ------------- | ---------------------- | ----------------------------- |
| `in-progress` | `in-progress`          | `implement`, when it claims   |
| `in-review`   | `in-review`            | `land-the-work`, on publish   |
