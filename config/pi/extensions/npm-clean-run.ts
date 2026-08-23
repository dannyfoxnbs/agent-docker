/**
 * npm-clean-run - Trims npm/nx/yarn/pnpm command output to prevent
 * context pollution. Commands run normally (full output in TUI), but
 * only a success/fail summary with relevant tail reaches the LLM.
 *
 * Auto-loaded from ~/.pi/agent/extensions/
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { isBashToolResult } from "@earendil-works/pi-coding-agent";

/** Commands that trigger output trimming. Match at start of command line. */
const PACKAGE_MANAGERS = /^(npm|npx|nx|pnpm|yarn)\b/;

function buildSummary(
  firstLine: string,
  success: boolean,
  output: string,
): string {
  const status = success ? "✅ **SUCCESS**" : "❌ **FAILED**";
  const label = success ? "Last output" : "Error output (last 40 lines)";
  const tailLines = success ? 6 : 40;

  const lines = output.split("\n");
  const tail = lines.slice(-tailLines).join("\n").trim();

  if (!tail) return `${status}: \`${firstLine}\``;

  return `${status}: \`${firstLine}\`\n\n${label}:\n\`\`\`\n${tail}\n\`\`\``;
}

export default function (pi: ExtensionAPI) {
  // ── Visual feedback: footer status during execution ──────────────────
  pi.on("tool_execution_start", async (event, ctx) => {
    if (event.toolName !== "bash") return;
    const cmd = event.args?.command?.trim() ?? "";
    if (!PACKAGE_MANAGERS.test(cmd)) return;

    const firstLine = cmd.split("\n")[0].trim();
    ctx.ui.setStatus(
      "npm-run",
      ctx.ui.theme.fg("accent", `⚡ ${firstLine}`),
    );
  });

  pi.on("tool_execution_end", async (event, ctx) => {
    if (event.toolName !== "bash") return;
    const cmd = event.args?.command?.trim() ?? "";
    if (!PACKAGE_MANAGERS.test(cmd)) return;

    ctx.ui.setStatus("npm-run", undefined);

    const icon = event.isError ? "❌" : "✅";
    const verb = event.isError ? "failed" : "completed";
    ctx.ui.notify(
      `${icon} npm ${verb} — output trimmed for LLM context`,
      event.isError ? "error" : "info",
    );
  });

  // ── Output trimming (LLM only sees the summary) ─────────────────────
  pi.on("tool_result", async (event, _ctx) => {
    // Only interested in bash tool results
    if (event.toolName !== "bash") return;
    if (!isBashToolResult(event)) return;

    const cmd = event.input?.command?.trim() ?? "";
    if (!PACKAGE_MANAGERS.test(cmd)) return;

    const firstLine = cmd.split("\n")[0].trim();

    // Build trimmed content from the full output
    const rawText = (event.content ?? [])
      .map((c) => (c.type === "text" ? c.text : ""))
      .join("\n");

    const summary = buildSummary(firstLine, !event.isError, rawText);

    return {
      content: [{ type: "text", text: summary }],
      // Keep details (exitCode, stdout, stderr, etc.) unchanged
    };
  });
}
