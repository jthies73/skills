#!/usr/bin/env node
// GitHub adapter over the reconcile seam (ADR-0004). Fetches every Issue via
// GraphQL, normalizes it, calls reconcile, and either prints what it would
// do (default) or applies it (--apply). Holds no rules of its own; every
// rule lives in reconcile.mjs.

import { execFileSync } from "node:child_process";
import { appendFileSync } from "node:fs";
import { reconcile, LABEL_MAPPING } from "./reconcile.mjs";

const [owner, repo] = (process.env.GITHUB_REPOSITORY ?? "jthies73/skills").split("/");
const applyMode = process.argv.includes("--apply");

const ISSUES_QUERY = `
query($owner: String!, $repo: String!, $after: String) {
  repository(owner: $owner, name: $repo) {
    issues(first: 50, after: $after, states: [OPEN, CLOSED]) {
      pageInfo { hasNextPage endCursor }
      nodes {
        number
        title
        state
        labels(first: 20) { nodes { name } }
        timelineItems(itemTypes: [CLOSED_EVENT], last: 1) {
          nodes {
            ... on ClosedEvent {
              closer { __typename }
            }
          }
        }
      }
    }
  }
}`;

function fetchPage(after) {
  const args = ["api", "graphql", "-f", `query=${ISSUES_QUERY}`, "-F", `owner=${owner}`, "-F", `repo=${repo}`];
  if (after) args.push("-F", `after=${after}`);
  const stdout = execFileSync("gh", args, { encoding: "utf8", maxBuffer: 1024 * 1024 * 32 });
  return JSON.parse(stdout);
}

// The closed event's closer is a PullRequest or a Commit when a closing
// keyword did the work, and null (or absent) when a person or an API call
// closed it directly.
function normalize(node) {
  const state = node.state === "CLOSED" ? "closed" : "open";
  const labels = node.labels.nodes.map((label) => label.name);
  const closedEvent = node.timelineItems.nodes.at(-1);
  const closerType = closedEvent?.closer?.__typename;
  const closedByMerge = state === "closed" && (closerType === "PullRequest" || closerType === "Commit");
  return { number: node.number, title: node.title, state, labels, closedByMerge };
}

function fetchAllIssues() {
  const issues = [];
  let after;
  for (;;) {
    const data = fetchPage(after);
    const page = data.data.repository.issues;
    issues.push(...page.nodes.map(normalize));
    if (!page.pageInfo.hasNextPage) break;
    after = page.pageInfo.endCursor;
  }
  return issues;
}

function describe({ add, remove }) {
  const parts = [];
  if (add.length) parts.push(`add ${add.join(", ")}`);
  if (remove.length) parts.push(`remove ${remove.join(", ")}`);
  return parts.join("; ");
}

function applyChange(issue, { add, remove }) {
  const args = ["issue", "edit", String(issue.number), "--repo", `${owner}/${repo}`];
  for (const label of add) args.push("--add-label", label);
  for (const label of remove) args.push("--remove-label", label);
  execFileSync("gh", args, { encoding: "utf8" });
}

// One collected summary per run, not a comment per Issue: a stale tracker
// with a long backlog of ambiguous closes should not generate a
// notification storm. Written to the job summary when running in Actions,
// and to stdout either way.
function writeSummary(lines) {
  console.log(lines.join("\n"));
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (summaryPath) appendFileSync(summaryPath, lines.join("\n") + "\n");
}

function main() {
  const issues = fetchAllIssues();
  const changes = [];
  const reported = [];

  for (const issue of issues) {
    const ops = reconcile(issue, LABEL_MAPPING);
    if (ops.add.length || ops.remove.length) changes.push({ issue, ops });
    for (const reason of ops.report) reported.push({ issue, reason });
  }

  const lines = [`Scanned ${issues.length} issues on ${owner}/${repo} (${applyMode ? "apply" : "dry run"}).`];

  if (changes.length === 0 && reported.length === 0) {
    lines.push("Already satisfies the terminal-label invariant. No operations.");
    writeSummary(lines);
    return;
  }

  if (changes.length > 0) {
    lines.push("", `${changes.length} issue(s) ${applyMode ? "changed" : "would change"}:`);
    for (const { issue, ops } of changes) {
      if (applyMode) applyChange(issue, ops);
      lines.push(`  #${issue.number} ${issue.title}: ${describe(ops)}`);
    }
  }

  if (reported.length > 0) {
    lines.push("", `${reported.length} issue(s) can't be classified, and are only reported:`);
    for (const { issue, reason } of reported) {
      lines.push(`  #${issue.number} ${issue.title}: ${reason}`);
    }
  }

  writeSummary(lines);
}

main();
