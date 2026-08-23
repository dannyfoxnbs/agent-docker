import { spawn } from "node:child_process";
import { RUNNER } from "./workspace.mjs";

// Drives one non-interactive Claude Code session against one workspace and
// returns provider-reported usage plus everything derivable from the event
// stream. stream-json is used rather than plain json because the per-message
// usage is what makes peak context observable.
export function runClaude({ cwd, prompt, model, telemetryFile, timeoutMs = 900000, resumeSessionId = null, extraArgs = [] }) {
  const args = [
    ...(resumeSessionId ? ["--resume", resumeSessionId] : []),
    "-p",
    prompt,
    "--model",
    model,
    "--permission-mode",
    "acceptEdits",
    "--output-format",
    "stream-json",
    "--verbose",
    ...extraArgs,
  ];

  const env = { ...process.env, AGENT_ESLINT_RUNNER: RUNNER };
  if (telemetryFile) {
    env.LINT_AGENT_TELEMETRY = telemetryFile;
  }
  delete env.LINT_AGENT_ONLY_FILES;
  delete env.LINT_AGENT_ALLOW_COMMENTS;
  delete env.LINT_AGENT_FORMAT;

  return new Promise((resolvePromise) => {
    const startedAt = new Date();
    const child = spawn("claude", args, { cwd, env, stdio: ["ignore", "pipe", "pipe"] });
    const events = [];
    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, timeoutMs);

    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
      let newline = stdout.indexOf("\n");
      while (newline !== -1) {
        const line = stdout.slice(0, newline).trim();
        stdout = stdout.slice(newline + 1);
        if (line) {
          try {
            events.push(JSON.parse(line));
          } catch {
            // Non-JSON noise on stdout is not fatal; the result event is what matters.
          }
        }
        newline = stdout.indexOf("\n");
      }
    });
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      const endedAt = new Date();
      resolvePromise({
        ...summarize(events),
        exitCode: code,
        timedOut,
        stderr: stderr.slice(-4000),
        startedAt: startedAt.toISOString(),
        endedAt: endedAt.toISOString(),
        wallDurationMs: endedAt - startedAt,
      });
    });
  });
}

function summarize(events) {
  const result = events.find((event) => event.type === "result");
  const assistantMessages = events.filter((event) => event.type === "assistant");

  let toolCalls = 0;
  let editToolCalls = 0;
  let contextPeakTokens = 0;
  const toolsUsed = {};

  for (const event of assistantMessages) {
    for (const block of event.message?.content ?? []) {
      if (block.type !== "tool_use") {
        continue;
      }
      toolCalls += 1;
      toolsUsed[block.name] = (toolsUsed[block.name] ?? 0) + 1;
      if (["Edit", "Write", "MultiEdit", "NotebookEdit"].includes(block.name)) {
        editToolCalls += 1;
      }
    }
    const usage = event.message?.usage;
    if (usage) {
      const context =
        (usage.input_tokens ?? 0) +
        (usage.cache_read_input_tokens ?? 0) +
        (usage.cache_creation_input_tokens ?? 0);
      contextPeakTokens = Math.max(contextPeakTokens, context);
    }
  }

  const usage = result?.usage ?? {};
  return {
    sessionId: result?.session_id ?? null,
    isError: result?.is_error ?? true,
    stopReason: result?.stop_reason ?? result?.terminal_reason ?? null,
    apiDurationMs: result?.duration_api_ms ?? null,
    reportedDurationMs: result?.duration_ms ?? null,
    turns: result?.num_turns ?? null,
    costUsd: result?.total_cost_usd ?? null,
    tokens: {
      input: usage.input_tokens ?? 0,
      output: usage.output_tokens ?? 0,
      cacheRead: usage.cache_read_input_tokens ?? 0,
      cacheCreation: usage.cache_creation_input_tokens ?? 0,
    },
    toolCalls,
    editToolCalls,
    toolsUsed,
    contextPeakTokens,
    finalText: result?.result ?? null,
  };
}
