import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { chmodSync, mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { assertDepsInstalled } from "./lib/workspace.mjs";
import { repoWith } from "./lib/repo.mjs";

assertDepsInstalled();

const FILLER = "  total = total + value;";

function functionOfLength(name, lines) {
  const body = [
    "  let total = value;",
    ...Array.from({ length: lines - 4 }, () => FILLER),
    "  return total;",
  ];
  return `export function ${name}(value: number): number {\n${body.join("\n")}\n}\n`;
}

function manyParams(params) {
  const names = ["a", "b", "c", "d", "e"].slice(0, params);
  return [
    "export function combine(",
    ...names.map((name) => `  ${name}: number,`),
    "): number {",
    "  return a;",
    "}",
    "",
  ].join("\n");
}

test("a function pushed past the line limit by a line added inside its body blocks", () => {
  const repo = repoWith({ "src/big.ts": functionOfLength("big", 100) });
  const committed = readFileSync(resolve(repo.dir, "src/big.ts"), "utf8");
  const lines = committed.split("\n");
  lines.splice(50, 0, FILLER);
  repo.write("src/big.ts", lines.join("\n"));

  const { status, report } = repo.lint();
  assert.equal(report.byRule["max-lines-per-function"], 1, JSON.stringify(report));
  assert.equal(status, 1);
  assert.equal(report.violations[0].file, "src/big.ts");
});

test("a parameter added beyond the limit on a later line of a multiline signature blocks", () => {
  const repo = repoWith({ "src/params.ts": manyParams(3) });
  repo.write("src/params.ts", manyParams(4));

  const { status, report } = repo.lint();
  assert.equal(report.byRule["@typescript-eslint/max-params"], 1, JSON.stringify(report));
  assert.equal(status, 1);
  assert.ok(
    report.violations[0].line < 4,
    "the diagnostic is reported on the declaration, not on the changed line",
  );
});

test("editing an unrelated line inside a pre-existing overlong function does not block", () => {
  const repo = repoWith({ "src/legacy.ts": functionOfLength("legacy", 130) });
  const lines = readFileSync(resolve(repo.dir, "src/legacy.ts"), "utf8").split("\n");
  lines[60] = "  total = value + total;";
  repo.write("src/legacy.ts", lines.join("\n"));

  const { status, report } = repo.lint();
  assert.equal(report.total, 0, JSON.stringify(report));
  assert.equal(status, 0);
});

test("editing the body of a pre-existing over-parameterised function does not block", () => {
  const repo = repoWith({ "src/legacy.ts": manyParams(5) });
  repo.write("src/legacy.ts", manyParams(5).replace("  return a;", "  return a + b;"));

  const { status, report } = repo.lint();
  assert.equal(report.total, 0, JSON.stringify(report));
  assert.equal(status, 0);
});

test("a newly written overlong function in a file that already had one still blocks", () => {
  const repo = repoWith({ "src/legacy.ts": functionOfLength("legacy", 130) });
  const committed = readFileSync(resolve(repo.dir, "src/legacy.ts"), "utf8");
  repo.write("src/legacy.ts", committed + functionOfLength("fresh", 130));

  const { status, report } = repo.lint();
  assert.equal(report.byRule["max-lines-per-function"], 1, JSON.stringify(report));
  assert.equal(status, 1);
});

test("localized rules keep exactly their current behaviour", () => {
  const clean = "export function scale(value: number): number {\n  return value + value;\n}\n";
  const repo = repoWith({ "src/localized.ts": `export function old(value: number): number {\n  return value * 42;\n}\n${clean}` });

  repo.write(
    "src/localized.ts",
    `export function old(value: number): number {\n  return value * 42;\n}\nexport function fresh(value: number): number {\n  return value * 7;\n}\n`,
  );

  const { status, report } = repo.lint();
  assert.equal(report.byRule["@typescript-eslint/no-magic-numbers"], 1, JSON.stringify(report));
  assert.equal(report.violations[0].line, 5);
  assert.equal(status, 1);
});

test("a rule not in the structural list is filtered on its reported line, never against the committed version", () => {
  const repo = repoWith({ "src/notes.ts": "// note\nexport function f(value: number): number {\n  return value;\n}\n" });
  repo.write("src/notes.ts", "// note\n// note\nexport function f(value: number): number {\n  return value;\n}\n");

  const { status, report } = repo.lint();
  assert.equal(report.byRule["agent/no-comments"], 1, JSON.stringify(report));
  assert.equal(report.violations[0].line, 2);
  assert.equal(status, 1);
});

function gitTracing(repo) {
  const log = resolve(repo.dir, "git-calls.log");
  const shimDir = resolve(repo.dir, "git-shim");
  mkdirSync(shimDir, { recursive: true });
  const realGit = execFileSync("which", ["git"], { encoding: "utf8" }).trim();
  const shim = resolve(shimDir, "git");
  writeFileSync(shim, `#!/bin/sh\nprintf '%s\\n' "$*" >> ${JSON.stringify(log)}\nexec ${JSON.stringify(realGit)} "$@"\n`);
  chmodSync(shim, 0o755);
  return {
    env: { PATH: `${shimDir}:${process.env.PATH}` },
    subcommands: () =>
      (existsSync(log) ? readFileSync(log, "utf8") : "")
        .split("\n")
        .filter(Boolean)
        .map((line) => line.split(" ")[0]),
  };
}

test("no committed version is retrieved when only localized diagnostics are present", () => {
  const repo = repoWith({ "src/localized.ts": functionOfLength("small", 20) });
  repo.write("src/localized.ts", `${functionOfLength("small", 20)}// added\n`);

  const tracing = gitTracing(repo);
  const { status, report } = repo.lint(tracing.env);
  assert.equal(report.byRule["agent/no-comments"], 1);
  assert.equal(status, 1);
  assert.deepEqual(tracing.subcommands().filter((name) => name === "show"), []);
});

test("exactly one committed version is retrieved when a structural diagnostic survives", () => {
  const repo = repoWith({ "src/big.ts": functionOfLength("big", 100) });
  const lines = readFileSync(resolve(repo.dir, "src/big.ts"), "utf8").split("\n");
  lines.splice(50, 0, FILLER);
  repo.write("src/big.ts", lines.join("\n"));

  const tracing = gitTracing(repo);
  const { status } = repo.lint(tracing.env);
  assert.equal(status, 1);
  assert.deepEqual(
    tracing.subcommands().filter((name) => name === "show"),
    ["show"],
    "one retrieval per file, not one per diagnostic",
  );
});

test("an untracked file is wholly in scope without any committed-version comparison", () => {
  const repo = repoWith({ "src/existing.ts": functionOfLength("small", 20) });
  repo.write("src/new.ts", functionOfLength("fresh", 130));

  const tracing = gitTracing(repo);
  const { status, report } = repo.lint(tracing.env);
  assert.equal(report.byRule["max-lines-per-function"], 1, JSON.stringify(report));
  assert.equal(status, 1);
  assert.deepEqual(tracing.subcommands().filter((name) => name === "show"), []);
});

