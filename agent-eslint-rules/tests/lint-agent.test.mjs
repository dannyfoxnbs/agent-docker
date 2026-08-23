import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { assertDepsInstalled } from "./lib/workspace.mjs";
import { repoWith } from "./lib/repo.mjs";

assertDepsInstalled();

// These tests exercise the shipped runner and hook, not the evaluation harness.
// Every invariant here is one DESIGN.md commits to and that nothing else guards.
const CLEAN_BASELINE = "export function existing(value: number): number {\n  return value + 1;\n}\n";

test("an untracked file is linted in full", () => {
  const repo = repoWith({ "src/existing.ts": CLEAN_BASELINE });
  repo.write("src/added.ts", "// new file\nexport function scale(value: number): number {\n  return value * 42;\n}\n");
  const { status, report } = repo.lint();
  assert.equal(status, 1);
  assert.equal(report.byRule["agent/no-comments"], 1);
  assert.equal(report.byRule["@typescript-eslint/no-magic-numbers"], 1);
});

test("pre-existing violations on untouched lines never block", () => {
  const repo = repoWith({
    "src/legacy.ts": "// legacy comment\nexport const legacy = 99;\n\nexport function edited(): number {\n  return 1;\n}\n",
  });
  repo.write(
    "src/legacy.ts",
    "// legacy comment\nexport const legacy = 99;\n\nexport function edited(): number {\n  return 2;\n}\n",
  );
  const { status, report } = repo.lint();
  assert.equal(report.byRule["agent/no-comments"], undefined, "the untouched comment is not reported");
  assert.equal(report.byRule["@typescript-eslint/no-magic-numbers"], 1, "only the changed line is reported");
  assert.deepEqual(report.violations.map((violation) => violation.line), [5]);
  assert.equal(status, 1);
});

test("a clean changed line exits 0 and reports nothing", () => {
  const repo = repoWith({ "src/existing.ts": CLEAN_BASELINE });
  repo.write("src/existing.ts", "export function existing(value: number): number {\n  return value - 1;\n}\n");
  const { status, report } = repo.lint();
  assert.equal(status, 0);
  assert.equal(report.total, 0);
});

test("inline eslint-disable cannot silence an agent rule", () => {
  const repo = repoWith({ "src/existing.ts": CLEAN_BASELINE });
  repo.write("src/added.ts", "/* eslint-disable */\n// eslint-disable-next-line @typescript-eslint/no-magic-numbers\nexport function grow(value: number): number {\n  return value * 7;\n}\n");
  const { report } = repo.lint();
  assert.ok(report.byRule["agent/no-comments"] >= 1, "the disable comments are themselves violations");
  assert.equal(report.byRule["@typescript-eslint/no-magic-numbers"], 1, "the rule still fires");
});

test("LINT_AGENT_ONLY_FILES narrows to one file", () => {
  const repo = repoWith({ "src/existing.ts": CLEAN_BASELINE });
  repo.write("src/a.ts", "export function a(value: number): number {\n  return value * 5;\n}\n");
  repo.write("src/b.ts", "export function b(value: number): number {\n  return value * 6;\n}\n");
  const scoped = repo.lint({ LINT_AGENT_ONLY_FILES: resolve(repo.dir, "src/a.ts") });
  assert.deepEqual(scoped.report.violations.map((violation) => violation.file), ["src/a.ts"]);
  assert.equal(repo.lint().report.total, 2, "unscoped still sees both");
});

test("LINT_AGENT_ALLOW_COMMENTS relaxes only the comment rule", () => {
  const repo = repoWith({ "src/existing.ts": CLEAN_BASELINE });
  repo.write("src/added.ts", "// deliberate\nexport function shift(value: number): number {\n  return value * 8;\n}\n");
  const { status, report } = repo.lint({ LINT_AGENT_ALLOW_COMMENTS: "1" });
  assert.equal(report.byRule["agent/no-comments"], undefined);
  assert.equal(report.byRule["@typescript-eslint/no-magic-numbers"], 1);
  assert.equal(status, 1, "the other rules still fail the run");
});

test("non-source extensions are ignored", () => {
  const repo = repoWith({ "src/existing.ts": CLEAN_BASELINE });
  repo.write("notes.md", "// not linted\nvalue = 42\n");
  assert.equal(repo.lint().report.total, 0);
});

test("the hook blocks with the violations and stays silent when clean", () => {
  const repo = repoWith({ "src/existing.ts": CLEAN_BASELINE }, { installHook: true });

  repo.write("src/added.ts", "// hook check\nexport function gap(value: number): number {\n  return value * 12;\n}\n");
  const blocked = repo.hook("src/added.ts");
  assert.equal(blocked.status, 0, "the hook itself always exits 0");
  const payload = JSON.parse(blocked.stdout);
  assert.equal(payload.decision, "block");
  assert.match(payload.reason, /agent\/no-comments/);
  assert.match(payload.reason, /no-magic-numbers/);

  repo.write("src/added.ts", "export function gap(value: number): number {\n  return value * 1;\n}\n");
  const clean = repo.hook("src/added.ts");
  assert.equal(clean.stdout, "", "a clean pass must add nothing to the model context");
});

test("the hook ignores files it should not lint", () => {
  const repo = repoWith({ "src/existing.ts": CLEAN_BASELINE }, { installHook: true });
  repo.write("notes.md", "// not linted\n");
  assert.equal(repo.hook("notes.md").stdout, "");
  assert.equal(repo.hook("src/missing.ts").stdout, "", "a deleted or absent path is skipped");
});

test("hook telemetry is written only when opted in", () => {
  const repo = repoWith({ "src/existing.ts": CLEAN_BASELINE }, { installHook: true });
  repo.write("src/added.ts", "// telemetry\nexport function total(value: number): number {\n  return value * 21;\n}\n");

  repo.hook("src/added.ts");
  assert.equal(existsSync(resolve(repo.dir, "telemetry.jsonl")), false, "no file without the env var");

  const telemetry = resolve(repo.dir, "telemetry.jsonl");
  repo.hook("src/added.ts", { LINT_AGENT_TELEMETRY: telemetry });
  repo.write("src/added.ts", "export function total(value: number): number {\n  return value * 1;\n}\n");
  repo.hook("src/added.ts", { LINT_AGENT_TELEMETRY: telemetry });

  const events = readFileSync(telemetry, "utf8").split("\n").filter(Boolean).map((line) => JSON.parse(line));
  assert.equal(events.length, 2);
  assert.equal(events[0].blocked, true);
  assert.equal(events[0].violations, 2);
  assert.ok(events[0].reasonChars > 0);
  assert.equal(events[1].blocked, false);
  assert.equal(events[1].violations, 0);
});
