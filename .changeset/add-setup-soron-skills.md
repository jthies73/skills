---
"mattpocock-skills": minor
---

Add **`setup-soron-skills`**, a Soron-flavoured setup skill, and the workflow guide that goes with it.

It is `setup-matt-pocock-skills` with the answers already given. Every question that skill asks is a decision Soron made once, org-wide, so they live in one table in the new skill's `SKILL.md` (GitLab through `glab`, the board-shaped mapping, group labels on `DEV`, merging closes the referenced issue, single-context docs) and the run spends its time on the repo in front of it instead. Only two things genuinely vary per repo, so only those get asked: whether the project sits under `DEV`, and whether it is a monorepo. The three files it writes are built from the same seeds `setup-matt-pocock-skills` uses, with the group path substituted in, so an upstream fix to a seed reaches Soron's repos on the next pull rather than being copied and left to drift.

Two things it does that the general skill does not. It checks `glab auth status` before anything else, because self-hosted GitLab needs the host configured and every later step writes through `glab`. And it treats an existing `docs/agents/` as a re-sync, editing the `## Agent skills` section in place rather than appending a second one, since a team skill gets run across many repos and more than once each.

`WORKFLOW.md` ships beside it: the guide to actually working the board, organised around one rule, **the column tells the truth about the work**. It covers the two levels (Deliverable and Subtask), the six lists and who moves a card into each, the readiness labels and the grab gate, the route from `/grill-with-docs` to the merge, and the seven rules that get broken most, each one an instance of that first rule. Step 5 of the skill points every dev at it, because a configured repo with a dev who has not read it produces a board that lies, which is worse than no board.

`ask-matt` now routes to whichever setup skill fits, and says plainly that you run one or the other and never both, since they write the same three files.
