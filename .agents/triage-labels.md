# Triage Labels

The skills speak in terms of five canonical triage roles. This file maps those roles to the
actual label strings used in this repo's issue tracker (GitHub Issues on `jthies73/skills`).

**Verified against the tracker on 2026-08-26.** The right-hand column says what is really
there, not what the roles are called. A row marked *not created yet* means `/triage` creates
the label the first time it needs it. Do not assume a role's label exists because its name
looks obvious.

| Canonical role    | Label in our tracker | Status          | Meaning                                  |
| ----------------- | -------------------- | --------------- | ---------------------------------------- |
| `needs-triage`    | `needs-triage`       | not created yet | Maintainer needs to evaluate this issue  |
| `needs-info`      | `needs-info`         | not created yet | Waiting on reporter for more information |
| `ready-for-agent` | `ready-for-agent`    | not created yet | Fully specified, ready for an AFK agent  |
| `ready-for-human` | `ready-for-human`    | not created yet | Requires human implementation            |
| `wontfix`         | `wontfix`            | **exists**      | Will not be actioned                     |

Categories, both from GitHub's stock set:

| Canonical category | Label in our tracker | Status     |
| ------------------ | -------------------- | ---------- |
| `bug`              | `bug`                | **exists** |
| `enhancement`      | `enhancement`        | **exists** |

When a skill mentions a role (e.g. "apply the AFK-ready triage label"), use the corresponding
label string from this table.

Edit the right-hand column to match whatever vocabulary you actually use, and keep the Status
column honest: a table that asserts labels nobody created is worse than no table, because
every skill then reads it as fact.
