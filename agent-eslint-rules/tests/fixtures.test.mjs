import test from "node:test";
import assert from "node:assert/strict";
import { cpSync, existsSync, readFileSync, rmSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { tmpdir } from "node:os";
import { FIXTURES_DIR, TESTS_DIR, assertDepsInstalled, createWorkspace } from "./lib/workspace.mjs";
import { grade } from "./lib/grade.mjs";

assertDepsInstalled();

const manifest = JSON.parse(readFileSync(resolve(TESTS_DIR, "tasks/manifest.json"), "utf8"));
const root = resolve(tmpdir(), `agent-lint-fixtures-${process.pid}`);

test.after(() => rmSync(root, { recursive: true, force: true }));

// The three arms have to differ in exactly one thing each, and the style guide
// has to arrive as part of the repo rather than as part of the agent's diff -
// otherwise CLAUDE.md itself would show up in changedFiles and the arms would no
// longer be comparable.
test("each arm differs from the others in exactly one artefact", async () => {
  const built = {};
  for (const treatment of ["no-lint", "prompt", "lint"]) {
    built[treatment] = await createWorkspace({ taskId: manifest.tasks[0].id, root, treatment, replicate: 9 });
  }

  assert.ok(!existsSync(resolve(built["no-lint"], "CLAUDE.md")), "no-lint arm must not be told the style");
  assert.ok(!existsSync(resolve(built["no-lint"], ".claude")), "no-lint arm must have no hook");

  const styleGuide = resolve(built.prompt, "CLAUDE.md");
  assert.ok(existsSync(styleGuide), "prompt arm needs the style guide");
  assert.ok(!existsSync(resolve(built.prompt, ".claude")), "prompt arm must have no hook");
  for (const rule of ["no comments", "numeric literals", "3 parameters", "100 lines"]) {
    assert.match(readFileSync(styleGuide, "utf8"), new RegExp(rule), `style guide must state: ${rule}`);
  }

  assert.ok(existsSync(resolve(built.lint, ".claude/hooks/agent-lint-changed-file.mjs")), "lint arm needs the hook");
  assert.ok(!existsSync(resolve(built.lint, "CLAUDE.md")), "lint arm must not also be told the style in prose");

  const verdict = grade({ workspace: built.prompt, taskId: manifest.tasks[0].id });
  assert.ok(
    !verdict.changedFiles.includes("CLAUDE.md"),
    "the style guide belongs to the baseline commit, not to the agent's diff",
  );
});

// A benchmark task is only usable if all three of these hold. If the check
// passes on the baseline the task measures nothing; if the reference solution
// fails it the check is wrong; and if the reference solution cannot satisfy the
// agent rules then the lint arm is being asked for something impossible and any
// cost difference it shows is meaningless.
for (const task of manifest.tasks) {
  test(`${task.id}: the prompt asks for something the baseline does not already do`, async () => {
    const workspace = await createWorkspace({
      taskId: task.id,
      root,
      treatment: "baseline",
      replicate: 1,
    });
    const verdict = grade({ workspace, taskId: task.id });
    assert.equal(verdict.taskPassed, false, "check.mjs must fail on the untouched fixture");
    assert.equal(verdict.residualViolations, 0, "the untouched fixture must be lint-clean");

    const prompt = await readFile(resolve(FIXTURES_DIR, task.id, "prompt.md"), "utf8");
    for (const word of ["comment", "magic number", "lint", "eslint", "max-params", "self-document"]) {
      assert.ok(
        !prompt.toLowerCase().includes(word),
        `prompt must not mention "${word}" - it would measure instruction-following, not the rules`,
      );
    }
  });

  test(`${task.id}: the reference solution passes the check and the agent rules`, async () => {
    const reference = resolve(FIXTURES_DIR, task.id, "reference");
    assert.ok(existsSync(reference), `task ${task.id} needs a reference/ solution`);

    const workspace = await createWorkspace({
      taskId: task.id,
      root,
      treatment: "reference",
      replicate: 1,
    });
    cpSync(reference, workspace, { recursive: true });

    const verdict = grade({ workspace, taskId: task.id });
    assert.equal(verdict.taskPassed, true, `reference solution fails check.mjs:\n${verdict.taskCheckOutput}`);
    assert.equal(
      verdict.residualViolations,
      0,
      `reference solution violates the agent rules:\n${JSON.stringify(verdict.residualDetail, null, 2)}`,
    );
    assert.equal(verdict.accepted, true);
  });

  test(`${task.id}: the obvious solution really does trip the declared rules`, async () => {
    const naive = resolve(FIXTURES_DIR, task.id, "naive");
    assert.ok(existsSync(naive), `task ${task.id} needs a naive/ solution`);

    const workspace = await createWorkspace({
      taskId: task.id,
      root,
      treatment: "naive",
      replicate: 1,
    });
    cpSync(naive, workspace, { recursive: true });

    const verdict = grade({ workspace, taskId: task.id });
    assert.equal(
      verdict.taskPassed,
      true,
      `the naive solution must be behaviourally correct, otherwise it is not the obvious answer:\n${verdict.taskCheckOutput}`,
    );
    for (const ruleId of task.pressure) {
      assert.ok(
        verdict.residualByRule[ruleId] > 0,
        `task claims pressure on ${ruleId} but the naive solution does not trip it: ${JSON.stringify(verdict.residualByRule)}`,
      );
    }
    assert.equal(verdict.accepted, false);
  });
}
