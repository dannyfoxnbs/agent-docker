/**
 * Simple Read-Only Plan Mode
 * Toggle with /plan or Ctrl+Alt+P
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

let on = false;
const ALLOWED_TOOLS = new Set([
  "read",
  "bash",
  "grep",
  "find",
  "ls",
]);
// Read-only commands only
const SAFE =
  /^\s*(cat|head|tail|less|grep|rg|find|ls|pwd|wc|sort|uniq|diff|file|stat|tree|which|jq|sed\s+-n|awk|bat|git\s+(status|log|diff|show|blame)|npm\s+(list|ls|view|info))\b/i;

// Dangerous shell features and write operations
const BLOCK =
  /\bsudo\b|&&|\|\||;|`|\$\(|>|>>|<|<<|<<<|\btee\b|\b(rm|mv|cp|mkdir|touch|chmod|chown|ln|install|truncate)\b|find\s+.*-(delete|exec)\b|git\s+(checkout|switch|restore|reset|revert|commit|merge|rebase|stash|tag|push|pull|fetch|branch|remote|worktree)\b|\bnpm\s+(install|i|update|uninstall|remove|rm|audit\s+fix|dedupe|rebuild|cache\s+clean)\b/i;

export default function (pi: ExtensionAPI) {
  function toggle(ctx: any) {
    on = !on;
    pi.setActiveTools(on ? ["read", "bash", "grep", "find", "ls"] : pi.getAllTools().map(t => t.name));
    ctx.ui.setStatus("plan", on ? "📋 PLAN" : undefined);
    ctx.ui.notify(on ? "📋 Plan mode ON" : "Plan mode OFF", "info");
  }

  pi.registerCommand("plan", { description: "Toggle plan mode", handler: async (_, ctx) => toggle(ctx) });
  pi.registerShortcut("ctrl+alt+p", { description: "Toggle plan mode", handler: async (ctx) => toggle(ctx) });

  pi.on("tool_call", async (e) => {
    if (!on || e.toolName !== "bash") return;

    if (!ALLOWED_TOOLS.has(e.toolName)) {
      return {
        block: true,
        reason: `🚫 Plan mode: tool '${e.toolName}' disabled`
      };
    }
    const cmd = e.input.command as string;
    if (cmd.includes("|")) {
      return {
        block: true,
        reason: "Pipes disabled in plan mode"
      };
    }
    if (!SAFE.test(cmd) || BLOCK.test(cmd))
      return { block: true, reason: `🚫 Plan mode: blocked. Use /plan to exit.\nCommand: ${cmd}` };
  });

  pi.on("before_agent_start", async () =>
    on ? { message: { customType: "plan", content: "[PLAN MODE] Read-only. Bash restricted to safe commands. Describe what you WOULD do. Say '/plan' to exit.", display: false } } : undefined
  );
}
