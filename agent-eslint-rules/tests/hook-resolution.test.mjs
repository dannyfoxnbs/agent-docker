import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, lstatSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { assertDepsInstalled, HOOK_SHIM, LINK_NAME, PATH_FILE_NAME, RULES_DIR } from "./lib/workspace.mjs";
import { cloneRules, repoWith } from "./lib/repo.mjs";

assertDepsInstalled();

const CLEAN_BASELINE = "export function existing(value: number): number {\n  return value + 1;\n}\n";
const OFFENDING = "// hook check\nexport function gap(value: number): number {\n  return value * 12;\n}\n";

test("editing the clone changes behaviour with no re-installation", () => {
  const clone = cloneRules();
  const repo = repoWith({ "src/existing.ts": CLEAN_BASELINE }, { installHook: { rules: clone } });
  repo.write("src/added.ts", OFFENDING);
  assert.match(JSON.parse(repo.hook("src/added.ts").stdout).reason, /agent\/no-comments/);

  const config = resolve(clone, "eslint.config.agent.mjs");
  const before = readFileSync(resolve(repo.dir, ".claude/hooks/agent-lint-changed-file.mjs"), "utf8");
  writeFileSync(config, readFileSync(config, "utf8").replace('"agent/no-comments": "error"', '"agent/no-comments": "off"'));

  const after = JSON.parse(repo.hook("src/added.ts").stdout);
  assert.doesNotMatch(after.reason, /agent\/no-comments/, "the relaxed rule is gone immediately");
  assert.match(after.reason, /no-magic-numbers/, "the rules still in force still fire");
  assert.equal(
    readFileSync(resolve(repo.dir, ".claude/hooks/agent-lint-changed-file.mjs"), "utf8"),
    before,
    "nothing was re-installed",
  );
});

test("the installed file is a thin shim with no rule or hook logic", () => {
  const shim = readFileSync(HOOK_SHIM, "utf8");
  assert.ok(shim.split("\n").length < 130, "the shim stays small enough never to need changing");
  for (const logic of ["spawnSync", "decision", "no-magic-numbers", "LINT_AGENT_ONLY_FILES", "ESLint"]) {
    assert.doesNotMatch(shim, new RegExp(logic), `the shim must not contain ${logic}`);
  }
  assert.match(shim, /claude-hook\/hook-main\.mjs/, "it delegates into the clone");
  assert.doesNotMatch(shim, /repos\/agent-eslint-rules|process\.env\.HOME/, "no home-directory candidates remain");
});

test("the absolute-path fallback is honoured where symlinks are unavailable", () => {
  const clone = cloneRules();
  const repo = repoWith({ "src/existing.ts": CLEAN_BASELINE }, { installHook: { rules: clone, link: false } });

  assert.throws(() => lstatSync(resolve(repo.dir, LINK_NAME)), "no symlink was created");
  assert.match(readFileSync(resolve(repo.dir, PATH_FILE_NAME), "utf8"), new RegExp(clone));

  repo.write("src/added.ts", OFFENDING);
  assert.equal(JSON.parse(repo.hook("src/added.ts").stdout).decision, "block");
});

test("a broken link produces a clear message and does not block", () => {
  const repo = repoWith({ "src/existing.ts": CLEAN_BASELINE }, { installHook: { link: "broken" } });
  repo.write("src/added.ts", OFFENDING);
  const result = repo.hook("src/added.ts");
  assert.equal(result.status, 0);
  assert.equal(result.stdout, "", "a setup problem must never block the agent");
  assert.match(result.stderr, /agent-lint: not checked/);
  assert.match(result.stderr, /agent-eslint-rules is broken/, "the message names the link");
  assert.match(result.stderr, /no-such-clone/, "and what it points at");
});

test("with nothing configured, the message names both the link and the fallback file", () => {
  const repo = repoWith({ "src/existing.ts": CLEAN_BASELINE }, { installHook: { link: false } });
  rmSync(resolve(repo.dir, PATH_FILE_NAME));
  repo.write("src/added.ts", OFFENDING);
  const result = repo.hook("src/added.ts");
  assert.equal(result.stdout, "", "an unconfigured project is not blocked");
  assert.match(result.stderr, /no agent-eslint-rules clone is linked/);
  assert.match(result.stderr, new RegExp(`${LINK_NAME.split("/").pop()}[^.]*pointing at your clone`));
  assert.match(result.stderr, /agent-eslint-rules\.path/);
});

test("the explicit AGENT_ESLINT_RUNNER override still wins", () => {
  const repo = repoWith({ "src/existing.ts": CLEAN_BASELINE }, { installHook: { link: "broken" } });
  repo.write("src/added.ts", OFFENDING);
  const runner = resolve(RULES_DIR, "lint-agent.mjs");
  assert.equal(JSON.parse(repo.hook("src/added.ts", { AGENT_ESLINT_RUNNER: runner }).stdout).decision, "block");
});

