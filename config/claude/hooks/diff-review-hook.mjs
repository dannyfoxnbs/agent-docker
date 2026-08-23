#!/usr/bin/env node
/**
 * Claude Code `UserPromptExpansion` hook for `/diff-review`.
 *
 * Behavior (matches the "pure human-input device" spec from the README):
 *
 *   submit-with-content -> hook returns additionalContext = composed markdown
 *                          prompt; the slash command expands and Claude acts
 *                          on the review.
 *   cancel / close /
 *   submit-empty / error -> hook returns decision: "block"; the expansion is
 *                           blocked, the prompt never reaches Claude, and no
 *                           LLM call is made.
 *
 * This hook is a thin adapter around the existing `diff-review open` CLI:
 *   - exit 0 + non-empty stdout  => composed prompt
 *   - any other outcome           => abort
 *
 * Resolve the binary with, in order:
 *   1. $DIFF_REVIEW_BIN            (explicit override)
 *   2. `diff-review` on PATH       (npm i -g / npm link)
 *   3. `node <repo>/bin/diff-review` (local repo, no global install)
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..", "..");
const LOCAL_BIN = join(REPO_ROOT, "bin", "diff-review");

function readStdin() {
	return new Promise((resolve) => {
		let data = "";
		process.stdin.setEncoding("utf8");
		process.stdin.on("data", (chunk) => (data += chunk));
		process.stdin.on("end", () => resolve(data));
		process.stdin.on("error", () => resolve(""));
	});
}

function spawnWithStdio(cmd, args) {
	return new Promise((resolve) => {
		const child = spawn(cmd, args, { stdio: ["ignore", "pipe", "pipe"] });
		let stdout = "";
		let stderr = "";
		child.stdout.on("data", (d) => (stdout += d.toString("utf8")));
		child.stderr.on("data", (d) => (stderr += d.toString("utf8")));
		child.on("error", (err) =>
			resolve({ code: 127, stdout: "", stderr: err.message }),
		);
		child.on("close", (code) => resolve({ code: code ?? 0, stdout, stderr }));
	});
}

async function runDiffReview(base) {
	const override = process.env.DIFF_REVIEW_BIN;
	if (override) {
		return spawnWithStdio(override, buildArgs(base));
	}
	// Prefer the PATH-resolved shim (works after `npm link` / `npm i -g`).
	const pathResult = await spawnWithStdio("diff-review", buildArgs(base));
	if (pathResult.code !== 127) return pathResult;
	// Fall back to the local repo bin via node (no global install required).
	if (existsSync(LOCAL_BIN)) {
		return spawnWithStdio(process.execPath, [LOCAL_BIN, ...buildArgs(base)]);
	}
	return pathResult;
}

function buildArgs(base) {
	const args = ["open"];
	if (base && base.length > 0) args.push("--base", base);
	return args;
}

function emit(obj) {
	process.stdout.write(JSON.stringify(obj));
}

(async () => {
	let input = {};
	try {
		const raw = await readStdin();
		if (raw.trim().length > 0) input = JSON.parse(raw);
	} catch {
		// Malformed stdin is non-fatal: fall back to no base branch.
	}

	// Only act on our command. The matcher in settings.json already filters,
	// but double-check so the hook is safe to widen later.
	const name = input.command_name ?? "";
	if (name !== "diff-review" && !name.endsWith(":diff-review") && !name.endsWith("diff-review")) {
		// Not our command: allow the expansion to proceed unchanged.
		emit({});
		return;
	}

	const base = (input.command_args ?? "").trim();

	let result;
	try {
		result = await runDiffReview(base);
	} catch (err) {
		const reason = err instanceof Error ? err.message : String(err);
		emit({ decision: "block", reason: `diff-review failed to start: ${reason}` });
		return;
	}

	const prompt = result.stdout.trim();

	if (result.code === 0 && prompt.length > 0) {
		emit({
			hookSpecificOutput: {
				hookEventName: "UserPromptExpansion",
				additionalContext: prompt,
			},
		});
		return;
	}

	const reason =
		result.stderr.trim() ||
		(result.code === 0
			? "Review submitted with no comments."
			: "Review cancelled or closed.");
	emit({ decision: "block", reason });
})();
