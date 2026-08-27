# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root: the glossary.
- **`.agents/adr/`**: read ADRs that touch the area you're about to work in.

This repo is **single-context**: one `CONTEXT.md`, one ADR directory. There is no `CONTEXT-MAP.md`
and no per-context glossary.

Note the path: ADRs live in **`.agents/adr/`**, not `docs/adr/`. `docs/` is the published
human-facing docs tree (`docs/engineering/`, `docs/productivity/`, one page per promoted skill,
served at `aihero.dev/skills-<name>`), so agent-facing material lives under `.agents/` instead.
Most skills' prose says `docs/agents/`; in this repo that means `.agents/`.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest
creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and
`/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

## File structure

```
/
├── CLAUDE.md            ← repo instructions (AGENTS.md is a symlink to it)
├── CONTEXT.md           ← glossary
├── .agents/
│   ├── adr/
│   │   ├── 0001-explicit-setup-pointer-only-for-hard-dependencies.md
│   │   ├── 0002-ship-as-a-claude-code-plugin.md
│   │   └── 0003-deliverable-is-the-unit-of-delivery.md
│   ├── domain.md        ← this file
│   ├── issue-tracker.md
│   ├── triage-labels.md
│   ├── install-block.md
│   ├── invocation.md
│   └── writing-docs.md
├── docs/                ← published docs, mirrors the promoted buckets
│   ├── engineering/
│   └── productivity/
└── skills/
    ├── engineering/
    ├── productivity/
    ├── misc/
    ├── in-progress/
    └── deprecated/
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a
test name), use the term as defined in `CONTEXT.md`. Don't drift to synonyms the glossary explicitly
avoids: an **Issue tracker** is never a "backlog backend", and an **Issue** is not a "ticket" except
when quoting an external system or naming a **Decision ticket**.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language
the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0002 (ship as a Claude Code plugin), but worth reopening because…_
