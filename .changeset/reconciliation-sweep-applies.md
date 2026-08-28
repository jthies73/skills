---
"mattpocock-skills": patch
---

A scheduled GitHub Actions workflow (`.github/workflows/reconcile.yml`, every 15 minutes and on manual dispatch) now enforces the terminal-label invariant from ADR-0004: it strips workflow labels from a closed Issue, applies `Done` where a merge closed it, restores `Backlog` to a reopened Issue with no column label, and resolves duplicate column labels to the most advanced one. Where intent can't be derived (a closed Issue with no terminal label and no merge behind it, or the reverse: an open Issue with a merged closing request behind it), it writes nothing and reports the issue in one collected job-summary line instead of guessing or commenting per issue. A run over a tracker that already satisfies the invariant writes and reports nothing.

The rules live once, in `scripts/reconcile.mjs`, a pure function with no network access or host SDK; `scripts/gh-reconcile.mjs` is the GitHub adapter, normalizing Issues via GraphQL and applying whatever `reconcile` returns. `node --test scripts/*.test.mjs` (via `npm test`) covers every rule.
