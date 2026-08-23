import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, mkdirSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { assertDepsInstalled, RUNNER, SHARED_MODULES } from "./lib/workspace.mjs";
import { repoWith } from "./lib/repo.mjs";

assertDepsInstalled();

const CLEAN_BASELINE = "export function existing(value: number): number {\n  return value + 1;\n}\n";
const VIOLATING = "export function scale(value: number): number {\n  return value * 42;\n}\n";

function violating(name, factor) {
  return `export function ${name}(value: number): number {\n  return value * ${factor};\n}\n`;
}

test("staged changes are in scope", () => {
  const repo = repoWith({ "src/existing.ts": CLEAN_BASELINE });
  repo.write("src/existing.ts", VIOLATING);
  repo.git("add", "src/existing.ts");

  const { status, report } = repo.lint();
  assert.equal(status, 1);
  assert.equal(report.byRule["@typescript-eslint/no-magic-numbers"], 1);
});

test("a staged new file is in scope", () => {
  const repo = repoWith({ "src/existing.ts": CLEAN_BASELINE });
  repo.write("src/added.ts", VIOLATING);
  repo.git("add", "src/added.ts");

  const { status, report } = repo.lint();
  assert.equal(status, 1);
  assert.deepEqual(report.violations.map((violation) => violation.file), ["src/added.ts"]);
});

test("unstaged changes are in scope", () => {
  const repo = repoWith({ "src/existing.ts": CLEAN_BASELINE });
  repo.write("src/existing.ts", VIOLATING);

  const { status, report } = repo.lint();
  assert.equal(status, 1);
  assert.equal(report.byRule["@typescript-eslint/no-magic-numbers"], 1);
});

test("staged and unstaged edits to the same file are both in scope", () => {
  const repo = repoWith({ "src/existing.ts": CLEAN_BASELINE });
  repo.write("src/existing.ts", CLEAN_BASELINE + violating("staged", 42));
  repo.git("add", "src/existing.ts");
  repo.write("src/existing.ts", CLEAN_BASELINE + violating("staged", 42) + violating("unstaged", 43));

  const { report } = repo.lint();
  assert.deepEqual(
    report.violations.map((violation) => violation.line).sort((a, b) => a - b),
    [5, 8],
    "the staged line and the unstaged line are both in scope",
  );
});

test("an untracked file is in scope in full", () => {
  const repo = repoWith({ "src/existing.ts": CLEAN_BASELINE });
  repo.write("src/added.ts", `// new file\n${violating("gap", 42)}`);

  const { report } = repo.lint();
  assert.equal(report.byRule["agent/no-comments"], 1);
  assert.equal(report.byRule["@typescript-eslint/no-magic-numbers"], 1);
});

test("committed changes are out of scope", () => {
  const repo = repoWith({ "src/existing.ts": CLEAN_BASELINE });
  repo.write("src/added.ts", `// committed comment\n${violating("gap", 42)}`);
  repo.git("add", "--all");
  repo.git("commit", "--quiet", "--message", "work");

  const { status, report } = repo.lint();
  assert.equal(report.total, 0, "a commit leaves the diff scope");
  assert.equal(status, 0);
});

test("branch naming does not affect scope", () => {
  const repo = repoWith({ "src/existing.ts": CLEAN_BASELINE }, { branch: "feature/nested-name" });
  repo.write("src/existing.ts", VIOLATING);

  const { status, report } = repo.lint();
  assert.equal(status, 1);
  assert.equal(report.byRule["@typescript-eslint/no-magic-numbers"], 1);
});

test("an unreachable remote is never consulted", () => {
  const repo = repoWith({ "src/existing.ts": CLEAN_BASELINE }, { branch: "dev", remote: true });
  repo.write("src/existing.ts", VIOLATING);

  const { status, report } = repo.lint();
  assert.equal(status, 1);
  assert.equal(report.byRule["@typescript-eslint/no-magic-numbers"], 1);
});

test("a repository with no commit yet lints its files in full instead of failing", () => {
  const dir = mkdtempSync(resolve(tmpdir(), "agent-lint-empty-"));
  writeFileSync(resolve(dir, "package.json"), JSON.stringify({ name: "scratch", private: true, type: "module" }));
  writeFileSync(resolve(dir, ".gitignore"), "node_modules/\n");
  symlinkSync(SHARED_MODULES, resolve(dir, "node_modules"), "dir");
  mkdirSync(resolve(dir, "src"));
  writeFileSync(resolve(dir, "src/added.ts"), `// no HEAD yet\n${violating("gap", 42)}`);
  writeFileSync(resolve(dir, "src/staged.ts"), violating("staged", 43));
  const git = (...args) => execFileSync("git", args, { cwd: dir, encoding: "utf8" });
  git("init", "--quiet", "--initial-branch=main");
  git("config", "user.email", "test@example.com");
  git("config", "user.name", "Test");
  git("add", "src/staged.ts");

  const result = spawnSync("node", [RUNNER], {
    cwd: dir,
    encoding: "utf8",
    env: { ...process.env, LINT_AGENT_FORMAT: "json", LINT_AGENT_ONLY_FILES: "", LINT_AGENT_ALLOW_COMMENTS: "" },
  });
  assert.equal(result.status, 1, `runner failed: ${result.stderr}`);
  const report = JSON.parse(result.stdout.trim().split("\n").at(-1));
  assert.deepEqual(
    [...new Set(report.violations.map((violation) => violation.file))].sort(),
    ["src/added.ts", "src/staged.ts"],
  );
});

test("repo-relative paths are correct for deeply nested directories", () => {
  const repo = repoWith({ "src/existing.ts": CLEAN_BASELINE });
  repo.write("packages/inner/src/deep/thing.ts", VIOLATING);

  const { report } = repo.lint();
  assert.deepEqual(
    report.violations.map((violation) => violation.file),
    ["packages/inner/src/deep/thing.ts"],
  );
});

