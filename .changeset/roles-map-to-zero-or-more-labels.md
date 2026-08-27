---
"mattpocock-skills": patch
---

Let a canonical triage role map to zero or more label strings rather than exactly one, so a board-shaped tracker needs no new skill behaviour: map both ready roles to a `TODO` column label plus their own name, and map `needs-triage` and `wontfix` to nothing, and an untriaged issue is simply unlabelled while a rejected one is simply closed. `triage` states the rule and treats a role with no labels as the unlabelled bucket; `setup-matt-pocock-skills` ships a worked kanban mapping beside the default seed.

Two optional additions ride on the same idea. Naming an **in-flight role** (`in-progress`, `in-review`) in the mapping licenses `implement` to claim a ticket, self-assigning and moving it as its first write, and `land-the-work` to move referenced issues when it opens the request; omit them, the default, and neither skill touches the tracker. The tracker config gains a **default reviewer** passed to `gh pr create --reviewer`, and a **merging closes the referenced issue** flag: turn it off and `land-the-work` writes `Refs` throughout, leaving the close to a human.
