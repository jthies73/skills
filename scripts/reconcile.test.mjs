import { test } from "node:test";
import assert from "node:assert/strict";
import { reconcile, LABEL_MAPPING } from "./reconcile.mjs";

function applyOps(labels, { add, remove }) {
  return labels.filter((label) => !remove.includes(label)).concat(add);
}

test("closed issue with a stale column label alongside an existing terminal label: strips the column label only", () => {
  const result = reconcile({ state: "closed", labels: ["Done", "In Progress"], closedByMerge: true });
  assert.deepEqual(result, { add: [], remove: ["In Progress"], report: [] });
});

test("closed issue, closed by merge, no terminal label yet: applies Done and strips the column label", () => {
  const result = reconcile({ state: "closed", labels: ["Review"], closedByMerge: true });
  assert.deepEqual(result, { add: ["Done"], remove: ["Review"], report: [] });
});

test("closed issue, closed by a human with no merge behind it: reports rather than guesses", () => {
  const result = reconcile({ state: "closed", labels: ["In Progress"], closedByMerge: false });
  assert.deepEqual(result, { add: [], remove: ["In Progress"], report: ["closed-without-terminal-label"] });
});

test("an ambiguous close never adds a terminal label", () => {
  const result = reconcile({ state: "closed", labels: [], closedByMerge: false });
  assert.equal(result.add.includes("Done"), false);
  assert.equal(result.add.includes("wontfix"), false);
  assert.deepEqual(result.report, ["closed-without-terminal-label"]);
});

test("an already-correct closed issue produces no operations", () => {
  const result = reconcile({ state: "closed", labels: ["Done"], closedByMerge: true });
  assert.deepEqual(result, { add: [], remove: [], report: [] });
});

test("a wontfix issue that is already correct produces no operations", () => {
  const result = reconcile({ state: "closed", labels: ["wontfix"], closedByMerge: false });
  assert.deepEqual(result, { add: [], remove: [], report: [] });
});

test("a reopened issue with no column label gets Backlog restored", () => {
  const result = reconcile({ state: "open", labels: [], closedByMerge: false });
  assert.deepEqual(result, { add: ["Backlog"], remove: [], report: [] });
});

test("a reopened issue still carrying a terminal label: removed, and Backlog restored", () => {
  const result = reconcile({ state: "open", labels: ["Done"], closedByMerge: false });
  assert.deepEqual(result, { add: ["Backlog"], remove: ["Done"], report: [] });
});

test("an issue with two column labels keeps the most advanced", () => {
  const result = reconcile({ state: "open", labels: ["TODO", "In Progress"], closedByMerge: false });
  assert.deepEqual(result, { add: [], remove: ["TODO"], report: [] });
});

test("a Subtask (readiness label, no column label) on close: readiness is a workflow label too", () => {
  const result = reconcile({ state: "closed", labels: ["ready-for-agent"], closedByMerge: false });
  assert.deepEqual(result, { add: [], remove: ["ready-for-agent"], report: ["closed-without-terminal-label"] });
});

test("a Subtask reopened with no column label is left off the board", () => {
  const result = reconcile({ state: "open", labels: ["ready-for-agent"], closedByMerge: false });
  assert.deepEqual(result, { add: [], remove: [], report: [] });
});

test("an open container (epic) with no column label is left off the board", () => {
  const result = reconcile({ state: "open", labels: ["epic"], closedByMerge: false });
  assert.deepEqual(result, { add: [], remove: [], report: [] });
});

test("an open issue with a merged closing request behind it is reported as the reverse defect", () => {
  const result = reconcile({ state: "open", labels: ["Review"], closedByMerge: true });
  assert.deepEqual(result, { add: [], remove: [], report: ["open-with-merged-close"] });
});

test("idempotence: applying the returned operations and re-running yields none", () => {
  const first = { state: "closed", labels: ["Review"], closedByMerge: true };
  const firstOps = reconcile(first);
  assert.deepEqual(firstOps, { add: ["Done"], remove: ["Review"], report: [] });

  const second = { ...first, labels: applyOps(first.labels, firstOps) };
  const secondOps = reconcile(second);
  assert.deepEqual(secondOps, { add: [], remove: [], report: [] });
});

test("idempotence holds for a reopened issue too", () => {
  const first = { state: "open", labels: ["Done"], closedByMerge: false };
  const firstOps = reconcile(first);
  assert.deepEqual(firstOps, { add: ["Backlog"], remove: ["Done"], report: [] });

  const second = { ...first, labels: applyOps(first.labels, firstOps) };
  const secondOps = reconcile(second);
  assert.deepEqual(secondOps, { add: [], remove: [], report: [] });
});

test("uses the exported LABEL_MAPPING by default", () => {
  assert.deepEqual(Object.keys(LABEL_MAPPING).sort(), ["columns", "containers", "readiness", "terminal"]);
  assert.equal(LABEL_MAPPING.terminal.done, "Done");
  assert.equal(LABEL_MAPPING.terminal.wontfix, "wontfix");
});
