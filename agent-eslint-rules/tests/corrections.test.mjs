import test from "node:test";
import assert from "node:assert/strict";
import { CORRECTION_STYLES, correctionPrompt } from "./lib/corrections.mjs";

const clean = { taskPassed: true, residualViolations: 0, residualDetail: [], taskCheckOutput: "" };
const dirty = {
  taskPassed: true,
  residualViolations: 2,
  residualDetail: [
    { file: "src/retry.ts", line: 12, ruleId: "@typescript-eslint/no-magic-numbers", message: "No magic number: 100." },
    { file: "src/retry.ts", line: 9, ruleId: "agent/no-comments", message: "Agent-authored code must be self-documenting." },
  ],
  taskCheckOutput: "",
};
const broken = { taskPassed: false, residualViolations: 0, residualDetail: [], taskCheckOutput: "AssertionError: makes exactly 4 attempts\n3 !== 4" };

test("acceptable work is not sent back", () => {
  assert.equal(correctionPrompt({ verdict: clean, style: "standard" }), null);
});

test("broken behaviour outranks style, in both styles", () => {
  for (const style of CORRECTION_STYLES) {
    const correction = correctionPrompt({ verdict: broken, style });
    assert.equal(correction.kind, "behaviour");
    assert.match(correction.prompt, /does not behave correctly/);
    assert.match(correction.prompt, /makes exactly 4 attempts/);
  }
});

test("the standard correction is what a reviewer says from memory, not lint output", () => {
  const correction = correctionPrompt({ verdict: dirty, style: "standard" });
  assert.equal(correction.kind, "standard");
  assert.match(correction.prompt, /no comments/);
  assert.match(correction.prompt, /named constants/);
  assert.ok(!correction.prompt.includes("src/retry.ts"), "must not leak the linter's file and line detail");
  assert.ok(!correction.prompt.includes("no-magic-numbers"), "must not leak rule ids");
});

test("the lint correction pastes the exact violations as a lower bound", () => {
  const correction = correctionPrompt({ verdict: dirty, style: "lint" });
  assert.equal(correction.kind, "lint");
  assert.match(correction.prompt, /src\/retry\.ts:12/);
  assert.match(correction.prompt, /agent\/no-comments/);
});

test("the standard correction is identical for every dirty run", () => {
  const other = { ...dirty, residualViolations: 7, residualDetail: [] };
  assert.equal(
    correctionPrompt({ verdict: dirty, style: "standard" }).prompt,
    correctionPrompt({ verdict: other, style: "standard" }).prompt,
    "a per-run correction would make the arms incomparable",
  );
});
