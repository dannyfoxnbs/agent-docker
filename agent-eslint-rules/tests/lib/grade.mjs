import { spawnSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { FIXTURES_DIR, RUNNER, changedFiles, diffStat } from "./workspace.mjs";

const CHECK_TIMEOUT_MS = 60000;

// Two independent verdicts per run, deliberately kept apart:
//   taskPassed         - does the code the agent wrote actually work?
//   residualViolations - what would a human still have to send back?
// A run only counts as accepted when both are satisfied, because the point of
// the rules is to remove the re-prompt cycle, not to pass lint for its own sake.
export function grade({ workspace, taskId }) {
  const task = runTaskCheck({ workspace, taskId });
  const residual = residualLint(workspace);
  return {
    taskPassed: task.passed,
    taskCheckOutput: task.output,
    residualViolations: residual.total,
    residualByRule: residual.byRule,
    residualDetail: residual.violations,
    lintError: residual.error ?? null,
    accepted: task.passed && residual.total === 0 && !residual.error,
    changedFiles: changedFiles(workspace),
    diffStat: diffStat(workspace),
  };
}

function runTaskCheck({ workspace, taskId }) {
  const check = resolve(FIXTURES_DIR, taskId, "check.mjs");
  if (!existsSync(check)) {
    throw new Error(`task ${taskId} has no check.mjs`);
  }
  const result = spawnSync("node", [check], {
    cwd: workspace,
    encoding: "utf8",
    timeout: CHECK_TIMEOUT_MS,
    env: { ...process.env, NODE_OPTIONS: "" },
  });
  return {
    passed: result.status === 0,
    output: `${result.stdout ?? ""}${result.stderr ?? ""}`.trim().slice(-3000),
  };
}

// Runs the same runner the hook runs, over every changed line in the final
// workspace, with no file narrowing. This is measured for both treatments -
// it is the only way to see what the no-lint arm leaves behind.
function residualLint(workspace) {
  const result = spawnSync("node", [RUNNER], {
    cwd: workspace,
    encoding: "utf8",
    timeout: CHECK_TIMEOUT_MS,
    env: {
      ...process.env,
      LINT_AGENT_FORMAT: "json",
      LINT_AGENT_ONLY_FILES: "",
      LINT_AGENT_ALLOW_COMMENTS: "",
    },
  });

  if (result.status !== 0 && result.status !== 1) {
    return {
      total: 0,
      byRule: {},
      violations: [],
      error: `lint-agent exited ${result.status}: ${(result.stderr ?? "").trim().slice(-1000)}`,
    };
  }

  try {
    return JSON.parse((result.stdout ?? "").trim().split("\n").at(-1));
  } catch {
    return {
      total: 0,
      byRule: {},
      violations: [],
      error: `could not parse lint-agent json output: ${(result.stdout ?? "").slice(-500)}`,
    };
  }
}

export function readLintTelemetry(file) {
  if (!file || !existsSync(file)) {
    return { blocks: 0, violations: 0, lintDurationMs: 0, blockReasonTokens: 0, hookRuns: 0 };
  }
  const events = readFileSync(file, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));

  const blocked = events.filter((event) => event.blocked);
  return {
    hookRuns: events.length,
    blocks: blocked.length,
    violations: blocked.reduce((sum, event) => sum + event.violations, 0),
    lintDurationMs: events.reduce((sum, event) => sum + event.lintDurationMs, 0),
    // Whole-token counts are not observable from here; characters/4 is the
    // standard approximation and is only ever compared against itself.
    blockReasonTokens: Math.round(blocked.reduce((sum, event) => sum + event.reasonChars, 0) / 4),
  };
}
