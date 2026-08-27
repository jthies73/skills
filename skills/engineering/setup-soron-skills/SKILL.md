---
name: setup-soron-skills
description: "Configure this repo for Soron's engineering workflow: GitLab issues, the DEV group's kanban board, and the domain doc layout. Run once per repo."
disable-model-invocation: true
---

# Setup Soron Skills

Configure this repo for the engineering skills the way Soron runs them.

This is [`setup-matt-pocock-skills`](../setup-matt-pocock-skills/SKILL.md) with the answers already
given. Every question that skill asks is a decision Soron made once, org-wide, so none of them are
asked again here. What is left is checking the repo in front of you and writing the files.

New to the flow these files configure? Read [WORKFLOW.md](./WORKFLOW.md) first. It is the guide to
working the board, and this skill points every dev at it on the way out.

## The settled answers

| Decision                                | Soron's answer                                                                        |
| --------------------------------------- | ------------------------------------------------------------------------------------- |
| Issue tracker                           | GitLab, self-hosted. `glab` for every operation, host inferred from `git remote -v`.    |
| Kanban board                            | Yes. The board-shaped mapping: Backlog / TODO / In Progress / Review / On Hold, plus the closed state as Done. |
| Where the board labels live             | **Group** labels on `DEV`, created once and named by every repo under it.               |
| In-flight roles                         | Included. `In Progress` and `Review` are columns, so `implement` claims and `land-the-work` moves. |
| Merging closes the referenced issue     | Yes. The merge **is** the Review to Done move.                                          |
| Default reviewer                        | None.                                                                                   |
| MRs as a request surface                | No.                                                                                     |
| Domain docs                             | Single-context: `CONTEXT.md` and `docs/adr/` at the repo root.                          |

To change one of these for **one repo**, run the skill and edit the file it lands in afterwards. To
change one for **Soron**, edit this table, so the next repo gets it too.

## Process

### 1. Check `glab` reaches the host

Run `glab auth status`. Self-hosted GitLab needs the host configured, and every later step writes
through `glab`, so a failure here is the whole run.

If it reports no authenticated host for this repo's remote, stop. Give the dev the fix
(`glab auth login --hostname <host>` for the host in `git remote -v`) and go no further.

**Done when** `glab auth status` reports an authenticated host matching the repo's remote.

### 2. Explore

Read the repo; assume nothing:

- `git remote -v`: is this GitLab, and is the project path under the `DEV` group?
- `CLAUDE.md` and `AGENTS.md` at the root: which exists, and does either already carry an
  `## Agent skills` section?
- `docs/agents/`: a previous run's output. This makes the run a **re-sync**, not a first setup.
- `CONTEXT.md`, `CONTEXT-MAP.md`, `docs/adr/`.
- Monorepo signals: `pnpm-workspace.yaml`, a `workspaces` field in `package.json`, a populated
  `packages/*` each with its own `src/`.

Two findings change what you do, and nothing else does:

| Finding                             | What changes                                                                                   |
| ----------------------------------- | ------------------------------------------------------------------------------------------------ |
| The project is **not** under `DEV`  | Ask which group holds the board for this repo, and use that path in step 3. A project outside every board group gets project labels instead, and say so, because it will not appear on the cross-repo board. |
| Monorepo signals are present        | Ask whether the dev wants multi-context docs (a root `CONTEXT-MAP.md` pointing at per-context `CONTEXT.md` files) instead of the settled single-context layout. |

Absent both, ask nothing. Report what you found in a few lines and move on.

### 3. Verify the group labels

The mapping file you are about to write asserts nine labels exist. A table asserting labels nobody
created is worse than no table, because every skill reads it as fact.

List the group's labels with
`glab api "groups/DEV/labels?per_page=100"` (URL-encode a nested path, `dev%2Fplatform`), and report
**each of the nine by name** as present or missing:

`TODO`, `In Progress`, `Review`, `On Hold`, `ready-for-agent`, `ready-for-human`, `wontfix`, `bug`,
`epic`.

Offer to create the missing ones as **group** labels
(`glab api --method POST "groups/DEV/labels" -f name="TODO" -f color="#428BCA"`). Create nothing
without being asked. A group-level board can only build its lists from group labels, so never
resolve a missing one by creating it on the project.

On repo two onward this step finds all nine present and is one line, which is the whole reason they
live on the group.

**Done when** all nine labels are reported present or missing by name, and every missing one is
either created at group level or explicitly left.

### 4. Confirm, then write

Show the dev the three files and the agent-instruction block before writing anything, and let them
edit.

Build each file from the seed in the sibling skill folder, applying only the delta named beside it.
Read the seed rather than reproducing it here, so an upstream fix reaches Soron's repos on the next
pull:

| File                            | Seed                                                             | Soron delta                                                    |
| ------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------- |
| `docs/agents/issue-tracker.md`  | [`issue-tracker-gitlab.md`](../setup-matt-pocock-skills/issue-tracker-gitlab.md) | Substitute the group path (`DEV`, or the one step 2 found) into the group label operations. The seed's landing conventions already match the table above. |
| `docs/agents/triage-labels.md`  | [`triage-labels.md`](../setup-matt-pocock-skills/triage-labels.md) | Name `DEV` in the "Where these labels live" section.            |
| `docs/agents/domain.md`         | [`domain.md`](../setup-matt-pocock-skills/domain.md)              | None, unless step 2 settled on multi-context.                   |

Then add the block to whichever of `CLAUDE.md` / `AGENTS.md` already exists, editing in place if an
`## Agent skills` section is already there rather than appending a second one. If neither file
exists, ask which to create; never create `AGENTS.md` beside an existing `CLAUDE.md` or the reverse.

```markdown
## Agent skills

### Issue tracker

GitLab issues, via the `glab` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Board-shaped: the canonical roles map onto the DEV board's columns, and column labels sit on
Deliverables only. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` at the repo root and ADRs in `docs/adr/`. See `docs/agents/domain.md`.
```

**Done when** the three files exist, every label their tables name exists on the group, and the
agent-instruction file carries exactly one `## Agent skills` section.

### 5. Hand over the workflow

Tell the dev the repo is configured, and point them at [WORKFLOW.md](./WORKFLOW.md) for how the
board is actually worked: the two levels, who moves each card, and the rules that are easiest to
break. A configured repo with a dev who has not read it produces a board that lies, which is worse
than no board.
