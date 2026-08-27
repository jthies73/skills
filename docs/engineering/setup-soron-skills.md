## What it does

Configures one repo for Soron's engineering workflow: GitLab issues through `glab`, the kanban
mapping that puts Deliverables on the `DEV` group's board, and the single-context domain doc layout.
It writes `docs/agents/issue-tracker.md`, `docs/agents/triage-labels.md`, and `docs/agents/domain.md`,
then adds an `## Agent skills` section to the repo's `CLAUDE.md` or `AGENTS.md` pointing at them.

It asks almost nothing. Every question the general
[setup-matt-pocock-skills](https://aihero.dev/skills-setup-matt-pocock-skills) puts to you is a
decision Soron already made once, org-wide, so this skill carries the answers in a table and spends
its run checking the repo in front of it instead. The only questions left are the two that genuinely
vary: whether the project sits under `DEV`, and whether it is a monorepo.

## When to reach for it

You invoke this by typing `/setup-soron-skills`, and the agent will not reach for it on its own.

Reach for it once per repo, before the first time anyone runs `/triage`, `/to-spec`, `/to-tickets`,
or `/implement` there. Those skills read the three files this one writes, and without them they have
no idea where issues live or what a ready card looks like.

For a repo outside Soron, or one where you actually want to be asked the questions, use
[setup-matt-pocock-skills](https://aihero.dev/skills-setup-matt-pocock-skills) instead. Run one or
the other, never both: they write the same three files.

## Prerequisites

`glab` installed and authenticated against Soron's self-hosted GitLab host. The skill checks this
first and stops if it fails, because every later step writes through `glab`.

The nine board labels need to exist as **group** labels on `DEV`. On the first repo the skill offers
to create the missing ones; from the second repo onward it finds them all and says so in a line.

## The settled answers

The skill's value is the questions it deletes. They live in one table in its `SKILL.md`, which is the
single place to change how Soron is set up:

| Decision                            | Soron's answer                                              |
| ----------------------------------- | ----------------------------------------------------------- |
| Issue tracker                       | GitLab, self-hosted, via `glab`                             |
| Kanban board                        | Yes, the board-shaped triage mapping                        |
| Where the board labels live         | Group labels on `DEV`                                       |
| Merging closes the referenced issue | Yes: the merge is the Review to Done move                   |
| Domain docs                         | Single-context, `CONTEXT.md` and `docs/adr/` at the root    |

Changing one for a single repo means editing the file it landed in, after the run. Changing one for
Soron means editing that table, so the next repo inherits it.

## The workflow guide

The skill ships with [WORKFLOW.md](https://github.com/jthies73/skills/blob/main/skills/engineering/setup-soron-skills/WORKFLOW.md),
the guide to actually working the board: the two levels of work, the six lists and who moves a card
into each, the route from idea to merge, and the rules that get broken most. Step 5 of the skill
points every dev at it.

Its organising idea is one sentence: **the column tells the truth about the work.** The board exists
so someone who never opens a repo can answer "who is on what, and in what stage" without asking, and
every rule in the guide is one instance of protecting that.

## Common questions

**Do I still need to run `/setup-matt-pocock-skills`?**

No. Run one or the other. This skill writes the same three files, from the same seed templates,
with Soron's answers already filled in.

**What if my repo is not under the `DEV` group?**

The skill notices and asks which group holds the board for it. A project under no board group gets
project labels instead, and the skill says so plainly, because that repo's cards will not appear on
the cross-repo board.

**Can I re-run it?**

Yes. It reads `docs/agents/` first and treats an existing setup as a re-sync, editing the
`## Agent skills` section in place rather than appending a second one.

**My card has the right labels but is not on the board. Why?**

Almost always a project label where a group label was needed. A group-level board can only build its
lists from group labels, so a project label with the identical name is invisible to it. Create the
label on `DEV` and re-apply.

## It's working if

- The second repo you set up takes under a minute, and the label step is one line saying all nine are
  present.
- No dev on the team has been asked which issue tracker to use.
- The `DEV` board shows cards from every configured repo, with no stragglers whose labels look right
  up close.
- A new dev's first question about the flow is answered by `WORKFLOW.md` rather than by you.

## Where it fits

A **run-once setup**, the same role as
[setup-matt-pocock-skills](https://aihero.dev/skills-setup-matt-pocock-skills), which is its upstream
and the skill to use anywhere that is not a Soron repo. Its immediate neighbour downstream is
[triage](https://aihero.dev/skills-triage), the first skill most repos reach for once the mapping
exists, because it is the door into the board's ready column.

For the whole map of skills and how they connect, see
[ask-matt](https://aihero.dev/skills-ask-matt).
