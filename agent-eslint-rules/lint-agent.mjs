import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { relative, resolve, sep } from "node:path";

const requireFromRepo = createRequire(
  pathToFileURL(resolve(process.cwd(), "package.json")).href,
);

let eslintPath;
try {
  eslintPath = requireFromRepo.resolve("eslint");
} catch {
  console.error(
    `agent lint: could not resolve eslint from ${process.cwd()}. Install the ` +
      "linted repo's dependencies first (e.g. npm install), or run this from " +
      "the repo root.",
  );
  process.exit(2);
}

let ESLint;
try {
  const eslintModule = await import(pathToFileURL(eslintPath).href);
  ESLint = eslintModule.ESLint ?? eslintModule.default.ESLint;
} catch (error) {
  console.error(
    `agent lint: eslint at ${eslintPath} could not be loaded. The install in ` +
      `${process.cwd()} is present but broken:`,
  );
  console.error(error);
  process.exit(2);
}

const CONFIG_FILE = fileURLToPath(
  new URL("./eslint.config.agent.mjs", import.meta.url),
);

const LINT_EXTENSIONS = new Set(["ts", "tsx", "js", "jsx"]);

// ESLint's max-params ranges exclude parts of multiline parameter lists, so
// those rules use file-level candidacy. HEAD comparison still decides novelty.
const STRUCTURAL_RULES = new Map([
  ["max-lines-per-function", "reported-range"],
  ["max-params", "whole-file"],
  ["@typescript-eslint/max-params", "whole-file"],
]);

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" });
}

function gitQuiet(args) {
  return execFileSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function hasCommit() {
  try {
    git(["rev-parse", "--verify", "--quiet", "HEAD"]);
    return true;
  } catch {
    return false;
  }
}

function assertGitRepository() {
  try {
    git(["rev-parse", "--git-dir"]);
  } catch (error) {
    throw new Error(
      `agent lint: ${process.cwd()} is not inside a git repository, so there ` +
        "is no working tree to compare against HEAD.",
      { cause: error },
    );
  }
}

function changedLinesByFile() {
  assertGitRepository();
  const changed = new Map();

  if (!hasCommit()) {
    for (const file of trackedFiles()) {
      changed.set(file, null);
    }
    for (const file of untrackedFiles()) {
      changed.set(file, null);
    }
    return changed;
  }

  const diff = git(["diff", "--unified=0", "--no-color", "--relative", "HEAD", "--"]);
  let currentFile = null;

  for (const line of diff.split("\n")) {
    if (line.startsWith("+++ b/")) {
      currentFile = line.slice("+++ b/".length);
      if (!changed.has(currentFile)) {
        changed.set(currentFile, new Set());
      }
      continue;
    }

    if (line.startsWith("@@") && currentFile) {
      const match = /\+(\d+)(?:,(\d+))?/.exec(line);
      if (!match) {
        continue;
      }
      const start = Number(match[1]);
      const count = match[2] === undefined ? 1 : Number(match[2]);
      const lines = changed.get(currentFile);
      for (let n = start; n < start + count; n++) {
        lines.add(n);
      }
    }
  }

  for (const file of untrackedFiles()) {
    if (!changed.has(file)) {
      changed.set(file, null);
    }
  }

  return changed;
}

function trackedFiles() {
  try {
    return gitFileList(["ls-files", "--cached"]);
  } catch {
    return [];
  }
}

function untrackedFiles() {
  try {
    return gitFileList(["ls-files", "--others", "--exclude-standard"]);
  } catch {
    return [];
  }
}

function gitFileList(args) {
  return git(args)
    .split("\n")
    .map((file) => file.trim())
    .filter(Boolean);
}

function repoRelative(filePath) {
  return relative(process.cwd(), filePath).split(sep).join("/");
}

function isLintable(file) {
  const ext = file.split(".").pop();
  return LINT_EXTENSIONS.has(ext) && existsSync(file);
}

function onlyFilesFilter() {
  const raw = process.env.LINT_AGENT_ONLY_FILES;
  if (!raw) {
    return null;
  }

  const allowed = new Set(
    raw
      .split("\n")
      .map((file) => file.trim())
      .filter(Boolean)
      .map((file) => resolve(file).replace(/\\/g, "/")),
  );

  return allowed.size > 0 ? allowed : null;
}

function isStructural(ruleId) {
  return ruleId !== null && ruleId !== undefined && STRUCTURAL_RULES.has(ruleId);
}

function isStructuralCandidate(message, changedLines) {
  if (STRUCTURAL_RULES.get(message.ruleId) === "whole-file") {
    return changedLines.size > 0;
  }

  const from = message.line;
  const to = message.endLine ?? message.line;
  for (const line of changedLines) {
    if (line >= from && line <= to) {
      return true;
    }
  }
  return false;
}

// Counts prevent identical diagnostics from hiding a newly added duplicate.
function violationKey(message) {
  return `${message.ruleId}\u0000${message.message.replace(/\d+/g, "#")}`;
}

function committedContent(relativePath) {
  try {
    return gitQuiet(["show", `HEAD:./${relativePath}`]);
  } catch {
    return null;
  }
}

async function committedStructuralPool(eslint, relativePath, absolutePath) {
  const committed = committedContent(relativePath);
  const pool = new Map();
  if (committed === null) {
    return pool;
  }

  const [result] = await eslint.lintText(committed, {
    filePath: absolutePath,
    warnIgnored: false,
  });

  for (const message of result?.messages ?? []) {
    if (!isStructural(message.ruleId)) {
      continue;
    }
    const key = violationKey(message);
    pool.set(key, (pool.get(key) ?? 0) + 1);
  }
  return pool;
}

async function messagesInScope(eslint, result, relativePath, changedLines) {
  if (changedLines === null) {
    return result.messages;
  }

  const kept = [];
  const candidates = [];

  for (const message of result.messages) {
    if (isStructural(message.ruleId)) {
      if (isStructuralCandidate(message, changedLines)) {
        candidates.push(message);
      }
    } else if (changedLines.has(message.line)) {
      kept.push(message);
    }
  }

  if (candidates.length === 0) {
    return kept;
  }

  const pool = await committedStructuralPool(eslint, relativePath, result.filePath);
  for (const message of candidates) {
    const preexisting = pool.get(violationKey(message)) ?? 0;
    if (preexisting > 0) {
      pool.set(violationKey(message), preexisting - 1);
      continue;
    }
    kept.push(message);
  }

  kept.sort((a, b) => a.line - b.line || a.column - b.column);
  return kept;
}

async function main() {
  const changed = changedLinesByFile();
  const allowed = onlyFilesFilter();

  if (allowed) {
    for (const file of changed.keys()) {
      if (!allowed.has(resolve(process.cwd(), file).replace(/\\/g, "/"))) {
        changed.delete(file);
      }
    }
  }

  const files = [...changed.keys()].filter(isLintable);

  if (files.length === 0) {
    console.log(
      process.env.LINT_AGENT_FORMAT === "json"
        ? JSON.stringify(toJsonReport([]))
        : "lint:agent - no changed source files to check.",
    );
    return;
  }

  const allowComments = process.env.LINT_AGENT_ALLOW_COMMENTS === "1";
  if (allowComments) {
    console.log(
      "lint:agent - LINT_AGENT_ALLOW_COMMENTS=1 set: comment rule relaxed for this run.",
    );
  }

  const eslint = new ESLint({
    overrideConfigFile: CONFIG_FILE,
    overrideConfig: allowComments
      ? [{ rules: { "agent/no-comments": "off" } }]
      : undefined,
  });
  const results = await eslint.lintFiles(files);

  let errorCount = 0;
  const filtered = [];

  for (const result of results) {
    const relativePath = repoRelative(result.filePath);
    if (!changed.has(relativePath)) {
      continue;
    }

    const messages = await messagesInScope(
      eslint,
      result,
      relativePath,
      changed.get(relativePath),
    );
    if (messages.length === 0) {
      continue;
    }

    errorCount += messages.filter((m) => m.severity === 2).length;
    filtered.push({ ...result, messages, errorCount: messages.length });
  }

  if (process.env.LINT_AGENT_FORMAT === "json") {
    console.log(JSON.stringify(toJsonReport(filtered)));
  } else {
    const formatter = await eslint.loadFormatter("stylish");
    const output = formatter.format(filtered);
    if (output.trim()) {
      console.log(output);
    }
  }

  if (errorCount > 0) {
    process.exitCode = 1;
  } else if (process.env.LINT_AGENT_FORMAT !== "json") {
    console.log("lint:agent - no agent rule violations on changed lines.");
  }
}

function toJsonReport(results) {
  const byRule = {};
  const violations = [];

  for (const result of results) {
    const relativePath = repoRelative(result.filePath);
    for (const message of result.messages) {
      const ruleId = message.ruleId ?? "unknown";
      byRule[ruleId] = (byRule[ruleId] ?? 0) + 1;
      violations.push({
        file: relativePath,
        line: message.line,
        ruleId,
        severity: message.severity,
        message: message.message,
      });
    }
  }

  return { total: violations.length, byRule, violations };
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 2;
});
