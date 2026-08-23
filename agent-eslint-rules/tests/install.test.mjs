import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, lstatSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { assertDepsInstalled, LINK_NAME, PATH_FILE_NAME, RULES_DIR, SETTINGS_NAME, SHIM_NAME } from "./lib/workspace.mjs";
import { repoWith, runInstaller } from "./lib/repo.mjs";

assertDepsInstalled();

const CLEAN_BASELINE = "export function existing(value: number): number {\n  return value + 1;\n}\n";
const OFFENDING = "// added by the agent\nexport function gap(value: number): number {\n  return value * 12;\n}\n";

function projectNotIgnoringClaude() {
  const repo = repoWith({ "src/existing.ts": CLEAN_BASELINE });
  repo.write(".gitignore", "node_modules/\n");
  repo.git("add", ".gitignore");
  repo.git("commit", "--quiet", "--message", "stop ignoring .claude");
  return repo;
}

function ourEntries(dir) {
  const settings = JSON.parse(readFileSync(resolve(dir, SETTINGS_NAME), "utf8"));
  return settings.hooks.PostToolUse.filter((group) =>
    group.hooks.some((hook) => hook.command.includes("agent-lint-changed-file.mjs")),
  );
}

test("installing into a fresh project produces an install the hook really runs on", () => {
  const repo = projectNotIgnoringClaude();
  const installed = runInstaller(repo.dir);

  assert.equal(installed.status, 0, installed.stdout);
  assert.equal(installed.report.ok, true);
  assert.equal(installed.report.verification.ok, true, JSON.stringify(installed.report.verification));
  assert.deepEqual(installed.report.errors, []);

  assert.ok(lstatSync(resolve(repo.dir, LINK_NAME)).isSymbolicLink(), "the normal install is a symlink");
  assert.equal(realpathSync(resolve(repo.dir, LINK_NAME)), realpathSync(RULES_DIR));
  assert.ok(!existsSync(resolve(repo.dir, PATH_FILE_NAME)), "the fallback file is not created as well");

  repo.write("src/added.ts", OFFENDING);
  const payload = JSON.parse(repo.hook("src/added.ts").stdout);
  assert.equal(payload.decision, "block");
  assert.match(payload.reason, /agent\/no-comments/);

  assert.equal(repo.git("diff", "--name-only", "HEAD", "--").trim(), "", "no tracked file was modified");
  const untracked = repo.git("status", "--porcelain", "--untracked-files=all");
  assert.doesNotMatch(untracked, /\.claude/, "the install is git-ignored");
  assert.doesNotMatch(untracked, /install-check/, "the verification file was removed");
  assert.match(readFileSync(resolve(repo.dir, ".git/info/exclude"), "utf8"), /\/\.claude\/settings\.json/);
});

test("an existing settings file keeps every unrelated key and hook", () => {
  const repo = projectNotIgnoringClaude();
  const before = {
    $schema: "https://json.schemastore.org/claude-code-settings.json",
    permissions: { allow: ["Bash(npm test)"] },
    hooks: {
      PreToolUse: [{ matcher: "Bash", hooks: [{ type: "command", command: "echo pre" }] }],
      PostToolUse: [{ matcher: "Read", hooks: [{ type: "command", command: "echo unrelated" }] }],
    },
  };
  repo.write(SETTINGS_NAME, `${JSON.stringify(before, null, 4)}\n`);

  assert.equal(runInstaller(repo.dir).report.ok, true);

  const after = JSON.parse(readFileSync(resolve(repo.dir, SETTINGS_NAME), "utf8"));
  assert.deepEqual(after.permissions, before.permissions, "unrelated keys survive");
  assert.deepEqual(after.hooks.PreToolUse, before.hooks.PreToolUse, "unrelated hook events survive");
  assert.deepEqual(after.hooks.PostToolUse[0], before.hooks.PostToolUse[0], "unrelated PostToolUse hooks survive");
  assert.equal(ourEntries(repo.dir).length, 1);
  assert.match(readFileSync(resolve(repo.dir, SETTINGS_NAME), "utf8"), /\n {4}"permissions"/, "the file's own indentation is kept");

  repo.write("src/added.ts", OFFENDING);
  assert.equal(JSON.parse(repo.hook("src/added.ts").stdout).decision, "block");
});

test("installing twice leaves the same result as once, with no duplicated entry", () => {
  const repo = projectNotIgnoringClaude();
  repo.write(SETTINGS_NAME, `${JSON.stringify({ hooks: { PostToolUse: [{ matcher: "Read", hooks: [{ type: "command", command: "echo unrelated" }] }] } }, null, 2)}\n`);

  runInstaller(repo.dir);
  const first = {
    settings: readFileSync(resolve(repo.dir, SETTINGS_NAME), "utf8"),
    exclude: readFileSync(resolve(repo.dir, ".git/info/exclude"), "utf8"),
    status: repo.git("status", "--porcelain", "--untracked-files=all"),
  };

  const again = runInstaller(repo.dir);
  assert.equal(again.report.ok, true);
  assert.equal(again.report.verification.ok, true);
  assert.equal(readFileSync(resolve(repo.dir, SETTINGS_NAME), "utf8"), first.settings, "the settings file is byte-identical");
  assert.equal(readFileSync(resolve(repo.dir, ".git/info/exclude"), "utf8"), first.exclude, "the exclude file is byte-identical");
  assert.equal(repo.git("status", "--porcelain", "--untracked-files=all"), first.status);
  assert.equal(ourEntries(repo.dir).length, 1, "the hook entry is not duplicated");

  const moved = JSON.parse(first.settings);
  moved.hooks.PostToolUse = moved.hooks.PostToolUse.map((group) =>
    group.hooks.some((hook) => hook.command.includes("agent-lint-changed-file.mjs")) ? { ...group, matcher: "Edit|Write" } : group,
  );
  repo.write(SETTINGS_NAME, `${JSON.stringify(moved, null, 2)}\n`);
  rmSync(resolve(repo.dir, SHIM_NAME));
  const repaired = runInstaller(repo.dir);
  assert.equal(repaired.report.ok, true, repaired.stdout);
  assert.equal(ourEntries(repo.dir).length, 1, "a customised entry is not duplicated either");
  assert.equal(ourEntries(repo.dir)[0].matcher, "Edit|Write", "and is left as the person set it");
  assert.ok(existsSync(resolve(repo.dir, SHIM_NAME)), "the missing shim was repaired");
});

test("a directory that is not a git repository is refused, and nothing is written", () => {
  const target = mkdtempSync(resolve(tmpdir(), "not-a-repo-"));
  writeFileSync(resolve(target, "package.json"), "{}\n");
  const refused = runInstaller(target);

  assert.equal(refused.status, 1);
  assert.equal(refused.report.ok, false);
  assert.match(refused.report.errors.join("\n"), /not inside a git repository/);
  assert.match(refused.report.errors.join("\n"), /Nothing was written/);
  assert.ok(!existsSync(resolve(target, ".claude")), "no .claude directory was created");
  assert.deepEqual(readdirSync(target), ["package.json"], "the directory is exactly as it was");
});

test("a malformed settings file is refused rather than overwritten", () => {
  const repo = projectNotIgnoringClaude();
  repo.write(SETTINGS_NAME, "{ this is not json\n");

  const refused = runInstaller(repo.dir);
  assert.equal(refused.report.ok, false);
  assert.match(refused.report.errors.join("\n"), /not valid JSON/);
  assert.equal(readFileSync(resolve(repo.dir, SETTINGS_NAME), "utf8"), "{ this is not json\n", "the file is untouched");
  assert.ok(!existsSync(resolve(repo.dir, LINK_NAME)), "and nothing else was written either");
});

test("a project with no ESLint installs, and says checking cannot work yet", () => {
  const repo = projectNotIgnoringClaude();
  rmSync(resolve(repo.dir, "node_modules"), { force: true });

  const installed = runInstaller(repo.dir);
  assert.equal(installed.report.ok, true, "a missing prerequisite is a warning, not a refusal");
  assert.equal(installed.report.verification.ok, false);
  assert.equal(installed.report.verification.reason, "eslint-missing");
  assert.match(installed.report.warnings.join("\n"), /no ESLint is resolvable/);
  assert.match(installed.report.warnings.join("\n"), /npm install/);
});

test("check mode reports a healthy install, and what is wrong with a broken one", () => {
  const repo = projectNotIgnoringClaude();
  runInstaller(repo.dir);

  const healthy = runInstaller(repo.dir, ["--check"]);
  assert.equal(healthy.status, 0);
  assert.equal(healthy.report.ok, true);
  assert.equal(healthy.report.verification.ok, true);

  rmSync(resolve(repo.dir, LINK_NAME));
  const broken = runInstaller(repo.dir, ["--check"]);
  assert.equal(broken.status, 1);
  assert.equal(broken.report.ok, false);
  assert.match(broken.report.errors.join("\n"), /agent-eslint-rules/);
  assert.equal(broken.report.verification, null, "an unhealthy install is not claimed to have been verified");

  assert.ok(!existsSync(resolve(repo.dir, LINK_NAME)));
  assert.equal(runInstaller(repo.dir).report.verification.ok, true, "and re-running repairs it");
});

test("uninstall removes what was installed and leaves unrelated settings intact", () => {
  const repo = projectNotIgnoringClaude();
  const unrelated = { permissions: { allow: ["Bash(npm test)"] }, hooks: { PostToolUse: [{ matcher: "Read", hooks: [{ type: "command", command: "echo unrelated" }] }] } };
  repo.write(SETTINGS_NAME, `${JSON.stringify(unrelated, null, 2)}\n`);
  runInstaller(repo.dir);

  const removed = runInstaller(repo.dir, ["--uninstall"]);
  assert.equal(removed.status, 0);
  assert.ok(!existsSync(resolve(repo.dir, SHIM_NAME)), "the shim is gone");
  assert.throws(() => lstatSync(resolve(repo.dir, LINK_NAME)), "the link is gone");
  assert.deepEqual(JSON.parse(readFileSync(resolve(repo.dir, SETTINGS_NAME), "utf8")), unrelated, "the rest of the file is as it was");
  assert.equal(runInstaller(repo.dir, ["--check"]).report.ok, false, "check mode now reports no install");
  assert.equal(repo.git("diff", "--name-only", "HEAD", "--").trim(), "", "no tracked file was modified");
});

