/**
 * Review Workflow Extension
 *
 * A deterministic, multi-agent code review pipeline that reviews the last commit
 * via fresh-context LLM calls at each stage.
 *
 * Usage:
 *   /crev commit   - Review the last commit (HEAD~1)
 *   /crev status   - Show current review stage
 *   /crev cancel   - Cancel the current review
 *
 * Pipeline:
 *   Stage 1: Detect   - Extension collects git data (commit, diff, files)
 *   Stage 2: Explore  - Fresh-context agent analyzes commit and identifies issues
 *   Stage 3: Review   - Fresh-context agent reviews findings and proposes a plan
 *   Stage 4: Consensus- Fresh-context agent validates the findings and plan
 *   Stage 5: Report   - Extension formats and presents the final report
 */

import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { execSync } from "child_process";
import { readFile, access, constants } from "fs/promises";
import { resolve } from "path";

// =============================================================================
// Types
// =============================================================================

interface ReviewState {
	stage: "idle" | "explore" | "review" | "debate" | "consensus" | "done";
	debug?: boolean;
	commitHash?: string;
	commitMessage?: string;
	files?: string[];
	diff?: string;
	fileContents?: Record<string, string>;
	findings?: string;
	plan?: string;
	debate?: string;
	consensus?: string;
}

// =============================================================================
// Constants
// =============================================================================

const MAX_DIFF_SIZE = 100_000;
const MAX_TOTAL_FILE_SIZE = 50_000;
const MAX_FILES = 10;

const DEBUG_WIDGET_ID = "review-debug";

const STAGE_PROMPTS: Record<string, string> = {
	explore: `You are a code explorer. Your task is to analyze the provided commit changes and identify key files, potential issues, notable patterns, and areas that need attention.

Focus on:
- What changed and why
- Potential bugs or regressions
- Security concerns
- Performance issues
- Code quality concerns
- Missing tests or documentation

Output your findings as a structured, detailed list. Be specific about file names and line numbers when possible. Use markdown formatting for clarity.`,

	review: `You are a senior code review agent. You have received findings from a code explorer. Your task is to review these findings and produce a structured plan for improvements.

For each issue identified, provide:
1. The specific file and location
2. A clear description of the problem
3. A concrete, actionable suggestion for improvement
4. The severity (critical, warning, suggestion)

Present your plan in a clear, structured format that a developer can act upon immediately. Use markdown formatting for clarity.`,

	debate: `You are a skeptical code reviewer and devil's advocate. Your job is to challenge, critique, and pressure-test the findings and proposed plan from another reviewer. Be constructive but skeptical.

For each finding and suggestion, ask hard questions:
- Are you sure this is actually a bug? Could it be intentional or acceptable behavior?
- Is this refactoring worth the risk? What could break?
- Did the reviewer consider performance, backwards compatibility, or edge cases?
- Is there a simpler solution that was overlooked?
- Are any findings false positives or over-engineering?

Output a structured critique. For each challenged point, explain:
1. What the reviewer claimed
2. Why you question it
3. What additional information would help resolve the doubt

Your goal is to surface weak spots in the review before final consensus.`,

	consensus: `You are an independent code review arbitrator. You have received findings, a plan, and a critique from two reviewers. Your task is to assess the full picture and give a balanced verdict.

Consider:
- The original findings and plan
- The critique and challenges raised
- Which points are solid, which are questionable, which are false positives

Provide:
1. Your assessment of whether you agree with the findings (agree / partially agree / disagree)
2. Which critique points are valid and which are not
3. Any concerns or gaps still outstanding
4. A brief overall verdict on the quality of the review

Be concise but thorough. Use markdown formatting for clarity.`,
};

// =============================================================================
// Helper functions
// =============================================================================

function extractText(message: any): string {
	if (!message.content) return "";

	if (typeof message.content === "string") {
		return message.content;
	}

	if (Array.isArray(message.content)) {
		const parts = message.content
			.filter((c: any) => c.type === "text")
			.map((c: any) => c.text);
		return parts.join("\n");
	}

	return "";
}

function runGit(cmd: string, cwd: string): string {
	try {
		return execSync(cmd, { cwd, encoding: "utf-8", timeout: 10000 }).trim();
	} catch {
		return "";
	}
}

async function readChangedFiles(files: string[], cwd: string): Promise<Record<string, string>> {
	const contents: Record<string, string> = {};
	let totalSize = 0;

	for (const file of files.slice(0, MAX_FILES)) {
		const path = resolve(cwd, file);
		try {
			await access(path, constants.R_OK);
			const content = await readFile(path, "utf-8");

			// Skip binary files
			if (content.includes("\0")) continue;

			const size = Buffer.byteLength(content, "utf-8");
			if (totalSize + size > MAX_TOTAL_FILE_SIZE) {
				contents[file] =
					`[File truncated - exceeds size limit]\n${content.slice(0, MAX_TOTAL_FILE_SIZE - totalSize)}`;
				break;
			}

			contents[file] = content;
			totalSize += size;
		} catch {
			contents[file] = "[File not available - may have been deleted or is inaccessible]";
		}
	}

	return contents;
}

// =============================================================================
// Main extension
// =============================================================================

export default function reviewWorkflow(pi: ExtensionAPI) {
	let state: ReviewState = { stage: "idle" };

	const persistState = () => {
		pi.appendEntry("review-state", { ...state });
	};

	const updateDebugWidget = (ctx: ExtensionContext) => {
		if (!state.debug) {
			ctx.ui.setWidget(DEBUG_WIDGET_ID, []);
			return;
		}
		const stageLabel = state.stage === "idle" ? "Idle" : state.stage === "done" ? "Done" : `Stage: ${state.stage}`;
		ctx.ui.setWidget(DEBUG_WIDGET_ID, [
			`🔍 crev debug | ${stageLabel.toUpperCase()}`,
			`   Context: FRESH (isolated) | Messages: ${state.stage === "idle" || state.stage === "done" ? "n/a" : "1–2"}`,
		]);
	};

	const reconstructState = (ctx: ExtensionContext) => {
		const branch = ctx.sessionManager.getBranch();
		for (let i = branch.length - 1; i >= 0; i--) {
			const entry = branch[i];
			if (entry.type === "custom" && entry.customType === "review-state") {
				state = { ...(entry.data as ReviewState) };
				return;
			}
		}
		state = { stage: "idle" };
	};

	// Build fresh-context messages for each stage
	function buildContext(stage: ReviewState): any[] {
		switch (stage.stage) {
			case "explore": {
				const parts = [
					`Please analyze this commit and identify key files and potential issues.`,
					``,
					`# Commit Review Request`,
					``,
					`**Commit:** ${stage.commitHash || "unknown"}`,
					`**Message:** ${stage.commitMessage || "No message"}`,
					``,
					`## Changed Files`,
					...(stage.files?.map((f) => `- ${f}`) || ["No files"]),
					``,
					`## Diff`,
					"```diff",
					stage.diff?.slice(0, MAX_DIFF_SIZE) || "No diff available",
					"```",
				];

				if (stage.fileContents && Object.keys(stage.fileContents).length > 0) {
					parts.push("", "## File Contents");
					for (const [file, content] of Object.entries(stage.fileContents)) {
						parts.push(`\n### ${file}\n\`\`\`\n${content}\n\`\`\``);
					}
				}

				return [
					{
						role: "user",
						content: [{ type: "text", text: parts.join("\n") }],
					},
				];
			}

			case "review": {
				return [
					{
						role: "user",
						content: [
							{
								type: "text",
								text: `## Code Explorer Findings\n\n${stage.findings || "No findings available."}\n\n---\n\nPlease review these findings and produce a structured plan for improvements.`,
							},
						],
					},
				];
			}

			case "debate": {
				return [
					{
						role: "user",
						content: [
							{
								type: "text",
								text: `## Code Review Findings\n\n${stage.findings || "No findings available."}\n\n---\n\n## Review Plan\n\n${stage.plan || "No plan available."}\n\n---\n\nPlease critique and challenge these findings and the proposed plan. Ask hard questions and identify weak spots.`,
							},
						],
					},
				];
			}

			case "consensus": {
				const summary = [
					`## Summary for Arbitration`,
					``,
					`### Findings`,
					stage.findings || "No findings available.",
					``,
					`### Review Plan`,
					stage.plan || "No plan available.",
					``,
					`### Debate / Critique`,
					stage.debate || "No debate available.",
					``,
					`---`,
					``,
					`Please assess the full picture — findings, plan, and critique — and give a balanced verdict.`,
				].join("\n");

				return [
					{
						role: "user",
						content: [{ type: "text", text: summary }],
					},
				];
			}

			default:
				return [];
		}
	}

	function generateReport() {
		const report = [
			`========================================`,
			`Code Review: ${state.commitHash?.slice(0, 7) || "unknown"}`,
			`========================================`,
			``,
			`**Commit:** ${state.commitMessage || "No message"}`,
			``,
			`---`,
			`## Explorer Findings`,
			``,
			state.findings || "No findings generated.",
			``,
			`---`,
			`## Review Plan`,
			``,
			state.plan || "No plan generated.",
			``,
			`---`,
			`## Debate / Critique`,
			``,
			state.debate || "No debate generated.",
			``,
			`---`,
			`## Validator Consensus`,
			``,
			state.consensus || "No consensus generated.",
			``,
			`========================================`,
		].join("\n");

		pi.sendMessage({
			customType: "review-report",
			content: report,
			display: true,
		});
	}

	// =============================================================================
	// Event handlers
	// =============================================================================

	pi.on("session_start", async (_event, ctx) => reconstructState(ctx));
	pi.on("session_tree", async (_event, ctx) => reconstructState(ctx));

	pi.on("before_agent_start", async (event, ctx) => {
		if (state.stage === "idle" || state.stage === "done") return;

		const prompt = STAGE_PROMPTS[state.stage];
		if (!prompt) return;

		if (state.debug) {
			ctx.ui.notify(
				`[crev] ${state.stage.toUpperCase()} — fresh context injected (${prompt.length} chars prompt)`,
				"info",
			);
		}
		updateDebugWidget(ctx);

		return {
			systemPrompt: prompt,
		};
	});

	pi.on("message_end", async (event, _ctx) => {
		// Tag assistant messages during the review pipeline so we can filter them out
		// of normal conversation context. The `reviewPipeline` field is a custom property
		// added to the message object; it persists because message_end return values
		// are stored back into the session.
		if (state.stage !== "idle" && state.stage !== "done" && !event.message.customType) {
			return {
				message: {
					...event.message,
					reviewPipeline: true,
				},
			};
		}
	});

	pi.on("context", async (event, ctx) => {
		if (state.stage === "idle" || state.stage === "done") {
			// Filter out review pipeline messages to prevent context pollution
			const filtered = event.messages.filter((m: any) => !m.reviewPipeline);
			if (state.debug && state.stage === "done") {
				ctx.ui.notify(
					`[crev] Normal context restored — ${filtered.length} messages (review pipeline hidden)`,
					"info",
				);
				updateDebugWidget(ctx);
			}
			return { messages: filtered };
		}

		const freshMessages = buildContext(state);
		if (freshMessages.length === 0) return;

		if (state.debug) {
			const userText = extractText(freshMessages[0]);
			ctx.ui.notify(
				`[crev] ${state.stage.toUpperCase()} context — ${freshMessages.length} message(s), ~${userText.length} chars`,
				"info",
			);
			updateDebugWidget(ctx);
		}

		return { messages: freshMessages };
	});

	pi.on("turn_end", async (event, ctx) => {
		if (state.stage === "idle" || state.stage === "done") return;

		const text = extractText(event.message);

		switch (state.stage) {
			case "explore": {
				state.findings = text;
				state.stage = "review";
				persistState();
				ctx.ui.setStatus("review", "Stage 3/5: Review");
				ctx.ui.notify("Explorer complete. Context resetting for Review...", "info");
				pi.sendUserMessage(
					"Please review these findings and suggest a structured plan for improvements.",
					{ deliverAs: "steer" },
				);
				break;
			}

			case "review": {
				state.plan = text;
				state.stage = "debate";
				persistState();
				ctx.ui.setStatus("review", "Stage 4/5: Debate");
				ctx.ui.notify("Review complete. Context resetting for Debate...", "info");
				pi.sendUserMessage(
					"Please critique and challenge these findings and the proposed plan. Ask hard questions.",
					{ deliverAs: "steer" },
				);
				break;
			}

			case "debate": {
				state.debate = text;
				state.stage = "consensus";
				persistState();
				ctx.ui.setStatus("review", "Stage 5/5: Consensus");
				ctx.ui.notify("Debate complete. Context resetting for Consensus...", "info");
				pi.sendUserMessage(
					"Please assess the findings, plan, and critique, and give a balanced verdict.",
					{ deliverAs: "steer" },
				);
				break;
			}

			case "consensus": {
				state.consensus = text;
				try {
					generateReport();
				} catch (err) {
					ctx.ui.notify(`Failed to generate report: ${err}`, "error");
				}
				state.stage = "done";
				persistState();
				ctx.ui.setStatus("review", "");
				ctx.ui.notify("Review complete! See the report above.", "info");
				break;
			}
		}
	});

	pi.on("agent_end", async (_event, ctx) => {
		// Reset only if the pipeline was genuinely interrupted (not when a steer
		// message is queued to advance to the next stage).
		if (state.stage !== "idle" && state.stage !== "done" && !ctx.hasPendingMessages()) {
			ctx.ui.notify("Review pipeline interrupted. Resetting.", "warning");
			state = { stage: "idle" };
			persistState();
			ctx.ui.setStatus("review", "");
		}
	});

	// =============================================================================
	// Commands
	// =============================================================================

	pi.registerCommand("crev", {
		description:
			"Code review workflow. Usage: /crev commit | /crev status | /crev cancel | /crev debug",
		handler: async (args, ctx) => {
			const [subcmd] = args.trim().split(/\s+/);

			switch (subcmd) {
				case "commit": {
					if (state.stage !== "idle" && state.stage !== "done") {
						ctx.ui.notify(
							"Code review already in progress. Use /crev cancel to stop.",
							"warning",
						);
						return;
					}

					const gitDir = runGit("git rev-parse --git-dir", ctx.cwd);
					if (!gitDir) {
						ctx.ui.notify("Not a git repository. Cannot review commit.", "error");
						return;
					}

					ctx.ui.notify("Starting code review pipeline...", "info");
					ctx.ui.setStatus("review", "Stage 1/5: Detect");

					const commitHash = runGit("git rev-parse HEAD", ctx.cwd);
					if (!commitHash) {
						ctx.ui.notify("Could not determine commit. Empty repo?", "error");
						ctx.ui.setStatus("review", "");
						return;
					}

					const commitMessage = runGit("git log --format=%B -n 1 HEAD", ctx.cwd);
					const filesStr = runGit("git diff --name-only HEAD~1 HEAD", ctx.cwd);
					const files = filesStr ? filesStr.split("\n").filter((f) => f.trim()) : [];
					const diff = runGit("git diff HEAD~1 HEAD", ctx.cwd);

					ctx.ui.notify(
						`Found ${files.length} changed file(s) in ${commitHash.slice(0, 7)}`,
						"info",
					);

					ctx.ui.setStatus("review", "Stage 1/5: Reading files...");
					const fileContents = await readChangedFiles(files, ctx.cwd);

					state = {
						stage: "explore",
						commitHash,
						commitMessage,
						files,
						diff,
						fileContents,
					};
					persistState();

					ctx.ui.setStatus("review", "Stage 2/5: Explore");
					ctx.ui.notify("Analyzing commit with explorer agent...", "info");
					pi.sendUserMessage(
						"Please analyze this commit and identify key files and potential issues.",
					);
					break;
				}

				case "status": {
					if (state.stage === "idle" || state.stage === "done") {
						ctx.ui.notify("No review in progress.", "info");
					} else {
						ctx.ui.notify(
							`Review: ${state.stage} (commit ${state.commitHash?.slice(0, 7) || "unknown"})`,
							"info",
						);
					}
					break;
				}

				case "cancel": {
					if (state.stage === "idle" || state.stage === "done") {
						ctx.ui.notify("No review in progress.", "info");
					} else {
						state = { stage: "idle" };
						persistState();
						ctx.ui.setStatus("review", "");
						ctx.ui.setWidget(DEBUG_WIDGET_ID, []);
						ctx.ui.notify("Review cancelled.", "info");
					}
					break;
				}

				case "debug": {
					state.debug = !state.debug;
					ctx.ui.notify(
						state.debug
							? "[crev] Debug mode ON — widget will show context isolation"
							: "[crev] Debug mode OFF",
						"info",
					);
					updateDebugWidget(ctx);
					break;
				}

				default: {
					ctx.ui.notify(
						"Usage: /crev commit | /crev status | /crev cancel | /crev debug",
						"warning",
					);
					break;
				}
			}
		},
	});
}
