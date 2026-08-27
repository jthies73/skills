# The Soron workflow

How work moves at Soron, from a thought in someone's head to a merged branch, and the rules that
keep the board honest while it does.

Read this once before your first ticket. Come back to "Rules that are easy to break" when something
feels off.

## The one rule above the others

**The column tells the truth about the work.**

Everything below is in service of that. The board exists so that one person who never opens a repo
can answer "who is working on what, and in what stage" by looking at it. A card in the wrong column
does not just mislead them: it makes every other card suspect, because a board you have to verify is
a board nobody reads.

Most of the rules further down are one instance of this rule. When you hit a case none of them
cover, decide by asking which move leaves the column truthful.

## The two levels

Work has exactly two levels. There is no third.

**A Deliverable** is one unit of delivery: **one issue, one branch, one merge request, one card,
several commits.** It is the only thing that appears on the board, and the only thing that carries a
column label.

**A Subtask** is a vertical slice inside a Deliverable. It is a child issue, sized so one fresh agent
session can finish it, worked **in order** on the Deliverable's branch, and closed as it completes.
Subtasks never carry a column label, which is exactly what keeps them off the board.

Why the Deliverable and not the Subtask is the unit is recorded in
[ADR-0003](../../../.agents/adr/0003-deliverable-is-the-unit-of-delivery.md), along with the
assumption it rests on: **a run of Subtasks lands within about two days.** If your Deliverables are
routinely taking a week, that is not you working slowly, it is the Deliverable being cut too large.
Cut smaller ones.

The common shape is two levels. The overflow shape is three: where a spec turns out to be more than
one shippable merge request, `/to-tickets` creates **sibling Deliverables** with blocking edges
between them, and the original issue takes `epic` and leaves the board. Blocking edges exist between
Deliverables and nowhere else. Inside a Deliverable, the sequence is the edge.

## The board

Six lists. One card per merge request.

| List            | Label         | What it means                          | Who moves a card in                                   |
| --------------- | ------------- | -------------------------------------- | ------------------------------------------------------- |
| **Backlog**     | _(none)_      | Raw. Not yet refined.                  | Anyone, by filing an issue.                             |
| **TODO**        | `TODO`        | Spec filled, Subtasks published, ready. | `/to-tickets` as its final step, or `/triage` directly. |
| **In Progress** | `In Progress` | Claimed, branch exists, work under way. | `/implement`, on its first write.                       |
| **Review**      | `Review`      | Merge request open, waiting on a human. | `/land-the-work`, when the request opens.               |
| **On Hold**     | `On Hold`     | Blocked on anything or anyone.          | `/triage`.                                              |
| **Done**        | _(closed)_    | Merged and shipped.                     | **A human, by merging.**                                |

Two things about this table are worth saying out loud.

**Done is the closed state, not a label.** GitLab gives a Closed list for free. `land-the-work`
writes `Closes #<Deliverable>` into the merge request, so merging closes the issue and that merge
**is** the Review to Done move. Nothing else performs it, and there is no weekly close-out ritual.

**`wontfix` carries a real label** for the same reason: with Done being "closed", a rejected issue
and a shipped one would look identical in the Closed list. Labelled, the rule reads cleanly:
everything closed that is not `wontfix` is done.

### Readiness, and the grab gate

Two labels sit alongside the column labels: `ready-for-agent` and `ready-for-human`.

On a **Deliverable** they are the **grab gate**. `TODO` + `ready-for-agent` is what tells
`/implement` an agent may start. `TODO` + `ready-for-human` means the same work is ready but wants
judgment, access, or manual testing that an agent does not have.

On a **Subtask** the same label answers a different question: **who does this step.** Every Subtask
carries one, not just the exceptions, so a Subtask is never mistaken for a raw Backlog issue in a
label query.

So a Deliverable that is mostly agent work with one human-only step is `TODO` + `ready-for-agent`,
with that one Subtask labelled `ready-for-human` and the rest `ready-for-agent`. `/implement` works
them in order and **stops** at that one rather than guessing.

### Where the labels live

All nine board labels are **group labels on `DEV`**, created once. A group-level board can only build
its lists from group labels, so a project label is invisible to it.

If you need a label that does not exist, add it to the group, never to the project. A project label
looks like it works, right up until the card does not appear on the board and nobody can explain
why.

## The route

The path most work travels. `/ask-matt` is the full router; this is the spine of it.

1. **`/grill-with-docs`** sharpens the idea by interview, leaving a paper trail in `CONTEXT.md` and
   ADRs.
2. **`/to-spec`** turns the thread into a spec and writes it into the Deliverable. It deliberately
   does **not** move the card to TODO: a spec with no Subtasks is not ready.
3. **`/to-tickets`** splits the spec into ordered Subtasks and then, as its final step, moves the
   Deliverable to TODO. That is what earns the ready column: a filled spec **and** published
   Subtasks.
4. **`/implement`**, once per Subtask, each in a fresh context window. It claims the Deliverable on
   its first run, takes its branch in a worktree of its own, drives `/tdd` internally, closes each
   Subtask as it finishes, and closes out with `/code-review`. It stops short of the commit.
5. **`/land-the-work`**, run in that worktree, writes a Conventional Commit and asks before
   publishing. Say yes and it opens the merge request and moves the card to Review.
6. **You merge.** The card closes and lands in Done.

Steps 1 to 3 belong in **one unbroken context window**: do not clear or compact until after
`/to-tickets`, so the grilling, the spec, and the Subtasks are all built on the same thinking. Each
`/implement` then starts fresh.

### The short route

Not everything needs a spec. Work small enough that the triage brief **is** the whole description
goes through `/triage` straight into TODO, then to `/implement`. That is the second door into the
ready column, and it is the right one for a typo fix, a config change, or a one-file bug.

The test is not size in lines. It is whether you can write, in the issue, everything the implementer
needs to know. If you cannot, it needs a spec.

## Rules that are easy to break

These are the ones that actually get broken. Each is an instance of the one rule at the top.

**1. Never build out of the Backlog.**

If a card has no column label, it has not been refined, and an agent building from it makes the board
lie about what is in flight. `/implement` refuses unrefined work no matter who named it, and it is
right to. The fix is not a flag to override it, it is thirty seconds of `/triage`.

**2. One Deliverable, one branch, one merge request.**

No merge request references a Subtask. No branch carries two Deliverables. The moment a branch holds
work from two cards, neither card's column is true, and the review has two unrelated diffs in it.

**3. Do not triage Subtasks.**

Triage is for issues **you did not create**: bug reports, incoming requests, anything raw.
`/to-tickets` output is already refined. `/triage` excludes Subtasks from discovery for exactly this
reason, and hand-triaging one puts a label on it that the board was designed to keep off.

**4. Clear context between Subtasks.**

Each Subtask is sized for one fresh session. Running two in the same window is how the second one
inherits the first one's assumptions and quietly goes wrong.

**5. Nothing moves a card out of Review except a human merging.**

Not the agent, not a label edit, not a "this is basically done". A human reads the diff and merges.
If you find yourself wanting to drag a card out of Review, what you want is either to merge it or to
send it back to In Progress with a reason.

**6. Blocked means On Hold, and On Hold means blocked.**

If you are waiting on someone else, a decision, a credential, or an external service, move the card.
A card sitting in In Progress for three days because you are blocked is the single most common way
the board goes stale, and it is invisible: nothing looks wrong until someone asks.

The exception, and it is a real one: `/implement` stopping at a `ready-for-human` Subtask leaves the
card **In Progress**, because it genuinely is. The branch exists, you hold it, and one step needs a
person. On Hold is for blocks that are **external** to you.

**7. Cut Deliverables that land in about two days.**

The whole design rests on this. A Deliverable that runs for a week has a Review column entry nobody
wants to read and a card that has been telling the same story for days.

## When something does not fit

| Situation                                              | What to do                                                                                                      |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| The spec turns out to be more than one merge request    | Let `/to-tickets` create sibling Deliverables with blocking edges. The original takes `epic` and leaves the board. |
| A Subtask needs a person (credentials, a dashboard, a cutover) | `/implement` stops and names `/wizard`. The card stays In Progress. Do that step, then continue.            |
| The work is too foggy to spec at all                    | `/wayfinder`. It produces decisions, not deliverables, and hands off to `/to-spec` when the way is clear.          |
| Something is broken and resists a first look            | `/diagnosing-bugs`, which refuses to theorise until it has a loop that goes red on the bug.                        |
| You are mid-build and realise the slice cannot ship alone | That is a signal about how the work was cut, not about how to build it. Ship it behind a flag; the flag is part of the slice. |
| A label you need does not exist                         | Create it on the `DEV` group, never on the project.                                                                |

## Signs it is working

- The board answers "who is on what" without anyone opening a repo or asking in chat.
- The Review column holds one coherent diff per card, and reviewing one takes a sitting, not a day.
- The Backlog is the only place unlabelled issues live.
- Nobody is running a close-out ritual, because merging closes the issue.
- A card that is blocked is visibly blocked, and someone notices.
- `/implement` picking up a card needs no explanation from you beyond the issue number.
