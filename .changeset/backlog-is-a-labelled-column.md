---
"mattpocock-skills": patch
---

Give the board mapping's **Backlog** a real `Backlog` label. It was previously the unlabelled issues, on the reasoning that the absence of a state label is self-maintaining: anything filed from anywhere is in the backlog by default, with no ritual to keep it honest, exactly as Done is the closed state rather than a `Done` label. That holds for Done because both hosts give a Closed list for free. It does not hold for Backlog: no board can build a list out of the *absence* of a label, so the column that was described in the mapping rendered nowhere on the actual board.

The cost is that a freshly filed issue still arrives bare, so `triage`'s discovery covers both: untriaged work is an issue carrying `Backlog`, **or** carrying no column label and no readiness label. When it surfaces a bare issue it applies `Backlog`, which is the role that issue was already in, so the card joins the board on first sight rather than sitting off it until someone refines it. Setting the host's issue templates to apply `Backlog` on creation keeps most issues off that path entirely.

The Subtask exclusion is unchanged: a Subtask carries a readiness label and no column label, so it never surfaces as triage work. The board vocabulary is now ten labels rather than nine.
