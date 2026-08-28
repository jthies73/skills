---
"mattpocock-skills": patch
---

Guard `triage`'s two label-mutating steps ("Apply the outcome" and "Quick state override") against applying a column label (e.g. `TODO`) to a Subtask. The rule that Subtasks never carry a column label was already documented, but only enforced in the discovery/listing step; naming a Subtask's issue number directly (`"move #42 to ready-for-agent"`) bypassed it and stamped the full Deliverable role, column label included, onto the Subtask.
