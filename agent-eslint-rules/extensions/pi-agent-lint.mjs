import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const RUNNER = fileURLToPath(new URL("../lint-agent.mjs", import.meta.url));
const LINT_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx"]);
const FAILURE_PREFIX = "agent-lint: not checked - ";

export default function agentLintExtension(pi) {
  pi.on("tool_result", async (event, ctx) => {
    const file = editedFile(event, ctx.cwd);
    if (!file || event.isError) {
      return;
    }

    const result = await runLint(ctx.cwd, file, ctx.signal);
    if (result.code === 0) {
      return;
    }

    const output = `${result.stdout}${result.stderr}`.trim();
    if (result.code === 1) {
      return {
        content: [
          ...event.content,
          {
            type: "text",
            text: [
              "Agent lint found violations after the file was written. Fix them before continuing:",
              bounded(output),
            ].join("\n\n"),
          },
        ],
        isError: true,
      };
    }

    return {
      content: [
        ...event.content,
        {
          type: "text",
          text: `${FAILURE_PREFIX}lint tooling failure, not a rule violation: ${failureReason(result, output)}`,
        },
      ],
    };
  });
}

function editedFile(event, cwd) {
  if (event.toolName !== "edit" && event.toolName !== "write") {
    return null;
  }
  const path = event.input?.path;
  if (typeof path !== "string") {
    return null;
  }
  const file = resolve(cwd, path.replace(/^@/, ""));
  return LINT_EXTENSIONS.has(extname(file)) && existsSync(file) ? file : null;
}

function runLint(cwd, file, signal) {
  return new Promise((complete) => {
    execFile(
      process.execPath,
      [RUNNER],
      {
        cwd,
        encoding: "utf8",
        env: { ...process.env, LINT_AGENT_ONLY_FILES: file },
        signal,
        timeout: 60_000,
      },
      (error, stdout, stderr) => {
        complete({
          code: error ? (typeof error.code === "number" ? error.code : null) : 0,
          signal: error?.signal ?? null,
          message: error?.message ?? "",
          stdout: stdout ?? "",
          stderr: stderr ?? "",
        });
      },
    );
  });
}

function bounded(output) {
  const limit = 50_000;
  return output.length <= limit ? output : `${output.slice(0, limit)}\n[lint output truncated]`;
}

function failureReason(result, output) {
  const detail = output.split("\n").map((line) => line.trim()).find(Boolean);
  if (result.signal) {
    return `the lint runner was killed by ${result.signal}`;
  }
  if (result.code === null) {
    return `the lint runner could not complete${result.message ? `: ${result.message}` : ""}`;
  }
  return `the lint runner exited ${result.code}${detail ? `: ${detail}` : ""}`;
}
