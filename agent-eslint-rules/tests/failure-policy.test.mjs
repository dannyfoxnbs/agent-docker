import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { RUNNER, SHARED_MODULES, assertDepsInstalled } from "./lib/workspace.mjs";
import { cloneRules, repoWith } from "./lib/repo.mjs";

assertDepsInstalled();


const CLEAN_BASELINE = "export function existing(value: number): number {\n  return value + 1;\n}\n";
const VIOLATION = "// a comment\nexport function scale(value: number): number {\n  return value * 42;\n}\n";
const FAILURE_PREFIX = "agent-lint: not checked - ";

function breakModules(repo, { exclude = null } = {}) {
  const modules = resolve(repo.dir, "node_modules");
  unlinkSync(modules);
  if (exclude === null) {
    return modules;
  }
  mkdirSync(modules);
  for (const entry of readdirSync(SHARED_MODULES)) {
    if (exclude.includes(entry)) {
      continue;
    }
    symlinkSync(resolve(SHARED_MODULES, entry), resolve(modules, entry), "dir");
  }
  return modules;
}

function runRunner(repo, env = {}) {
  const result = spawnSync("node", [RUNNER], {
    cwd: repo.dir,
    encoding: "utf8",
    env: { ...process.env, LINT_AGENT_FORMAT: "json", LINT_AGENT_ONLY_FILES: "", ...env },
  });
  const stdout = (result.stdout ?? "").trim();
  let report = null;
  try {
    report = JSON.parse(stdout.split("\n").at(-1));
  } catch {
    report = null;
  }
  return { status: result.status, stdout, stderr: (result.stderr ?? "").trim(), report };
}

function runShim(repo, file, env = {}) {
  const result = spawnSync(process.execPath, [resolve(repo.dir, ".claude/hooks/agent-lint-changed-file.mjs")], {
    cwd: repo.dir,
    encoding: "utf8",
    input: JSON.stringify({ tool_name: "Edit", tool_input: { file_path: resolve(repo.dir, file) } }),
    env: { ...process.env, AGENT_ESLINT_RUNNER: "", LINT_AGENT_TELEMETRY: "", ...env },
  });
  return { status: result.status, stdout: (result.stdout ?? "").trim(), stderr: (result.stderr ?? "").trim() };
}

function failureLines(stderr) {
  return stderr.split("\n").filter((line) => line.trim());
}

test("missing dependencies fail open as one tooling warning", () => {
  const repo = repoWith({ "src/existing.ts": CLEAN_BASELINE }, { installHook: true });
  repo.write("src/added.ts", VIOLATION);
  breakModules(repo);

  const runner = runRunner(repo);
  assert.equal(runner.status, 2);
  assert.match(runner.stderr, /eslint/i);

  const hook = repo.hook("src/added.ts");
  assert.equal(hook.status, 0);
  assert.equal(hook.stdout, "");
  const lines = failureLines(hook.stderr);
  assert.equal(lines.length, 1);
  assert.ok(lines[0].startsWith(FAILURE_PREFIX));
  assert.match(lines[0], /lint tooling failure, not a rule violation/);
});

test("a runner killed by a signal is a failure, not a violation", () => {
  const rules = cloneRules();
  const suicide = resolve(rules, "kill-runner.mjs");
  writeFileSync(suicide, 'process.kill(process.pid, "SIGKILL");\n');
  const repo = repoWith({ "src/existing.ts": CLEAN_BASELINE }, { installHook: { rules } });
  repo.write("src/added.ts", VIOLATION);

  const { status, stdout, stderr } = repo.hook("src/added.ts", { AGENT_ESLINT_RUNNER: suicide });
  assert.equal(status, 0);
  assert.equal(stdout, "", "a killed runner never blocks");
  const lines = failureLines(stderr);
  assert.equal(lines.length, 1);
  assert.ok(lines[0].startsWith(FAILURE_PREFIX));
  assert.match(lines[0], /SIGKILL/);
});

test("a runner that cannot be started is a failure, not a violation", () => {
  const repo = repoWith({ "src/existing.ts": CLEAN_BASELINE }, { installHook: true });
  repo.write("src/added.ts", VIOLATION);
  const { status, stdout, stderr } = runShim(repo, "src/added.ts", { PATH: "" });
  assert.equal(status, 0);
  assert.equal(stdout, "", "a runner that never started never blocks");
  const lines = failureLines(stderr);
  assert.equal(lines.length, 1, `expected exactly one line, got:\n${stderr}`);
  assert.ok(lines[0].startsWith(FAILURE_PREFIX));
  assert.match(lines[0], /could not be started/);
});

test("telemetry records a tooling failure as a failure, not as a block", () => {
  const repo = repoWith({ "src/existing.ts": CLEAN_BASELINE }, { installHook: true });
  repo.write("src/added.ts", VIOLATION);
  const log = resolve(mkdtempSync(resolve(tmpdir(), "agent-lint-telemetry-")), "events.jsonl");
  breakModules(repo);

  repo.hook("src/added.ts", { LINT_AGENT_TELEMETRY: log });
  const events = readFileSync(log, "utf8").trim().split("\n").map((line) => JSON.parse(line));
  assert.equal(events.length, 1);
  assert.equal(events[0].outcome, "failure");
  assert.equal(events[0].blocked, false, "the harness must not count this as a block");
  assert.equal(events[0].violations, 0);
});

test("telemetry labels the other two outcomes too", () => {
  const repo = repoWith({ "src/existing.ts": CLEAN_BASELINE }, { installHook: true });
  const dir = mkdtempSync(resolve(tmpdir(), "agent-lint-telemetry-"));

  repo.write("src/clean.ts", "export function clean(value: number): number {\n  return value - 1;\n}\n");
  const cleanLog = resolve(dir, "clean.jsonl");
  repo.hook("src/clean.ts", { LINT_AGENT_TELEMETRY: cleanLog });
  const clean = JSON.parse(readFileSync(cleanLog, "utf8").trim());
  assert.equal(clean.outcome, "clean");
  assert.equal(clean.blocked, false);

  repo.write("src/added.ts", VIOLATION);
  const blockLog = resolve(dir, "block.jsonl");
  repo.hook("src/added.ts", { LINT_AGENT_TELEMETRY: blockLog });
  const blocked = JSON.parse(readFileSync(blockLog, "utf8").trim());
  assert.equal(blocked.outcome, "violations");
  assert.equal(blocked.blocked, true);
  assert.ok(blocked.violations >= 2);
});

test("a typescript-eslint whose own dependency is missing is not reported as absent", () => {
  const repo = repoWith({ "src/existing.ts": CLEAN_BASELINE });
  repo.write("src/added.ts", VIOLATION);
  const modules = breakModules(repo, { exclude: ["typescript-eslint"] });

  const broken = resolve(modules, "typescript-eslint");
  mkdirSync(broken);
  writeFileSync(
    resolve(broken, "package.json"),
    JSON.stringify({ name: "typescript-eslint", version: "0.0.0", main: "index.js" }),
  );
  writeFileSync(resolve(broken, "index.js"), 'require("a-dependency-nobody-installed");\n');

  const { status, stderr } = runRunner(repo);
  assert.equal(status, 2);
  assert.match(stderr, /a-dependency-nobody-installed/, "the real unresolvable specifier is named");
  assert.doesNotMatch(stderr, /could not resolve typescript-eslint/);
});

test("the split-package fallback still works when the unified package is genuinely absent", () => {
  const repo = repoWith({ "src/existing.ts": CLEAN_BASELINE });
  repo.write("src/added.ts", VIOLATION);
  breakModules(repo, { exclude: ["typescript-eslint"] });

  const { status, report, stderr } = runRunner(repo);
  assert.equal(status, 1, `expected violations, stderr was:\n${stderr}`);
  assert.equal(report.byRule["agent/no-comments"], 1);
  assert.equal(report.byRule["@typescript-eslint/no-magic-numbers"], 1, "the split plugin is in use");
});
