import { spawnSync } from "node:child_process";
import { appendFileSync, existsSync, readFileSync } from "node:fs";

// Shared hook implementation called by the installed shim.

const LINT_EXTENSIONS = new Set(["ts", "tsx", "js", "jsx"]);

// Only exit 1 means violations. Every other non-zero outcome is tooling failure.
const EXIT_CLEAN = 0;
const EXIT_VIOLATIONS = 1;

const NOT_CHECKED = "agent-lint: not checked - ";

export async function runHook({ projectDir, runner }) {
  const file = editedFile();

  if (!file || !isLintable(file)) {
    return;
  }

  const startedAt = Date.now();
  const result = spawnSync("node", [runner], {
    cwd: projectDir,
    encoding: "utf8",
    env: { ...process.env, LINT_AGENT_ONLY_FILES: file },
  });
  const lintDurationMs = Date.now() - startedAt;

  if (result.status === EXIT_CLEAN && !result.error && !result.signal) {
    record({ file, lintDurationMs, outcome: "clean", blocked: false, violations: 0, reasonChars: 0 });
    return;
  }

  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();

  if (result.status !== EXIT_VIOLATIONS) {
    const failure = `${NOT_CHECKED}lint tooling failure, not a rule violation: ${failureReason(result, output)}`;
    record({ file, lintDurationMs, outcome: "failure", blocked: false, violations: 0, reasonChars: 0, failure });
    console.error(failure);
    return;
  }

  const reason = [
    "lint:agent found agent-rule violations on lines you just changed. Fix them now,",
    "before moving on:",
    "",
    output,
  ].join("\n");

  record({
    file,
    lintDurationMs,
    outcome: "violations",
    blocked: true,
    violations: countViolations(output),
    reasonChars: reason.length,
  });

  process.stdout.write(JSON.stringify({ decision: "block", reason }));
}

function failureReason(result, output) {
  const detail = firstLine(output);
  return `${whatWentWrong(result)}${detail ? `: ${detail}` : "."}`;
}

function whatWentWrong(result) {
  if (result.error) {
    return `the lint runner could not be started (${result.error.code ?? result.error.message})`;
  }
  if (result.signal) {
    return `the lint runner was killed by ${result.signal}`;
  }
  if (result.status === null || result.status === undefined) {
    return "the lint runner exited without a status";
  }
  return `the lint runner exited ${result.status}`;
}

const MAX_DETAIL_CHARS = 500;

function firstLine(text) {
  const line = text.split("\n").map((part) => part.trim()).find(Boolean) ?? "";
  return line.length > MAX_DETAIL_CHARS ? `${line.slice(0, MAX_DETAIL_CHARS)}...` : line;
}

function editedFile() {
  let input = {};
  try {
    input = JSON.parse(readFileSync(0, "utf8") || "{}");
  } catch {
    return null;
  }
  return input.tool_response?.filePath ?? input.tool_input?.file_path ?? null;
}

function countViolations(text) {
  return text
    .split("\n")
    .filter((line) => /^\s*\d+:\d+\s+(error|warning)\s/.test(line)).length;
}

function record(event) {
  const target = process.env.LINT_AGENT_TELEMETRY;
  if (!target) {
    return;
  }
  try {
    appendFileSync(target, `${JSON.stringify({ at: new Date().toISOString(), ...event })}\n`);
  } catch {}
}

function isLintable(path) {
  return LINT_EXTENSIONS.has(path.split(".").pop() ?? "") && existsSync(path);
}
