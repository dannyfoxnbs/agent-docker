#!/usr/bin/env node

import { execFileSync, spawnSync } from "node:child_process";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { randomBytes } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const RULES_DIR = resolve(fileURLToPath(new URL("..", import.meta.url)));

const SHIM_SOURCE = "claude-hook/hooks/agent-lint-changed-file.mjs";
const SETTINGS_TEMPLATE = "claude-hook/settings.json";
const RUNNER_SOURCE = "lint-agent.mjs";
const HOOK_MAIN_SOURCE = "claude-hook/hook-main.mjs";

const SHIM = ".claude/hooks/agent-lint-changed-file.mjs";
const SETTINGS = ".claude/settings.json";
const LINK = ".claude/agent-eslint-rules";
const PATH_FILE = ".claude/agent-eslint-rules.path";
const INSTALLED_PATHS = [SHIM, SETTINGS, LINK, PATH_FILE];

const SHIM_MARKER = "agent-lint-changed-file.mjs";

const EXCLUDE_HEADER = "# agent-eslint-rules installer: delete this block to stop ignoring these";

const VERIFY_SOURCE = [
  "// agent-eslint-rules install check - this file is deleted immediately",
  "export function agentEslintInstallCheck(value: number): number {",
  "  return value * 37;",
  "}",
  "",
].join("\n");

export function runInstaller({ target, mode = "install", rulesDir = RULES_DIR, preferPathFile = false, verify = true }) {
  const result = { ok: false, mode, target, root: null, rulesDir: resolve(rulesDir), changes: [], notes: [], warnings: [], errors: [], verification: null };

  const root = gitRoot(target, result);
  if (!root) {
    return result;
  }
  result.root = root;

  if (mode === "check") {
    return dedupe(inspect(root, result, verify));
  }
  if (mode === "uninstall") {
    return dedupe(uninstall(root, result));
  }
  return dedupe(install(root, result, { preferPathFile, verify }));
}

function dedupe(result) {
  for (const key of ["changes", "notes", "warnings", "errors"]) {
    result[key] = [...new Set(result[key])];
  }
  return result;
}

function gitRoot(target, result) {
  const path = resolve(target ?? "");
  if (!existsSync(path)) {
    result.errors.push(`${path} does not exist, so there is nothing to install into.`);
    return null;
  }
  try {
    const root = git(path, ["rev-parse", "--show-toplevel"]).trim();
    return realpathSync(root);
  } catch {
    result.errors.push(
      `${path} is not inside a git repository. The rules check the working tree ` +
        "against HEAD, so a git repository is required. Nothing was written.",
    );
    return null;
  }
}

function install(root, result, { preferPathFile, verify }) {
  const rulesDir = result.rulesDir;
  for (const required of [RUNNER_SOURCE, HOOK_MAIN_SOURCE, SHIM_SOURCE, SETTINGS_TEMPLATE]) {
    if (!existsSync(resolve(rulesDir, required))) {
      result.errors.push(`${rulesDir} is not an agent-eslint-rules clone: ${required} is missing. Nothing was written.`);
      return result;
    }
  }

  const tracked = INSTALLED_PATHS.filter((path) => isTracked(root, path));
  if (tracked.length > 0) {
    result.errors.push(
      `${tracked.join(", ")} ${tracked.length === 1 ? "is" : "are"} tracked by git in ${root}. ` +
        "The install must not modify a tracked file, so nothing was written. Untrack it " +
        "(git rm --cached) or add the hook entry to it by hand.",
    );
    return result;
  }

  const merged = mergeSettings(root, rulesDir, result);
  if (!merged) {
    return result;
  }

  mkdirSync(resolve(root, dirname(SHIM)), { recursive: true });
  writeFile(root, SHIM, readFileSync(resolve(rulesDir, SHIM_SOURCE), "utf8"), result);
  writeFile(root, SETTINGS, merged.text, result);
  result.notes.push(...merged.notes);

  linkRules(root, rulesDir, preferPathFile, result);
  ignorePaths(root, result);

  result.ok = result.errors.length === 0;
  if (result.ok && verify) {
    verifyInstall(root, result);
  }
  return result;
}

// Keep the symlink and path-file fallback mutually exclusive.
function linkRules(root, rulesDir, preferPathFile, result) {
  const link = resolve(root, LINK);

  if (!preferPathFile) {
    if (isLinkTo(link, rulesDir)) {
      result.notes.push(`${LINK} already points at ${rulesDir}`);
      removeIfPresent(root, PATH_FILE, result);
      return;
    }
    remove(link);
    try {
      symlinkSync(rulesDir, link, "dir");
      result.changes.push(`linked ${LINK} -> ${rulesDir}`);
      removeIfPresent(root, PATH_FILE, result);
      return;
    } catch (error) {
      result.warnings.push(`symlinks are unavailable here (${error.code ?? error.message}); recording the path in ${PATH_FILE} instead.`);
    }
  }

  remove(link);
  writeFile(root, PATH_FILE, `# absolute path of the agent-eslint-rules clone\n${rulesDir}\n`, result);
}

function mergeSettings(root, rulesDir, result) {
  const template = JSON.parse(readFileSync(resolve(rulesDir, SETTINGS_TEMPLATE), "utf8"));
  const entry = template.hooks.PostToolUse[0];
  const file = resolve(root, SETTINGS);

  if (!existsSync(file)) {
    return { text: `${JSON.stringify(template, null, 2)}\n`, notes: [] };
  }

  const raw = readFileSync(file, "utf8");
  let settings;
  try {
    settings = JSON.parse(raw);
  } catch (error) {
    result.errors.push(`${SETTINGS} is not valid JSON (${error.message}). Nothing was written - fix or move that file, then re-run.`);
    return null;
  }
  if (settings === null || typeof settings !== "object" || Array.isArray(settings)) {
    result.errors.push(`${SETTINGS} does not contain a JSON object. Nothing was written.`);
    return null;
  }

  const hooks = settings.hooks ?? {};
  if (typeof hooks !== "object" || hooks === null || Array.isArray(hooks)) {
    result.errors.push(`${SETTINGS} has a "hooks" key that is not an object. Nothing was written.`);
    return null;
  }
  const post = hooks.PostToolUse ?? [];
  if (!Array.isArray(post)) {
    result.errors.push(`${SETTINGS} has a "hooks.PostToolUse" key that is not an array. Nothing was written.`);
    return null;
  }
  if (post.some((group) => group === null || typeof group !== "object" || Array.isArray(group))) {
    result.errors.push(`${SETTINGS} has a "hooks.PostToolUse" entry that is not an object. Nothing was written.`);
    return null;
  }

  const notes = [];
  const groups = post.map((group) => ({ ...group }));
  const sameMatcher = groups.find((group) => matcherOf(group) === matcherOf(entry));
  const existing = groups.find((group) => commandHooks(group).some(isOurs));

  if (existing && existing === sameMatcher) {
    existing.hooks = existing.hooks.map((hook) => (isOurs(hook) ? { ...entry.hooks[0] } : hook));
    notes.push("the hook entry was already present; refreshed in place, not duplicated");
  } else if (existing) {
    notes.push(`the hook entry was already present under matcher "${matcherOf(existing)}"; left as it is, not duplicated`);
  } else if (sameMatcher) {
    sameMatcher.hooks = [...commandHooks(sameMatcher), { ...entry.hooks[0] }];
    notes.push(`added the hook to the existing "${matcherOf(entry)}" entry, alongside ${commandHooks(sameMatcher).length - 1} hook(s) already there`);
  } else {
    groups.push(structuredClone(entry));
    notes.push("added a PostToolUse entry");
  }

  const next = { ...settings, hooks: { ...hooks, PostToolUse: groups } };
  return { text: render(next, raw), notes };
}

function matcherOf(group) {
  return typeof group?.matcher === "string" ? group.matcher.trim() : "";
}

function commandHooks(group) {
  return Array.isArray(group?.hooks) ? group.hooks : [];
}

function isOurs(hook) {
  return Boolean(hook) && typeof hook === "object" && typeof hook.command === "string" && hook.command.includes(SHIM_MARKER);
}

function render(settings, original) {
  const indent = /\n([ \t]+)\S/.exec(original)?.[1] ?? "  ";
  const text = JSON.stringify(settings, null, indent);
  return original.endsWith("\n") ? `${text}\n` : text;
}

function ignorePaths(root, result) {
  const missing = INSTALLED_PATHS.filter((path) => entryExists(resolve(root, path))).filter((path) => !isIgnored(root, path));
  if (missing.length === 0) {
    result.notes.push("everything installed is already git-ignored");
    return;
  }

  const file = excludeFile(root);
  const lines = existsSync(file) ? readFileSync(file, "utf8").split("\n") : [];
  const wanted = missing.map((path) => `/${path}`).filter((line) => !lines.includes(line));
  if (wanted.length === 0) {
    result.notes.push(`already listed in ${relativeToRoot(root, file)}`);
    return;
  }

  const body = [...(lines.at(-1) === "" ? lines.slice(0, -1) : lines), EXCLUDE_HEADER, ...wanted, ""];
  writeFileSync(file, body.join("\n"));
  result.changes.push(`git-ignored ${wanted.join(", ")} via ${relativeToRoot(root, file)}`);
}

function unignorePaths(root, result) {
  const file = excludeFile(root);
  if (!existsSync(file)) {
    return;
  }
  const ours = new Set([EXCLUDE_HEADER, ...INSTALLED_PATHS.map((path) => `/${path}`)]);
  const lines = readFileSync(file, "utf8").split("\n");
  const kept = lines.filter((line) => !ours.has(line));
  if (kept.length !== lines.length) {
    writeFileSync(file, kept.join("\n"));
    result.changes.push(`removed our entries from ${relativeToRoot(root, file)}`);
  }
}

function excludeFile(root) {
  const common = git(root, ["rev-parse", "--git-common-dir"]).trim();
  const gitDir = resolve(root, common);
  mkdirSync(resolve(gitDir, "info"), { recursive: true });
  return resolve(gitDir, "info/exclude");
}

// A block decision, rather than exit 0 from the fail-open hook, proves the install.
function verifyInstall(root, result) {
  if (!eslintResolvable(root)) {
    warnNoEslint(root, result);
    result.verification = { ok: false, reason: "eslint-missing" };
    return;
  }

  const before = status(root);
  const name = `agent-eslint-install-check-${randomBytes(4).toString("hex")}.ts`;
  const file = resolve(root, name);
  writeFileSync(file, VERIFY_SOURCE);

  try {
    if (isIgnored(root, name)) {
      result.warnings.push(`${name} is git-ignored in this project, so it cannot enter the diff scope and the hook cannot be exercised.`);
      result.verification = { ok: false, reason: "bait-ignored" };
      return;
    }

    const run = spawnSync(process.execPath, [resolve(root, SHIM)], {
      cwd: root,
      encoding: "utf8",
      input: JSON.stringify({ tool_name: "Edit", tool_input: { file_path: file } }),
      env: { ...process.env, AGENT_ESLINT_RUNNER: "", LINT_AGENT_TELEMETRY: "", LINT_AGENT_ONLY_FILES: "", LINT_AGENT_FORMAT: "", LINT_AGENT_ALLOW_COMMENTS: "" },
    });

    const decision = parseJson((run.stdout ?? "").trim());
    result.verification = {
      ok: decision?.decision === "block" && /agent\/no-comments/.test(decision.reason ?? ""),
      reason: decision?.decision === "block" ? "blocked" : "not-blocked",
      rules: rulesNamed(decision?.reason ?? ""),
      stderr: (run.stderr ?? "").trim(),
    };
    if (!result.verification.ok) {
      result.ok = false;
      result.errors.push(
        "the installed hook did not block on a deliberate violation, so checking is not working. " +
          `The hook said: ${result.verification.stderr || "(nothing)"}`,
      );
    }
  } finally {
    remove(file);
    if (status(root) !== before) {
      result.warnings.push("the working tree changed during verification; check `git status`.");
    }
  }
}

function rulesNamed(reason) {
  return [...new Set([...reason.matchAll(/\s([a-z@][\w@/-]*\/[\w-]+)\s*$/gm)].map((match) => match[1]))];
}

function warnNoEslint(root, result) {
  result.warnings.push(
    `no ESLint is resolvable from ${root}, so checking cannot work yet. Install the ` +
      "project's dependencies (e.g. npm install), then re-run with --check to confirm.",
  );
}

function eslintResolvable(root) {
  try {
    createRequire(pathToFileURL(resolve(root, "package.json")).href).resolve("eslint");
    return true;
  } catch {
    return false;
  }
}

function inspect(root, result, verify) {
  const problems = [];

  if (!existsSync(resolve(root, SHIM))) {
    problems.push(`${SHIM} is missing`);
  } else if (readFileSync(resolve(root, SHIM), "utf8") !== readFileSync(resolve(result.rulesDir, SHIM_SOURCE), "utf8")) {
    result.warnings.push(`${SHIM} differs from this clone's shim; re-run the installer to refresh it.`);
  }

  const settings = existsSync(resolve(root, SETTINGS)) ? parseJson(readFileSync(resolve(root, SETTINGS), "utf8")) : null;
  const post = Array.isArray(settings?.hooks?.PostToolUse) ? settings.hooks.PostToolUse : [];
  const entries = post.filter((group) => commandHooks(group).some(isOurs));
  if (entries.length === 0) {
    problems.push(`${SETTINGS} has no PostToolUse entry for the hook`);
  } else if (entries.length > 1) {
    problems.push(`${SETTINGS} has ${entries.length} PostToolUse entries for the hook`);
  } else {
    result.notes.push(`${SETTINGS} runs the hook on "${matcherOf(entries[0])}"`);
  }

  const link = resolve(root, LINK);
  const pathFile = resolve(root, PATH_FILE);
  const linked = entryExists(link);
  const recorded = existsSync(pathFile);
  if (linked && recorded) {
    problems.push(`both ${LINK} and ${PATH_FILE} exist; the install should have exactly one`);
  }
  if (!linked && !recorded) {
    problems.push(`neither ${LINK} nor ${PATH_FILE} exists, so the shim cannot find a clone`);
  }
  const clone = resolvedClone(root);
  if ((linked || recorded) && !clone) {
    problems.push(`${linked ? LINK : PATH_FILE} does not resolve to an agent-eslint-rules clone`);
  } else if (clone) {
    result.notes.push(`resolves to the clone at ${clone}`);
  }

  const exposed = INSTALLED_PATHS.filter((path) => entryExists(resolve(root, path)) && !isIgnored(root, path));
  if (exposed.length > 0) {
    problems.push(`${exposed.join(", ")} ${exposed.length === 1 ? "is" : "are"} not git-ignored in this project`);
  }

  if (!eslintResolvable(root)) {
    warnNoEslint(root, result);
  }

  result.errors.push(...problems);
  result.ok = problems.length === 0;
  if (result.ok && verify) {
    verifyInstall(root, result);
  }
  return result;
}

function resolvedClone(root) {
  const link = resolve(root, LINK);
  const pathFile = resolve(root, PATH_FILE);
  let dir = null;
  if (entryExists(link)) {
    try {
      dir = realpathSync(link);
    } catch {
      return null;
    }
  } else if (existsSync(pathFile)) {
    dir =
      readFileSync(pathFile, "utf8")
        .split("\n")
        .map((line) => line.trim())
        .find((line) => line && !line.startsWith("#")) ?? null;
  }
  if (!dir || !existsSync(resolve(dir, HOOK_MAIN_SOURCE)) || !existsSync(resolve(dir, RUNNER_SOURCE))) {
    return null;
  }
  return dir;
}

function uninstall(root, result) {
  for (const path of [SHIM, LINK, PATH_FILE]) {
    removeIfPresent(root, path, result);
  }

  const file = resolve(root, SETTINGS);
  if (existsSync(file)) {
    const raw = readFileSync(file, "utf8");
    const settings = parseJson(raw);
    if (!settings) {
      result.warnings.push(`${SETTINGS} is not valid JSON; left untouched.`);
    } else {
      stripOurEntry(root, file, raw, settings, result);
    }
  }

  for (const dir of [".claude/hooks", ".claude"]) {
    const path = resolve(root, dir);
    if (existsSync(path) && readdirSync(path).length === 0) {
      rmSync(path, { recursive: true });
      result.changes.push(`removed the now-empty ${dir}`);
    }
  }

  unignorePaths(root, result);
  result.ok = result.errors.length === 0;
  return result;
}

function stripOurEntry(root, file, raw, settings, result) {
  const post = Array.isArray(settings.hooks?.PostToolUse) ? settings.hooks.PostToolUse : null;
  if (!post) {
    return;
  }

  const groups = [];
  let removed = 0;
  for (const group of post) {
    if (!Array.isArray(group?.hooks)) {
      groups.push(group);
      continue;
    }
    const kept = group.hooks.filter((hook) => !isOurs(hook));
    removed += group.hooks.length - kept.length;
    if (kept.length > 0) {
      groups.push({ ...group, hooks: kept });
    }
  }
  if (removed === 0) {
    return;
  }

  const hooks = { ...settings.hooks };
  if (groups.length > 0) {
    hooks.PostToolUse = groups;
  } else {
    delete hooks.PostToolUse;
  }
  const next = { ...settings, hooks };
  if (Object.keys(hooks).length === 0) {
    delete next.hooks;
  }

  const bare = Object.keys(next).filter((key) => key !== "$schema");
  if (bare.length === 0) {
    unlinkSync(file);
    result.changes.push(`removed ${SETTINGS}, which held nothing but the hook entry`);
    return;
  }
  writeFile(root, SETTINGS, render(next, raw), result);
  result.changes.push(`removed the hook entry from ${SETTINGS}, keeping ${bare.length} other key(s)`);
}

function git(cwd, args) {
  return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}

function isTracked(root, path) {
  try {
    git(root, ["ls-files", "--error-unmatch", "--", path]);
    return true;
  } catch {
    return false;
  }
}

function isIgnored(root, path) {
  try {
    git(root, ["check-ignore", "--quiet", "--", path]);
    return true;
  } catch {
    return false;
  }
}

function status(root) {
  return git(root, ["status", "--porcelain", "--untracked-files=all"]);
}

function writeFile(root, path, content, result) {
  const file = resolve(root, path);
  const existed = existsSync(file);
  if (existed && readFileSync(file, "utf8") === content) {
    result.notes.push(`${path} is already up to date`);
    return;
  }
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
  result.changes.push(`${existed ? "updated" : "wrote"} ${path}`);
}

function removeIfPresent(root, path, result) {
  if (!entryExists(resolve(root, path))) {
    return;
  }
  remove(resolve(root, path));
  result.changes.push(`removed ${path}`);
}

// lstat, not existsSync: a symlink pointing nowhere still has to be removed.
function entryExists(path) {
  try {
    lstatSync(path);
    return true;
  } catch {
    return false;
  }
}

function remove(path) {
  try {
    rmSync(path, { recursive: true, force: true });
  } catch {
    unlinkSync(path);
  }
}

function isLinkTo(path, target) {
  try {
    return lstatSync(path).isSymbolicLink() && realpathSync(path) === realpathSync(target);
  } catch {
    return false;
  }
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function relativeToRoot(root, path) {
  return path.startsWith(`${root}/`) ? path.slice(root.length + 1) : path;
}

const USAGE = `Usage: node scripts/install.mjs <target> [--check|--uninstall] [options]

  <target>       any path inside the project to wire up; the repository root is used

  --check        report whether an install is present and healthy, changing nothing
  --uninstall    remove what was installed, leaving unrelated settings intact
  --path-file    record the clone's absolute path instead of creating a symlink
  --no-verify    skip running the hook at the end (verification is on by default)
  --rules <dir>  install from this clone instead of the one containing this script
  --json         print the result as JSON
  -h, --help     print this
`;

function parseArgs(argv) {
  const options = { mode: "install", verify: true, preferPathFile: false, json: false, rulesDir: RULES_DIR };
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--check" || arg === "--inspect") {
      options.mode = "check";
    } else if (arg === "--uninstall") {
      options.mode = "uninstall";
    } else if (arg === "--no-verify") {
      options.verify = false;
    } else if (arg === "--path-file") {
      options.preferPathFile = true;
    } else if (arg === "--json") {
      options.json = true;
    } else if (arg === "--rules") {
      options.rulesDir = argv[++i];
    } else if (arg === "-h" || arg === "--help") {
      options.help = true;
    } else if (arg.startsWith("-")) {
      options.unknown = arg;
    } else {
      positional.push(arg);
    }
  }
  options.target = positional[0];
  options.extra = positional.slice(1);
  return options;
}

function summary(result, heading) {
  if (!result.ok) {
    return `${heading} failed`;
  }
  const done = result.mode === "check" ? "the install is present and complete" : `${heading} succeeded`;
  if (result.mode === "uninstall" || result.verification?.ok) {
    return done;
  }
  return `${done}, but checking could not be proven to work yet (${result.verification?.reason ?? "not verified"})`;
}

function report(result) {
  const lines = [];
  const heading = { install: "install", check: "check", uninstall: "uninstall" }[result.mode];
  lines.push(`agent-eslint-rules ${heading}: ${result.root ?? result.target}`);
  if (result.root) {
    lines.push(`  rules clone: ${result.rulesDir}`);
  }
  for (const change of result.changes) {
    lines.push(`  + ${change}`);
  }
  for (const note of result.notes) {
    lines.push(`  . ${note}`);
  }
  for (const warning of result.warnings) {
    lines.push(`  ! ${warning}`);
  }
  for (const error of result.errors) {
    lines.push(`  x ${error}`);
  }
  if (result.verification?.ok) {
    lines.push(`  ok checking works: the hook blocked a deliberate violation (${result.verification.rules.join(", ") || "rules fired"})`);
  }
  lines.push(`  => ${summary(result, heading)}`);
  return lines.join("\n");
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const options = parseArgs(process.argv.slice(2));
  if (options.help || !options.target || options.unknown || options.extra.length > 0) {
    process.stdout.write(USAGE);
    process.exit(options.help ? 0 : 2);
  }
  const result = runInstaller(options);
  process.stdout.write(options.json ? `${JSON.stringify(result, null, 2)}\n` : `${report(result)}\n`);
  process.exit(result.ok ? 0 : 1);
}
