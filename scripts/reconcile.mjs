// The terminal-label invariant (ADR-0004), as a pure function.
//
// An open Issue carries no terminal label. A closed Issue carries exactly one
// terminal label (`Done` or `wontfix`) and no workflow label. This is the one
// tested seam: no network access, no host SDK, no I/O. The GitHub and GitLab
// adapters normalize an Issue into the shape below, call this, and apply
// whatever it returns; they hold no rules of their own.

export const LABEL_MAPPING = {
  // Ordered least to most advanced. The first is where an untriaged or
  // reopened Deliverable belongs; a Deliverable carrying more than one is
  // resolved by keeping the last of these present.
  columns: ["Backlog", "TODO", "In Progress", "Review", "On Hold"],
  // Carried by a Deliverable alongside a column label, or alone on a
  // Subtask. Counted as a workflow label either way: stripped on close.
  readiness: ["ready-for-agent", "ready-for-human"],
  terminal: { done: "Done", wontfix: "wontfix" },
};

/**
 * @param {{ state: "open" | "closed", labels: string[], closedByMerge: boolean }} issue
 * @param {typeof LABEL_MAPPING} mapping
 * @returns {{ add: string[], remove: string[], report: string[] }}
 */
export function reconcile(issue, mapping = LABEL_MAPPING) {
  const { state, labels, closedByMerge } = issue;
  const workflowLabels = new Set([...mapping.columns, ...mapping.readiness]);
  const terminalLabels = new Set(Object.values(mapping.terminal));

  const add = [];
  const remove = [];
  const report = [];

  if (state === "closed") {
    for (const label of labels) {
      if (workflowLabels.has(label)) remove.push(label);
    }

    const hasTerminal = labels.some((label) => terminalLabels.has(label));
    if (!hasTerminal) {
      if (closedByMerge) {
        add.push(mapping.terminal.done);
      } else {
        // Closed with no terminal label and no merge behind it: a human or
        // an API call closed it, and intent can't be derived. Report it
        // rather than guess.
        report.push("closed-without-terminal-label");
      }
    }
  } else {
    for (const label of labels) {
      if (terminalLabels.has(label)) remove.push(label);
    }

    const columnsPresent = mapping.columns.filter((column) => labels.includes(column));
    if (columnsPresent.length > 1) {
      const keep = columnsPresent[columnsPresent.length - 1];
      for (const column of columnsPresent) {
        if (column !== keep) remove.push(column);
      }
    } else if (columnsPresent.length === 0) {
      // A Subtask carries a readiness label and no column label by design
      // (that's what keeps it off the board): only a bare Deliverable gets
      // Backlog restored.
      const isSubtask = mapping.readiness.some((label) => labels.includes(label));
      if (!isSubtask) add.push(mapping.columns[0]);
    }

    if (closedByMerge) {
      // The reverse defect: a merge closed this behind the scenes, but the
      // issue itself is still open. Also reported rather than guessed.
      report.push("open-with-merged-close");
    }
  }

  return { add, remove, report };
}
