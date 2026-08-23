#!/usr/bin/env node
/**
 * Claude Code `PostToolUse` hook for agent-eslint-rules.
 *
 * The upstream repository installs a shim into each target project's
 * `.claude/hooks/` and derives the project directory from that shim's own
 * location. This setup instead ships the rules once per container, so the
 * project directory comes from the harness and the rules directory from the
 * mount.
 *
 * Resolve the rules clone with, in order:
 *   1. $AGENT_ESLINT_RUNNER   (explicit runner path, upstream's own override)
 *   2. $AGENT_ESLINT_RULES_DIR
 *   3. /opt/agent-eslint-rules (the Compose bind mount)
 *
 * Outcomes are upstream's: clean is silent, violations block, and anything
 * else fails open with one labelled warning so a missing mount is never
 * reported as a code violation.
 */
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const DEFAULT_RULES_DIR = "/opt/agent-eslint-rules";

const runner = process.env.AGENT_ESLINT_RUNNER
	? resolve(process.env.AGENT_ESLINT_RUNNER)
	: null;
const rulesDir = runner
	? dirname(runner)
	: resolve(process.env.AGENT_ESLINT_RULES_DIR || DEFAULT_RULES_DIR);
const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();

const hookMain = resolve(rulesDir, "claude-hook/hook-main.mjs");
const lintRunner = runner ?? resolve(rulesDir, "lint-agent.mjs");

for (const required of [hookMain, lintRunner]) {
	if (!existsSync(required)) {
		console.error(
			`agent-lint: not checked - ${required} is missing, so ${rulesDir} is not ` +
				"an agent-eslint-rules clone. Check the /opt/agent-eslint-rules mount.",
		);
		process.exit(0);
	}
}

const { runHook } = await import(pathToFileURL(hookMain).href);
await runHook({ projectDir, rulesDir, runner: lintRunner });
