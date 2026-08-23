/**
 * Debate Extension — Fresh-context design debate with isolated agents
 *
 * Spawns two agents (proponent + skeptic) in isolated pi JSON processes
 * to debate a design decision. After N rounds, a moderator synthesizes.
 *
 * Only the moderator's summary is returned to the main agent.
 * The full transcript is kept in tool details + an optional tmux window.
 *
 * Usage:
 *   /debate Should we use Redis or Postgres for caching?
 *   /debate Should we use Redis or Postgres for caching? 5
 *   debate({ topic: "...", context: "...", rounds: 3, open_tmux: true })
 */

import { spawn, spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import type { Message } from "@earendil-works/pi-ai";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { Markdown, Text } from "@earendil-works/pi-tui";
import { getMarkdownTheme } from "@earendil-works/pi-coding-agent";
import { discoverAgents, getAgent, type AgentConfig } from "./agents.ts";

/* ──────────────── helpers ──────────────── */

function getPiInvocation(extraArgs: string[]): { command: string; args: string[] } {
	// Strategy 1: Try `pi` on PATH first (most reliable for npx/pnpm/bundled)
	try {
		const r = spawnSync("pi", ["--version"], { encoding: "utf8", timeout: 3000 });
		if (r.status === 0 || r.error === undefined) {
			return { command: "pi", args: extraArgs };
		}
	} catch {
		/* pi not on PATH */
	}

	// Strategy 2: Use process.argv[1] if it exists and is a real file
	const currentScript = process.argv[1];
	const isBunVirtualScript = currentScript?.startsWith("/$bunfs/root/");
	if (currentScript && !isBunVirtualScript && fs.existsSync(currentScript)) {
		return { command: process.execPath, args: [currentScript, ...extraArgs] };
	}

	// Strategy 3: If the runtime itself is pi (not node/bun), use it directly
	const execName = path.basename(process.execPath).toLowerCase();
	const isGenericRuntime = /^(node|bun)(\.exe)?$/.test(execName);
	if (!isGenericRuntime) {
		return { command: process.execPath, args: extraArgs };
	}

	// Strategy 4: Fallback — hope `pi` is on PATH even if --version failed
	return { command: "pi", args: extraArgs };
}

/** Write a temp file into a shared directory. */
async function tempFile(dir: string, prefix: string, content: string): Promise<string> {
	const file = path.join(dir, `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.md`);
	await fs.promises.writeFile(file, content, { mode: 0o600 });
	return file;
}

/** Extract plain text from a message content array or string. */
function extractTextContent(content: any): string {
	if (!content) return "";
	if (typeof content === "string") return content;
	if (Array.isArray(content)) {
		return content
			.filter((c: any) => c.type === "text")
			.map((c: any) => c.text)
			.join("\n");
	}
	return "";
}

const DEFAULT_AGENT_TIMEOUT_MS = 120_000;

/** Track active child pi processes so we can kill them if the parent exits. */
const activePids = new Set<number>();

function cleanupChildren() {
	for (const pid of activePids) {
		try {
			process.kill(pid, "SIGTERM");
		} catch {
			/* process may already be gone */
		}
	}
	activePids.clear();
}

// Ensure debate children die when the parent pi process exits
process.on("exit", cleanupChildren);
process.on("SIGINT", () => {
	cleanupChildren();
	process.exit(130);
});
process.on("SIGTERM", () => {
	cleanupChildren();
	process.exit(143);
});

/** Run a pi agent (JSON mode) once and return the final assistant text. */
async function runAgent(
	agent: AgentConfig,
	userContent: string,
	cwd: string,
	tmpDir: string,
	signal?: AbortSignal,
	model?: string,
	timeoutMs: number = DEFAULT_AGENT_TIMEOUT_MS,
): Promise<{ text: string; messages: Message[]; stderr: string; exitCode: number }> {
	const sysFile = agent.systemPrompt.trim()
		? await tempFile(tmpDir, "sys", agent.systemPrompt)
		: null;
	const userFile = await tempFile(tmpDir, "user", userContent);

	const args = [
		"--mode", "json", "-p", "--no-session",
		"--tools", agent.tools?.join(",") ?? "read,grep,find,ls",
	];
	if (model) args.push("--model", model);
	if (agent.model) args.push("--model", agent.model);
	if (sysFile) args.push("--append-system-prompt", sysFile);
	args.push(`@${userFile}`);

	const invocation = getPiInvocation(args);
	const result = { text: "", messages: [] as Message[], stderr: "", exitCode: 0 };
	let timedOut = false;

	await new Promise<void>((resolve) => {
		const proc = spawn(invocation.command, invocation.args, {
			cwd,
			shell: false,
			stdio: ["ignore", "pipe", "pipe"],
		});

		if (proc.pid) activePids.add(proc.pid);

		let buffer = "";
		const processLine = (line: string) => {
			if (!line.trim()) return;
			try {
				const event = JSON.parse(line);
				if (event.type === "message_end" && event.message) {
					const msg = event.message as Message;
					result.messages.push(msg);
					if (msg.role === "assistant") {
						for (const part of msg.content) {
							if (part.type === "text") result.text = part.text;
						}
					}
				}
			} catch {
				/* ignore non-JSON */
			}
		};

		proc.stdout.on("data", (data) => {
			buffer += data.toString();
			const lines = buffer.split("\n");
			buffer = lines.pop() || "";
			for (const line of lines) processLine(line);
		});

		proc.stderr.on("data", (data) => {
			result.stderr += data.toString();
		});

		proc.on("close", (code) => {
			if (proc.pid) activePids.delete(proc.pid);
			if (buffer.trim()) processLine(buffer);
			result.exitCode = code ?? 0;
			resolve();
		});

		proc.on("error", () => {
			if (proc.pid) activePids.delete(proc.pid);
			result.exitCode = 1;
			resolve();
		});

		// Timeout
		const timeoutId = setTimeout(() => {
			timedOut = true;
			if (proc.pid) {
				activePids.delete(proc.pid);
				try {
					process.kill(proc.pid, "SIGTERM");
				} catch {
					/* process may already be gone */
				}
				setTimeout(() => {
					if (proc.pid) {
						try {
							process.kill(proc.pid, "SIGKILL");
						} catch {
							/* process may already be gone */
						}
					}
				}, 5000);
			}
			resolve();
		}, timeoutMs);

		if (signal) {
			const kill = () => {
				clearTimeout(timeoutId);
				if (proc.pid) {
					activePids.delete(proc.pid);
					try {
						process.kill(proc.pid, "SIGTERM");
					} catch {
						/* process may already be gone */
					}
					setTimeout(() => {
						if (proc.pid) {
							try {
								process.kill(proc.pid, "SIGKILL");
							} catch {
								/* process may already be gone */
							}
						}
					}, 5000);
				}
				resolve();
			};
			if (signal.aborted) kill();
			else signal.addEventListener("abort", kill, { once: true });
		}
	});

	if (timedOut) {
		result.stderr += "\n[Agent timed out after " + (timeoutMs / 1000) + "s]";
		result.exitCode = result.exitCode || 124;
	}

	return result;
}

function hasTmux(): boolean {
	try {
		const r = spawnSync("tmux", ["-V"], { encoding: "utf8" });
		return r.status === 0;
	} catch {
		return false;
	}
}

async function createTmuxSession(
	logFile: string,
	sessionName: string,
): Promise<void> {
	return new Promise((resolve, reject) => {
		try {
			spawnSync("tmux", ["kill-session", "-t", sessionName]);
		} catch {
			/* ignore */
		}

		const newSess = spawn("tmux", [
			"new-session", "-d", "-s", sessionName,
			"-n", "debate",
			"sh", "-c",
			`clear && echo "📜 Debate starting... watch live below" && echo "" && tail -f ${logFile}`,
		]);
		newSess.on("close", (code) => {
			if (code !== 0) {
				reject(new Error(`tmux new-session failed: ${code}`));
				return;
			}
			if (process.env.TMUX) {
				spawn("tmux", ["switch-client", "-t", sessionName]);
			}
			resolve();
		});
	});
}

/* ──────────────── bundled default agents ──────────────── */

const BUNDLED_PROPONENT: AgentConfig = {
	name: "debate-proponent",
	description: "Advocate for the proposed approach with strong technical reasoning",
	tools: ["read", "grep", "find", "ls"],
	model: "kimi-k2p6-turbo",
	systemPrompt: `You are a **proponent** — an advocate for the proposed approach. Your job is to make the strongest possible case for why this idea is sound, practical, and worth pursuing.

**What to do:**
- Identify the strongest technical merits and strategic advantages
- Defend against criticism with evidence, data, or principled reasoning
- When risks are raised, propose mitigations rather than abandoning the approach
- Cite relevant patterns, prior art, or codebase evidence when helpful
- Keep responses concise (2-4 paragraphs)

**What NOT to do:**
- Do not ignore valid concerns — address them head-on
- Do not be vague or hand-wavy; be specific about why this works
- Do not modify, write, or edit any code (read-only)

You may use tools (read, grep, find, ls) to investigate the codebase if it strengthens your argument.`,
	source: "user",
	filePath: "<bundled>",
};

const BUNDLED_SKEPTIC: AgentConfig = {
	name: "debate-skeptic",
	description: "Challenge the proposed approach with critical analysis",
	tools: ["read", "grep", "find", "ls"],
	model: "kimi-k2p6-turbo",
	systemPrompt: `You are a **skeptic** — a critical challenger of the proposed approach. Your job is to pressure-test the idea and find where it might break, cost too much, or create hidden problems.

**What to do:**
- Identify risks, edge cases, hidden costs, and long-term consequences
- Ask hard questions about assumptions and unstated trade-offs
- Stress-test scalability, maintainability, and operational complexity
- Suggest simpler alternatives if they exist — even if they are less elegant
- Keep responses concise (2-4 paragraphs)

**What NOT to do:**
- Do not be contrarian for its own sake; every challenge must be grounded
- Do not dismiss the idea entirely without exploring mitigations
- Do not modify, write, or edit any code (read-only)

You may use tools (read, grep, find, ls) to investigate the codebase if it strengthens your critique.`,
	source: "user",
	filePath: "<bundled>",
};

const BUNDLED_MODERATOR: AgentConfig = {
	name: "debate-moderator",
	description: "Synthesize a debate into a balanced, actionable conclusion",
	model: "kimi-k2p6-turbo",
	systemPrompt: `You are a **neutral moderator**. You have watched a structured debate between a proponent and a skeptic. Your job is to synthesize their arguments into a clear, actionable conclusion.

**Output format:**

1. **Key arguments FOR** — the strongest points from the proponent (1-2 bullets)
2. **Key arguments AGAINST** — the strongest points from the skeptic (1-2 bullets)
3. **Areas of agreement** — what both sides converged on, if anything
4. **Verdict** — a clear recommendation: proceed / proceed with caution / reconsider / reject, with reasoning
5. **Open questions** — what still needs investigation before a final decision

**Rules:**
- Be concise. The entire synthesis should be 3-5 paragraphs max.
- Be fair. Don't straw-man either side.
- Be actionable. The verdict should tell the reader exactly what to do next.
- No preamble. Start directly with the synthesis.`,
	source: "user",
	filePath: "<bundled>",
};

function resolveAgents(agents: AgentConfig[]): {
	proponent: AgentConfig;
	skeptic: AgentConfig;
	moderator: AgentConfig;
	fromDisk: boolean;
} {
	const proponent = getAgent(agents, "debate-proponent") ?? BUNDLED_PROPONENT;
	const skeptic = getAgent(agents, "debate-skeptic") ?? BUNDLED_SKEPTIC;
	const moderator = getAgent(agents, "debate-moderator") ?? BUNDLED_MODERATOR;
	const fromDisk = proponent.filePath !== "<bundled>";
	return { proponent, skeptic, moderator, fromDisk };
}

/* ──────────────── debate logic ──────────────── */

interface Turn {
	round: number;
	agent: "proponent" | "skeptic";
	text: string;
}

/** Build the full cumulative transcript as context for the next turn. */
function buildCumulativeContext(transcript: Turn[], topic: string, forAgent: "proponent" | "skeptic"): string {
	const parts: string[] = [`The topic of debate is: ${topic}`, "", "Here is the full debate so far:"];
	for (const t of transcript) {
		const label = t.round === 0 ? "Opening" : `Round ${t.round + 1}`;
		parts.push(`\n[${t.agent.toUpperCase()} — ${label}]:\n${t.text}`);
	}
	parts.push(`\n\nYou are the ${forAgent}. Respond to the full debate above. Refine your position, concede valid points, or present new evidence.`);
	return parts.join("\n");
}

async function runDebate(
	topic: string,
	context: string | undefined,
	rounds: number,
	cwd: string,
	signal: AbortSignal | undefined,
	onProgress: (msg: string) => void,
	logFile: string,
	proponent: AgentConfig,
	skeptic: AgentConfig,
	tmpDir: string,
	model?: string,
): Promise<Turn[]> {
	const transcript: Turn[] = [];
	const basePrompt = [
		`The topic of debate is: ${topic}`,
		context ? `\nAdditional context from the main agent:\n${context}` : "",
		"\nThis is a structured debate. You are participating. Present your position and key arguments.",
	].join("\n");

	const appendLog = async (label: string, text: string) => {
		const divider = `\n${"═".repeat(60)}\n  ${label}\n${"═".repeat(60)}\n\n`;
		await fs.promises.appendFile(logFile, divider + text + "\n");
	};

	// Opening — Proponent
	onProgress("Proponent opening statement...");
	const propOpen = await runAgent(
		proponent,
		basePrompt + "\n\nYou are the proponent. Present your opening position.",
		cwd,
		tmpDir,
		signal,
		model,
	);
	transcript.push({ round: 0, agent: "proponent", text: propOpen.text });
	await appendLog("🟢 PROPONENT — Opening", propOpen.text);

	// Opening — Skeptic responds
	onProgress("Skeptic opening statement...");
	const skeptOpen = await runAgent(
		skeptic,
		basePrompt +
			`\n\nYou are the skeptic. The proponent has argued:\n\n${propOpen.text}\n\nPresent your opening position and response.`,
		cwd,
		tmpDir,
		signal,
		model,
	);
	transcript.push({ round: 0, agent: "skeptic", text: skeptOpen.text });
	await appendLog("🔴 SKEPTIC — Opening", skeptOpen.text);

	// Rounds — pass full cumulative transcript to each agent
	for (let round = 1; round < rounds; round++) {
		onProgress(`Round ${round + 1}/${rounds} — Proponent...`);
		const propCtx = buildCumulativeContext(transcript, topic, "proponent");
		const propResp = await runAgent(
			proponent,
			propCtx,
			cwd,
			tmpDir,
			signal,
			model,
		);
		transcript.push({ round, agent: "proponent", text: propResp.text });
		await appendLog(`🟢 PROPONENT — Round ${round + 1}`, propResp.text);

		onProgress(`Round ${round + 1}/${rounds} — Skeptic...`);
		const skeptCtx = buildCumulativeContext(transcript, topic, "skeptic");
		const skeptResp = await runAgent(
			skeptic,
			skeptCtx,
			cwd,
			tmpDir,
			signal,
			model,
		);
		transcript.push({ round, agent: "skeptic", text: skeptResp.text });
		await appendLog(`🔴 SKEPTIC — Round ${round + 1}`, skeptResp.text);
	}

	return transcript;
}

async function synthesize(
	transcript: Turn[],
	moderator: AgentConfig,
	cwd: string,
	tmpDir: string,
	signal?: AbortSignal,
	model?: string,
): Promise<string> {
	const transcriptText = transcript
		.map((t) => {
			const label = t.round === 0 ? "Opening" : `Round ${t.round + 1}`;
			const emoji = t.agent === "proponent" ? "🟢" : "🔴";
			return `## ${emoji} ${t.agent.toUpperCase()} — ${label}\n\n${t.text}`;
		})
		.join("\n\n---\n\n");

	const userPrompt = `## Debate Transcript\n\n${transcriptText}\n\nPlease provide a synthesis and conclusion.`;

	const result = await runAgent(moderator, userPrompt, cwd, tmpDir, signal, model);
	return result.text || "(Moderator produced no output)";
}

/* ──────────────── extension export ──────────────── */

export default function (pi: ExtensionAPI) {
	pi.registerCommand("debate", {
		description: "Debate a design decision with isolated agents. Usage: /debate <topic> [rounds]",
		handler: async (args, ctx) => {
			if (!ctx.hasUI) {
				ctx.ui.notify("debate requires interactive mode", "error");
				return;
			}

			const trimmed = args.trim();
			const match = trimmed.match(/^(.*?)(?:\s+(\d+))?\s*$/);
			const topic = (match?.[1] ?? trimmed).trim();
			const rounds = Math.min(Math.max(parseInt(match?.[2] ?? "3", 10), 1), 10);

			if (!topic) {
				ctx.ui.notify("Usage: /debate <topic> [rounds]", "error");
				return;
			}

			// Discover agents (with bundled fallback defaults)
			const { agents } = discoverAgents(ctx.cwd, "user");
			const { proponent, skeptic, moderator, fromDisk } = resolveAgents(agents);
			if (!fromDisk) {
				ctx.ui.notify("Using built-in debate agents. To customize, create ~/.pi/agent/agents/debate-*.md", "info");
			}

			const tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "pi-debate-"));
			const logFile = path.join(tmpDir, "debate.log");
			await fs.promises.writeFile(logFile, `📜 DEBATE: ${topic}\n\n`);

			// Tmux
			let tmuxSession: string | null = null;
			if (hasTmux()) {
				tmuxSession = `pi-debate-${Date.now()}`;
				try {
					await createTmuxSession(logFile, tmuxSession);
					ctx.ui.notify(`Tmux debate session: ${tmuxSession}`, "info");
					ctx.ui.notify(`Attach: tmux attach -t ${tmuxSession}`, "info");
				} catch (e) {
					ctx.ui.notify(`Tmux failed: ${e}`, "warning");
					tmuxSession = null;
				}
			}

			try {
				const transcript = await runDebate(
					topic,
					undefined,
					rounds,
					ctx.cwd,
					ctx.signal,
					(msg) => ctx.ui.setStatus("debate", msg),
					logFile,
					proponent,
					skeptic,
					tmpDir,
					ctx.model?.id,
				);

				ctx.ui.setStatus("debate", "Synthesizing...");
				const conclusion = await synthesize(
					transcript,
					moderator,
					ctx.cwd,
					tmpDir,
					ctx.signal,
					ctx.model?.id,
				);
				ctx.ui.setStatus("debate", "");

				await fs.promises.appendFile(
					logFile,
					`\n${"═".repeat(60)}\n  🏁 MODERATOR CONCLUSION\n${"═".repeat(60)}\n\n${conclusion}\n`,
				);

				// Inject ONLY the conclusion into the main session
				pi.sendMessage(
					{
						customType: "debate-result",
						content: `## 💬 Debate Summary: ${topic}\n\n${conclusion}`,
						display: true,
					},
					{ triggerTurn: true, deliverAs: "followUp" },
				);

				ctx.ui.notify("Debate complete. Only the summary was injected into the main session.", "info");
			} catch (err) {
				ctx.ui.setStatus("debate", "");
				ctx.ui.notify(`Debate error: ${err}`, "error");
			} finally {
				if (tmuxSession) {
					ctx.ui.notify(
						`Tmux session ${tmuxSession} left open. Kill: tmux kill-session -t ${tmuxSession}`,
						"info",
					);
				}
			}
		},
	});

	pi.registerTool({
		name: "debate",
		label: "Debate",
		description:
			"Spawn isolated proponent and skeptic agents to debate a design decision. After N rounds, a moderator synthesizes a conclusion. Only the summary is returned to the main agent. Full transcript is available in details and optionally in a tmux window.",
		promptSnippet: "Debate design decisions by spawning isolated proponent and skeptic agents",
		promptGuidelines: [
			"Use debate when the user asks for a second opinion on a design decision, proposal, or approach.",
			"Always include the relevant proposal, plan, or conversation context in the `context` parameter so the debate agents can see what they're debating.",
			"If the user is asking for opinions on something from the current conversation without restating it, set `summarize_context: true` to auto-extract recent messages.",
			"The debate returns only the moderator's summary. The full transcript is in the tool details and optionally in a tmux window.",
		],
		parameters: Type.Object({
			topic: Type.String({
				description: "Design question, proposal, or topic to debate",
			}),
			context: Type.Optional(
				Type.String({
					description: "Background context from the main conversation. Pass the relevant proposal, plan, or summary so the debate agents can see what they're debating.",
				}),
			),
			summarize_context: Type.Optional(
				Type.Boolean({
					description: "Auto-extract recent messages from the current conversation and append them as context. Use when the user refers to something discussed earlier without restating it.",
					default: false,
				}),
			),
			max_context_entries: Type.Optional(
				Type.Number({
					description: "Max recent messages to extract when summarize_context is true (default: 10, max: 20)",
					default: 10,
				}),
			),
			rounds: Type.Optional(
				Type.Number({
					description: "Debate rounds (default: 3, max: 5). Each round = proponent + skeptic.",
					default: 3,
				}),
			),
			open_tmux: Type.Optional(
				Type.Boolean({
					description: "Open a tmux window to watch the debate live (default: true)",
					default: true,
				}),
			),
		}),
		async execute(_toolCallId, params, signal, onUpdate, ctx) {
			let topic = params.topic;
			let context = params.context;
			const rounds = Math.min(Math.max(params.rounds ?? 3, 1), 5);
			const openTmux = params.open_tmux ?? true;
			const summarizeContext = params.summarize_context ?? false;
			const maxContextEntries = Math.min(Math.max(params.max_context_entries ?? 10, 1), 20);

			// Auto-extract recent conversation context if requested
			if (summarizeContext) {
				const entries = ctx.sessionManager.getBranch();
				const recent = entries.slice(-maxContextEntries);
				const conversationParts: string[] = [];
				for (const entry of recent) {
					if (entry.type === "message" && entry.message.role === "user") {
						const text = extractTextContent(entry.message.content);
						if (text) conversationParts.push(`[User]: ${text}`);
					} else if (entry.type === "message" && entry.message.role === "assistant") {
						const text = extractTextContent(entry.message.content);
						if (text) conversationParts.push(`[Assistant]: ${text}`);
					} else if (entry.type === "custom" && entry.customType === "debate-result") {
						conversationParts.push(`[Previous Debate]: ${entry.message?.content ?? ""}`);
					}
				}
				if (conversationParts.length > 0) {
					const autoContext = `\n\n--- Recent conversation context ---\n\n${conversationParts.join("\n\n")}`;
					context = context ? `${context}${autoContext}` : autoContext;
				}
			}

			// Discover agents (with bundled fallback defaults)
			const { agents } = discoverAgents(ctx.cwd, "user");
			const { proponent, skeptic, moderator } = resolveAgents(agents);

			const tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "pi-debate-"));
			const logFile = path.join(tmpDir, "debate.log");
			await fs.promises.writeFile(logFile, `📜 DEBATE: ${topic}\n\n`);

			let tmuxSession: string | null = null;
			if (openTmux && hasTmux()) {
				tmuxSession = `pi-debate-${Date.now()}`;
				try {
					await createTmuxSession(logFile, tmuxSession);
				} catch {
					tmuxSession = null;
				}
			}

			const onProgress = (msg: string) => {
				onUpdate?.({
					content: [{ type: "text", text: msg }],
					details: {},
				});
			};

			try {
				const transcript = await runDebate(
					topic,
					context,
					rounds,
					ctx.cwd,
					signal,
					onProgress,
					logFile,
					proponent,
					skeptic,
					tmpDir,
					ctx.model?.id,
				);

				onProgress("Moderator synthesizing...");
				const conclusion = await synthesize(
					transcript,
					moderator,
					ctx.cwd,
					tmpDir,
					signal,
					ctx.model?.id,
				);

				await fs.promises.appendFile(
					logFile,
					`\n${"═".repeat(60)}\n  🏁 MODERATOR CONCLUSION\n${"═".repeat(60)}\n\n${conclusion}\n`,
				);

				// Build details with full transcript but only return summary as content
				const transcriptMd = transcript
					.map((t) => {
						const label = t.round === 0 ? "Opening" : `Round ${t.round + 1}`;
						const emoji = t.agent === "proponent" ? "🟢" : "🔴";
						return `## ${emoji} ${t.agent.toUpperCase()} — ${label}\n\n${t.text}`;
					})
					.join("\n\n---\n\n");

				return {
					content: [
						{
							type: "text",
							text: `## 💬 Debate Summary: ${topic}\n\n${conclusion}`,
						},
					],
					details: {
						transcript: transcriptMd,
						topic,
						rounds,
						tmuxSession,
						logFile,
					},
				};
			} catch (err) {
				return {
					content: [{ type: "text", text: `Debate failed: ${err}` }],
					isError: true,
					details: {},
				};
			}
		},
	});

	// Render debate-result messages nicely in the TUI
	pi.registerMessageRenderer("debate-result", (message, _options, theme) => {
		const mdTheme = getMarkdownTheme();
		return new Markdown(message.content, 0, 0, mdTheme);
	});
}
