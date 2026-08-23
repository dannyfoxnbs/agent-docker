/**
 * Code Review Agent Extension
 *
 * A deterministic, multi-agent workflow engine for code review.
 * Each stage runs in a completely isolated context via fresh pi processes.
 * Stages exchange structured JSON artifacts — not markdown reports.
 * All sub-agents are read-only: they cannot write, edit, or run commands.
 *
 * Usage:
 *   /cr-agent commit                   - Review the last commit (HEAD~1)
 *   /cr-agent branch [target]          - Review current branch against target
 *   /cr-agent status                   - Show current workflow status
 *   /cr-agent cancel                   - Cancel the current workflow
 *   /cr-agent debug                    - Toggle debug mode
 *   /cr-agent artifacts [on|off|summary|full|dump] - Toggle artifact rendering
 *
 * Pipeline:
 *   Stage 1: Detect        - Extension collects git data
 *   Stage 2: Explore       - Isolated agent identifies candidate findings
 *   Stage 3: Security      - Isolated security specialist reviews findings
 *   Stage 4: Performance   - Isolated performance specialist reviews findings
 *   Stage 5: Testing       - Isolated testing specialist reviews findings
 *   Stage 6: Architecture  - Isolated architecture specialist reviews findings
 *   Stage 7: Consensus     - Isolated arbitrator validates all findings
 *   Stage 8: Report        - Extension renders markdown from consensus
 *   Stage 9: Handoff       - Extension surfaces concise result to main chat
 */

import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { getMarkdownTheme } from "@earendil-works/pi-coding-agent";
import { Markdown } from "@earendil-works/pi-tui";
import { execSync } from "child_process";
import { readFile, access, constants } from "fs/promises";
import { resolve } from "path";
import { spawn } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

// =============================================================================
// Types
// =============================================================================

interface Finding {
	id: string;
	category: string;
	severity: "critical" | "high" | "medium" | "low" | "suggestion";
	file: string;
	title: string;
	description: string;
	reasoning: string[];
	confidence: number;
}

interface WorkflowArtifact<T> {
	id: string;
	workflowId: string;
	stage: string;
	version: number;
	createdAt: number;
	data: T;
}

interface AgentTrace {
	stage: string;
	inputSize: number;
	outputSize: number;
	findingsCount: number;
	summary: string;
	durationMs: number;
}

interface DetectArtifact {
	mode: "commit" | "branch";
	commitHash?: string;
	commitMessage?: string;
	currentBranch?: string;
	baseBranch?: string;
	commits?: { hash: string; message: string }[];
	files: string[];
	diff: string;
	fileContents: Record<string, string>;
}

interface ExploreArtifact {
	findings: Finding[];
}

interface SpecialistArtifact {
	validatedFindings: Finding[];
	rejectedFindings: string[];
	newFindings: Finding[];
}

interface ConsensusArtifact {
	acceptedFindings: Finding[];
	rejectedFindings: string[];
	risk: "low" | "medium" | "high" | "critical";
	confidence: number;
	recommendedActions: string[];
	summary: string;
}

interface ReviewHandoff {
	summary: string;
	risk: string;
	confidence: number;
	acceptedIssues: { title: string; severity: string; file: string }[];
	nextActions: string[];
}

interface WorkflowState {
	workflowId: string;
	status: "idle" | "running" | "done" | "error";
	stage: string;
	debug: boolean;
	showArtifacts: boolean;
	artifactDetail: "summary" | "full";
	mode?: "commit" | "branch";
	commitHash?: string;
	commitMessage?: string;
	baseBranch?: string;
	traces: AgentTrace[];
	detectArtifact?: WorkflowArtifact<DetectArtifact>;
	exploreArtifact?: WorkflowArtifact<ExploreArtifact>;
	securityArtifact?: WorkflowArtifact<SpecialistArtifact>;
	performanceArtifact?: WorkflowArtifact<SpecialistArtifact>;
	testingArtifact?: WorkflowArtifact<SpecialistArtifact>;
	architectureArtifact?: WorkflowArtifact<SpecialistArtifact>;
	consensusArtifact?: WorkflowArtifact<ConsensusArtifact>;
	handoff?: ReviewHandoff;
	error?: string;
}

// =============================================================================
// Constants
// =============================================================================

const MAX_DIFF_SIZE = 100_000;
const MAX_TOTAL_FILE_SIZE = 50_000;
const MAX_FILES = 10;
const MAX_ARTIFACT_CHARS = 16_000; // ~4k tokens
const MAX_FINDINGS = 20;
const MAX_REASONING_LINES = 3;
const MAX_HANDOFF_TOKENS = 500; // target

const DEBUG_WIDGET_ID = "cr-agent-debug";
const WORKFLOW_STATE_KEY = "cr-agent-state";

const STAGE_ORDER = [
	"detect",
	"explore",
	"security",
	"performance",
	"testing",
	"architecture",
	"consensus",
	"report",
	"handoff",
] as const;

type StageName = (typeof STAGE_ORDER)[number];

// =============================================================================
// Helper Functions
// =============================================================================

function runGit(cmd: string, cwd: string): string {
	try {
		return execSync(cmd, { cwd, encoding: "utf-8", timeout: 10000 }).trim();
	} catch {
		return "";
	}
}

function detectDefaultBaseBranch(cwd: string): string {
	const candidates = ["main", "master", "dev", "develop"];
	for (const candidate of candidates) {
		const result = runGit(`git rev-parse --verify --quiet origin/${candidate}`, cwd);
		if (result) return candidate;
	}
	return "main";
}

async function readChangedFiles(files: string[], cwd: string): Promise<Record<string, string>> {
	const contents: Record<string, string> = {};
	let totalSize = 0;

	for (const file of files.slice(0, MAX_FILES)) {
		const filePath = resolve(cwd, file);
		try {
			await access(filePath, constants.R_OK);
			const content = await readFile(filePath, "utf-8");
			if (content.includes("\0")) continue;

			const size = Buffer.byteLength(content, "utf-8");
			if (totalSize + size > MAX_TOTAL_FILE_SIZE) {
				contents[file] = `[File truncated - exceeds size limit]\n${content.slice(0, MAX_TOTAL_FILE_SIZE - totalSize)}`;
				break;
			}
			contents[file] = content;
			totalSize += size;
		} catch {
			contents[file] = "[File not available]";
		}
	}
	return contents;
}

function makeArtifactId(stage: string, workflowId: string): string {
	return `${workflowId}-${stage}-${Date.now()}`;
}

function createArtifact<T>(stage: string, workflowId: string, data: T): WorkflowArtifact<T> {
	return {
		id: makeArtifactId(stage, workflowId),
		workflowId,
		stage,
		version: 1,
		createdAt: Date.now(),
		data,
	};
}

function truncateArtifact<T>(artifact: WorkflowArtifact<T>): WorkflowArtifact<T> {
	const json = JSON.stringify(artifact);
	if (json.length <= MAX_ARTIFACT_CHARS) return artifact;

	// If too large, compress by truncating reasoning and reducing findings
	const compressed = JSON.parse(json);
	if (compressed.data?.findings) {
		compressed.data.findings = compressed.data.findings.slice(0, MAX_FINDINGS).map((f: any) => ({
			...f,
			reasoning: f.reasoning?.slice(0, MAX_REASONING_LINES) ?? [],
			description: f.description?.slice(0, 200) ?? "",
		}));
	}
	if (compressed.data?.validatedFindings) {
		compressed.data.validatedFindings = compressed.data.validatedFindings.slice(0, MAX_FINDINGS).map((f: any) => ({
			...f,
			reasoning: f.reasoning?.slice(0, MAX_REASONING_LINES) ?? [],
			description: f.description?.slice(0, 200) ?? "",
		}));
	}
	if (compressed.data?.newFindings) {
		compressed.data.newFindings = compressed.data.newFindings.slice(0, 5).map((f: any) => ({
			...f,
			reasoning: f.reasoning?.slice(0, MAX_REASONING_LINES) ?? [],
			description: f.description?.slice(0, 200) ?? "",
		}));
	}
	return compressed;
}

function safeJsonParse(text: string): any | null {
	try {
		// Extract JSON from markdown code block
		const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
		if (match) {
			return JSON.parse(match[1]);
		}
		// Try raw JSON
		return JSON.parse(text);
	} catch {
		return null;
	}
}

function getPiInvocation(extraArgs: string[]): { command: string; args: string[] } {
	const currentScript = process.argv[1];
	const isBunVirtualScript = currentScript?.startsWith("/$bunfs/root/");
	if (currentScript && !isBunVirtualScript && fs.existsSync(currentScript)) {
		return { command: process.execPath, args: [currentScript, ...extraArgs] };
	}
	const execName = path.basename(process.execPath).toLowerCase();
	const isGenericRuntime = /^(node|bun)(\.exe)?$/.test(execName);
	if (!isGenericRuntime) {
		return { command: process.execPath, args: extraArgs };
	}
	return { command: "pi", args: extraArgs };
}

async function tempFile(prefix: string, content: string): Promise<string> {
	const dir = await fs.promises.mkdtemp(path.join(os.tmpdir(), prefix));
	const file = path.join(dir, "content.md");
	await fs.promises.writeFile(file, content, { mode: 0o600 });
	return file;
}

async function runSubAgent(
	systemPrompt: string,
	userContent: string,
	cwd: string,
	signal?: AbortSignal,
	model?: string,
): Promise<{ text: string; durationMs: number; stderr: string; exitCode: number }> {
	const sysFile = await tempFile("cr-agent-sys-", systemPrompt);
	const userFile = await tempFile("cr-agent-user-", userContent);

	const args = [
		"--mode",
		"json",
		"-p",
		"--no-session",
		"--no-builtin-tools",
		"--tools",
		"read,grep,find,ls",
		"--exclude-tools",
		"bash,write,edit",
		"--append-system-prompt",
		sysFile,
		`@${userFile}`,
	];
	if (model) args.push("--model", model);

	const invocation = getPiInvocation(args);
	const result = { text: "", durationMs: 0, stderr: "", exitCode: 0 };
	const startTime = Date.now();

	await new Promise<void>((resolve) => {
		const proc = spawn(invocation.command, invocation.args, {
			cwd,
			shell: false,
			stdio: ["ignore", "pipe", "pipe"],
		});

		let buffer = "";
		const processLine = (line: string) => {
			if (!line.trim()) return;
			try {
				const event = JSON.parse(line);
				if (event.type === "message_end" && event.message) {
					const msg = event.message;
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
			if (buffer.trim()) processLine(buffer);
			result.exitCode = code ?? 0;
			result.durationMs = Date.now() - startTime;
			resolve();
		});

		proc.on("error", () => {
			result.exitCode = 1;
			result.durationMs = Date.now() - startTime;
			resolve();
		});

		if (signal) {
			const kill = () => {
				proc.kill("SIGTERM");
				setTimeout(() => {
					if (!proc.killed) proc.kill("SIGKILL");
				}, 5000);
			};
			if (signal.aborted) kill();
			else signal.addEventListener("abort", kill, { once: true });
		}
	});

	try {
		fs.unlinkSync(sysFile);
		fs.unlinkSync(userFile);
		fs.rmdirSync(path.dirname(sysFile));
		fs.rmdirSync(path.dirname(userFile));
	} catch {
		/* ignore */
	}

	return result;
}

// =============================================================================
// Prompts
// =============================================================================

const EXPLORE_PROMPT = `You are a read-only code explorer. You can read files, search, and list directories — but you CANNOT write, edit, or execute any commands.

Analyze the provided changes (either a single commit or a full branch diff) and identify candidate findings.

Output ONLY a JSON object in this exact format (no markdown prose outside the JSON):

{
  "findings": [
    {
      "id": "F001",
      "category": "security|performance|testing|architecture|bug",
      "severity": "critical|high|medium|low|suggestion",
      "file": "path/to/file.ts",
      "title": "Short title",
      "description": "Concise description",
      "reasoning": ["One-line reason 1", "One-line reason 2"],
      "confidence": 0.85
    }
  ]
}

Rules:
- Generate at most 10 findings.
- Keep reasoning to 1-2 lines per item.
- Confidence must be 0.0 to 1.0.
- Be specific about files and line numbers when possible.
- Return ONLY the JSON object. No explanations. No markdown outside the JSON block.`;

const SECURITY_PROMPT = `You are a read-only security specialist. You can read files, search, and list directories — but you CANNOT write, edit, or execute any commands.

Review the provided findings from a code explorer.

Validate, reject, or supplement findings. Output ONLY a JSON object:

{
  "validatedFindings": [
    {
      "id": "F001",
      "category": "security",
      "severity": "critical|high|medium|low|suggestion",
      "file": "path/to/file.ts",
      "title": "Short title",
      "description": "Concise description",
      "reasoning": ["One-line reason"],
      "confidence": 0.85
    }
  ],
  "rejectedFindings": ["F001: reason for rejection"],
  "newFindings": []
}

Rules:
- Validate findings that are genuine security concerns.
- Reject false positives or low-confidence noise.
- Add new security findings if you spot something the explorer missed.
- Keep reasoning to 1-2 lines.
- Return ONLY the JSON object.`;

const PERFORMANCE_PROMPT = `You are a read-only performance specialist. You can read files, search, and list directories — but you CANNOT write, edit, or execute any commands.

Review the provided findings from a code explorer.

Validate, reject, or supplement findings. Output ONLY a JSON object:

{
  "validatedFindings": [
    {
      "id": "F001",
      "category": "performance",
      "severity": "critical|high|medium|low|suggestion",
      "file": "path/to/file.ts",
      "title": "Short title",
      "description": "Concise description",
      "reasoning": ["One-line reason"],
      "confidence": 0.85
    }
  ],
  "rejectedFindings": ["F001: reason for rejection"],
  "newFindings": []
}

Rules:
- Validate findings that are genuine performance concerns.
- Reject false positives or speculative optimizations without evidence.
- Add new performance findings if you spot something the explorer missed.
- Keep reasoning to 1-2 lines.
- Return ONLY the JSON object.`;

const TESTING_PROMPT = `You are a read-only testing specialist. You can read files, search, and list directories — but you CANNOT write, edit, or execute any commands.

Review the provided findings from a code explorer.

Validate, reject, or supplement findings. Output ONLY a JSON object:

{
  "validatedFindings": [
    {
      "id": "F001",
      "category": "testing",
      "severity": "critical|high|medium|low|suggestion",
      "file": "path/to/file.ts",
      "title": "Short title",
      "description": "Concise description",
      "reasoning": ["One-line reason"],
      "confidence": 0.85
    }
  ],
  "rejectedFindings": ["F001: reason for rejection"],
  "newFindings": []
}

Rules:
- Validate findings about missing tests, poor test coverage, or test quality issues.
- Reject false positives.
- Add new testing findings if you spot something the explorer missed.
- Keep reasoning to 1-2 lines.
- Return ONLY the JSON object.`;

const ARCHITECTURE_PROMPT = `You are a read-only architecture specialist. You can read files, search, and list directories — but you CANNOT write, edit, or execute any commands.

Review the provided findings from a code explorer.

Validate, reject, or supplement findings. Output ONLY a JSON object:

{
  "validatedFindings": [
    {
      "id": "F001",
      "category": "architecture",
      "severity": "critical|high|medium|low|suggestion",
      "file": "path/to/file.ts",
      "title": "Short title",
      "description": "Concise description",
      "reasoning": ["One-line reason"],
      "confidence": 0.85
    }
  ],
  "rejectedFindings": ["F001: reason for rejection"],
  "newFindings": []
}

Rules:
- Validate findings about design patterns, coupling, cohesion, API design, or maintainability.
- Reject subjective or low-value style complaints.
- Add new architecture findings if you spot something the explorer missed.
- Keep reasoning to 1-2 lines.
- Return ONLY the JSON object.`;

const CONSENSUS_PROMPT = `You are a read-only independent code review arbitrator. You can read files, search, and list directories — but you CANNOT write, edit, or execute any commands.

You have received findings from multiple specialist reviewers.

Your task: synthesize all inputs and produce a final verdict. Output ONLY a JSON object:

{
  "acceptedFindings": [
    {
      "id": "F001",
      "category": "security|performance|testing|architecture|bug",
      "severity": "critical|high|medium|low|suggestion",
      "file": "path/to/file.ts",
      "title": "Short title",
      "description": "Concise description",
      "reasoning": ["One-line reason"],
      "confidence": 0.85
    }
  ],
  "rejectedFindings": ["F001: reason for rejection"],
  "risk": "low|medium|high|critical",
  "confidence": 87,
  "recommendedActions": ["Action 1", "Action 2"],
  "summary": "One-paragraph summary of the review."
}

Rules:
- Accept findings that have strong consensus or high confidence.
- Reject findings that are disputed, low confidence, or false positives.
- Risk should reflect the worst accepted finding.
- Confidence is 0-100 based on overall certainty.
- Recommended actions must be concrete and actionable.
- Return ONLY the JSON object. No prose outside JSON.`;

// =============================================================================
// Artifact Rendering — Deterministic, no LLM
// =============================================================================

type ArtifactLevel = "summary" | "full";

function renderFinding(f: Finding, level: ArtifactLevel): string[] {
	const lines: string[] = [];
	if (level === "summary") {
		lines.push(`[${f.severity.toUpperCase()}] ${f.title}  (${f.file})`);
	} else {
		lines.push(`─────────────────────────────────`);
		lines.push(`[${f.severity.toUpperCase()}] ${f.title}`);
		lines.push(`  File:  ${f.file}`);
		lines.push(`  ${f.description}`);
		if (f.reasoning && f.reasoning.length > 0) {
			lines.push(`  Reasoning:`);
			for (const r of f.reasoning) lines.push(`    • ${r}`);
		}
		lines.push(`  Confidence: ${Math.round(f.confidence * 100)}%`);
	}
	return lines;
}

function renderExploreArtifact(art: ExploreArtifact, level: ArtifactLevel): string {
	const lines: string[] = [
		`🔍  ARTIFACT: EXPLORE`,
		`─────────────────────────────────`,
		`Findings: ${art.findings.length}`,
		``,
	];
	if (art.findings.length === 0) {
		lines.push("No findings.");
	} else {
		for (const f of art.findings) {
			lines.push(...renderFinding(f, level));
		}
	}
	return lines.join("\n");
}

function renderSpecialistArtifact(stage: string, art: SpecialistArtifact, level: ArtifactLevel): string {
	const icon =
		stage === "security" ? "🛡️ " :
		stage === "performance" ? "⚡ " :
		stage === "testing" ? "🧪 " :
		stage === "architecture" ? "🏗️ " : "🔹 ";

	const lines: string[] = [
		`${icon} ARTIFACT: ${stage.toUpperCase()}`,
		`─────────────────────────────────`,
		`Validated: ${art.validatedFindings.length}  |  Rejected: ${art.rejectedFindings.length}  |  New: ${art.newFindings.length}`,
		``,
	];

	if (art.validatedFindings.length > 0) {
		lines.push(`── Validated Findings ──`);
		for (const f of art.validatedFindings) {
			lines.push(...renderFinding(f, level));
		}
		lines.push("");
	}

	if (art.rejectedFindings.length > 0) {
		lines.push(`── Rejected Findings ──`);
		for (const r of art.rejectedFindings) {
			lines.push(`  • ${r}`);
		}
		lines.push("");
	}

	if (art.newFindings.length > 0) {
		lines.push(`── New Findings ──`);
		for (const f of art.newFindings) {
			lines.push(...renderFinding(f, level));
		}
		lines.push("");
	}

	return lines.join("\n");
}

function renderConsensusArtifact(art: ConsensusArtifact, level: ArtifactLevel): string {
	const lines: string[] = [
		`⚖️  ARTIFACT: CONSENSUS`,
		`─────────────────────────────────`,
		`Risk: ${art.risk.toUpperCase()}  |  Confidence: ${art.confidence}%`,
		`Summary: ${art.summary}`,
		``,
		`Accepted: ${art.acceptedFindings.length}  |  Rejected: ${art.rejectedFindings.length}`,
		``,
	];

	if (art.acceptedFindings.length > 0) {
		lines.push(`── Accepted Findings ──`);
		for (const f of art.acceptedFindings) {
			lines.push(...renderFinding(f, level));
		}
		lines.push("");
	}

	if (art.rejectedFindings.length > 0) {
		lines.push(`── Rejected Findings ──`);
		for (const r of art.rejectedFindings) {
			lines.push(`  • ${r}`);
		}
		lines.push("");
	}

	if (art.recommendedActions.length > 0) {
		lines.push(`── Recommended Actions ──`);
		for (const a of art.recommendedActions) {
			lines.push(`  • ${a}`);
		}
		lines.push("");
	}

	return lines.join("\n");
}

function renderArtifactToString(
	stage: string,
	artifact: any,
	level: ArtifactLevel,
): string {
	if (stage === "explore") return renderExploreArtifact(artifact, level);
	if (["security", "performance", "testing", "architecture"].includes(stage)) {
		return renderSpecialistArtifact(stage, artifact, level);
	}
	if (stage === "consensus") return renderConsensusArtifact(artifact, level);
	return JSON.stringify(artifact, null, 2);
}

// =============================================================================
// Workflow Engine
// =============================================================================

interface StageConfig {
	name: StageName;
	systemPrompt: string;
	needsModel: boolean;
}

const STAGES: Record<string, StageConfig> = {
	explore: { name: "explore", systemPrompt: EXPLORE_PROMPT, needsModel: true },
	security: { name: "security", systemPrompt: SECURITY_PROMPT, needsModel: true },
	performance: { name: "performance", systemPrompt: PERFORMANCE_PROMPT, needsModel: true },
	testing: { name: "testing", systemPrompt: TESTING_PROMPT, needsModel: true },
	architecture: { name: "architecture", systemPrompt: ARCHITECTURE_PROMPT, needsModel: true },
	consensus: { name: "consensus", systemPrompt: CONSENSUS_PROMPT, needsModel: true },
};

// =============================================================================
// Main Extension
// =============================================================================

export default function codeReviewAgent(pi: ExtensionAPI) {
	let state: WorkflowState = {
		workflowId: `cr-${Date.now()}`,
		status: "idle",
		stage: "idle",
		debug: false,
		showArtifacts: false,
		artifactDetail: "summary",
		traces: [],
	};

	const persistState = () => {
		// Persist only minimal state — artifacts are large and stay in memory
		const minimal = {
			workflowId: state.workflowId,
			status: state.status,
			stage: state.stage,
			debug: state.debug,
			showArtifacts: state.showArtifacts,
			artifactDetail: state.artifactDetail,
			mode: state.mode,
			commitHash: state.commitHash,
			commitMessage: state.commitMessage,
			baseBranch: state.baseBranch,
			traces: state.traces,
			handoff: state.handoff,
			error: state.error,
		};
		pi.appendEntry(WORKFLOW_STATE_KEY, minimal);
	};

	// In-memory stage tracking for UI (not persisted)
	const stageStatuses = new Map<string, "pending" | "running" | "done" | "error">();
	const stageStartTimes = new Map<string, number>();

	const reconstructState = (ctx: ExtensionContext) => {
		const branch = ctx.sessionManager.getBranch();
		for (let i = branch.length - 1; i >= 0; i--) {
			const entry = branch[i];
			if (entry.type === "custom" && entry.customType === WORKFLOW_STATE_KEY) {
				const saved = entry.data as any;
				state = {
					...state,
					...saved,
					traces: saved.traces ?? [],
				};
				// Rebuild stage tracking from traces
				stageStatuses.clear();
				stageStartTimes.clear();
				for (const s of STAGE_ORDER) {
					const hasTrace = state.traces.some((t: AgentTrace) => t.stage === s);
					if (hasTrace) {
						stageStatuses.set(s, "done");
					} else if (state.status === "error" && state.stage === s) {
						stageStatuses.set(s, "error");
					} else {
						stageStatuses.set(s, "pending");
					}
				}
				return;
			}
		}
		state = {
			workflowId: `cr-${Date.now()}`,
			status: "idle",
			stage: "idle",
			debug: false,
			showArtifacts: false,
			artifactDetail: "summary",
			traces: [],
		};
		stageStatuses.clear();
		stageStartTimes.clear();
	};

	const updateDebugWidget = (ctx: ExtensionContext) => {
		if (!ctx.hasUI) return;
		if (state.status === "idle") {
			ctx.ui.setWidget(DEBUG_WIDGET_ID, []);
			return;
		}

		const lines: string[] = [
			`🔍 cr-agent | ${state.status.toUpperCase()} | ${state.stage}`,
		];

		// --- Pipeline checklist (always visible when active) ---
		const pipeline: string[] = [];
		for (const s of STAGE_ORDER) {
			const st = stageStatuses.get(s) ?? "pending";
			const start = stageStartTimes.get(s);
			if (st === "done") {
				const trace = state.traces.find((t) => t.stage === s);
				const dur = trace ? ` ${trace.durationMs}ms` : "";
				pipeline.push(`${s} ✅${dur}`);
			} else if (st === "running") {
				const elapsed = start ? ` ${((Date.now() - start) / 1000).toFixed(1)}s` : "";
				pipeline.push(`${s} 🔄${elapsed}`);
			} else if (st === "error") {
				pipeline.push(`${s} ❌`);
			} else {
				pipeline.push(`${s} ⏳`);
			}
		}
		lines.push(`   ${pipeline.join(" | ")}`);

		// --- Extra detail when debug mode ON ---
		if (state.debug) {
			lines.push(`   Workflow: ${state.workflowId}`);
			if (state.mode === "branch" && state.baseBranch) {
				lines.push(`   Mode: branch → ${state.baseBranch}`);
			} else if (state.mode === "commit") {
				lines.push(`   Mode: commit`);
			}
			if (state.traces.length > 0) {
				lines.push("   Traces:");
				for (const trace of state.traces.slice(-5)) {
					lines.push(
						`   ${trace.stage}: ${trace.findingsCount} findings | ${trace.durationMs}ms`,
					);
				}
			}
			if (state.detectArtifact) {
				lines.push(`   Detect: ${state.detectArtifact.data.files.length} files`);
			}
			if (state.exploreArtifact) {
				lines.push(`   Explore: ${state.exploreArtifact.data.findings.length} findings`);
			}
			if (state.securityArtifact) {
				lines.push(`   Security: ${state.securityArtifact.data.validatedFindings.length} validated`);
			}
			if (state.performanceArtifact) {
				lines.push(`   Performance: ${state.performanceArtifact.data.validatedFindings.length} validated`);
			}
			if (state.testingArtifact) {
				lines.push(`   Testing: ${state.testingArtifact.data.validatedFindings.length} validated`);
			}
			if (state.architectureArtifact) {
				lines.push(`   Architecture: ${state.architectureArtifact.data.validatedFindings.length} validated`);
			}
			if (state.consensusArtifact) {
				lines.push(`   Consensus: ${state.consensusArtifact.data.acceptedFindings.length} accepted | Risk: ${state.consensusArtifact.data.risk}`);
			}
		}

		if (state.error) {
			lines.push(`   Error: ${state.error}`);
		}

		ctx.ui.setWidget(DEBUG_WIDGET_ID, lines);
	};

	const buildDetectArtifact = async (cwd: string, mode: "commit" | "branch" = "commit", baseBranch?: string): Promise<WorkflowArtifact<DetectArtifact>> => {
		if (mode === "commit") {
			const commitHash = runGit("git rev-parse HEAD", cwd);
			const commitMessage = runGit("git log --format=%B -n 1 HEAD", cwd);
			const filesStr = runGit("git diff --name-only HEAD~1 HEAD", cwd);
			const files = filesStr ? filesStr.split("\n").filter((f) => f.trim()) : [];
			const diff = runGit("git diff HEAD~1 HEAD", cwd);
			const fileContents = await readChangedFiles(files, cwd);

			return createArtifact("detect", state.workflowId, {
				mode: "commit",
				commitHash,
				commitMessage,
				files,
				diff: diff.slice(0, MAX_DIFF_SIZE),
				fileContents,
			});
		}

		// Branch mode: compare HEAD against baseBranch
		const target = baseBranch ?? detectDefaultBaseBranch(cwd);
		const currentBranch = runGit("git rev-parse --abbrev-ref HEAD", cwd);

		// Verify target exists
		const targetExists = runGit(`git rev-parse --verify --quiet ${target}`, cwd);
		if (!targetExists) {
			throw new Error(`Base branch '${target}' not found. Fetch it or specify a different branch.`);
		}

		const filesStr = runGit(`git diff --name-only ${target}..HEAD`, cwd);
		const files = filesStr ? filesStr.split("\n").filter((f) => f.trim()) : [];
		const diff = runGit(`git diff ${target}..HEAD`, cwd);

		// Collect commits in the branch
		const logStr = runGit(`git log ${target}..HEAD --format=%H`, cwd);
		const commitHashes = logStr ? logStr.split("\n").filter((h) => h.trim()) : [];
		const commits = commitHashes.map((hash) => ({
			hash,
			message: runGit(`git log --format=%B -n 1 ${hash}`, cwd),
		}));

		const fileContents = await readChangedFiles(files, cwd);

		return createArtifact("detect", state.workflowId, {
			mode: "branch",
			currentBranch,
			baseBranch: target,
			commits,
			files,
			diff: diff.slice(0, MAX_DIFF_SIZE),
			fileContents,
		});
	};

	const buildStageInput = (stage: StageName): string => {
		switch (stage) {
			case "explore": {
				const d = state.detectArtifact!.data;
				if (d.mode === "branch") {
					return JSON.stringify({
						mode: "branch",
						baseBranch: d.baseBranch,
						commits: d.commits?.map((c) => ({ hash: c.hash.slice(0, 7), message: c.message })),
						files: d.files,
						diff: d.diff,
						fileContents: d.fileContents,
					});
				}
				return JSON.stringify({
					mode: "commit",
					commit: d.commitHash,
					message: d.commitMessage,
					files: d.files,
					diff: d.diff,
					fileContents: d.fileContents,
				});
			}
			case "security":
			case "performance":
			case "testing":
			case "architecture": {
				const explore = state.exploreArtifact!;
				return JSON.stringify({
					findings: explore.data.findings,
				});
			}
			case "consensus": {
				return JSON.stringify({
					exploreFindings: state.exploreArtifact!.data.findings,
					securityFindings: state.securityArtifact!.data,
					performanceFindings: state.performanceArtifact!.data,
					testingFindings: state.testingArtifact!.data,
					architectureFindings: state.architectureArtifact!.data,
				});
			}
			default:
				return "";
		}
	};

	const runStage = async (
		stageName: StageName,
		ctx: ExtensionContext,
		model?: string,
	): Promise<any> => {
		const config = STAGES[stageName];
		if (!config) throw new Error(`Unknown stage: ${stageName}`);

		const input = buildStageInput(stageName);
		const inputSize = Buffer.byteLength(input, "utf-8");

		// Mark stage as running
		stageStatuses.set(stageName, "running");
		stageStartTimes.set(stageName, Date.now());
		updateDebugWidget(ctx);

		if (ctx.hasUI) {
			ctx.ui.setStatus("cr-agent", `${stageName} 🔄 0.0s...`);
			ctx.ui.notify(`[cr-agent] ${stageName.toUpperCase()} — isolated agent starting...`, "info");
		}

		// Refresh widget every second while stage runs
		let refreshTimer: NodeJS.Timeout | null = null;
		if (ctx.hasUI) {
			refreshTimer = setInterval(() => {
				const elapsed = ((Date.now() - (stageStartTimes.get(stageName) ?? Date.now())) / 1000).toFixed(1);
				ctx.ui.setStatus("cr-agent", `${stageName} 🔄 ${elapsed}s...`);
				updateDebugWidget(ctx);
			}, 1000);
		}

		const { text, durationMs, stderr, exitCode } = await runSubAgent(
			config.systemPrompt,
			input,
			ctx.cwd,
			ctx.signal,
			model,
		);

		if (refreshTimer) clearInterval(refreshTimer);

		if (exitCode !== 0 && stderr) {
			console.error(`[cr-agent] ${stageName} stderr:`, stderr);
		}

		const outputSize = Buffer.byteLength(text, "utf-8");
		const parsed = safeJsonParse(text);

		if (!parsed) {
			stageStatuses.set(stageName, "error");
			stageStartTimes.delete(stageName);
			updateDebugWidget(ctx);
			throw new Error(
				`Stage ${stageName} returned invalid JSON. Exit code: ${exitCode}. Response: ${text.slice(0, 500)}`,
			);
		}

		// Count findings
		let findingsCount = 0;
		if (parsed.findings) findingsCount = parsed.findings.length;
		if (parsed.validatedFindings) findingsCount += parsed.validatedFindings.length;
		if (parsed.newFindings) findingsCount += parsed.newFindings.length;
		if (parsed.acceptedFindings) findingsCount = parsed.acceptedFindings.length;

		const trace: AgentTrace = {
			stage: stageName,
			inputSize,
			outputSize,
			findingsCount,
			durationMs,
			summary: `${stageName}: ${findingsCount} findings | ${durationMs}ms`,
		};
		state.traces.push(trace);
		persistState();

		// Mark stage as done
		stageStatuses.set(stageName, "done");
		stageStartTimes.delete(stageName);
		updateDebugWidget(ctx);

		if (ctx.hasUI) {
			ctx.ui.setStatus("cr-agent", `${stageName} ✅ ${durationMs}ms`);
			ctx.ui.notify(`[cr-agent] ${stageName.toUpperCase()} complete — ${findingsCount} findings, ${durationMs}ms`, "info");
		}

		return parsed;
	};

	const renderReport = (): string => {
		if (!state.consensusArtifact) return "No consensus available.";
		const c = state.consensusArtifact.data;
		const d = state.detectArtifact?.data;

		const lines: string[] = [];

		if (d?.mode === "branch") {
			lines.push(`# Code Review: ${d.currentBranch ?? "branch"} → ${d.baseBranch}`);
			lines.push(`**Commits:** ${d.commits?.length ?? 0} | **Files:** ${d.files.length}`);
		} else {
			lines.push(`# Code Review: ${state.commitHash?.slice(0, 7) ?? "unknown"}`);
		}

		lines.push(
			``,
			`**Risk:** ${c.risk.toUpperCase()}`,
			`**Confidence:** ${c.confidence}%`,
			``,
			`## Summary`,
			``,
			c.summary,
			``,
			`## Accepted Findings (${c.acceptedFindings.length})`,
			``,
		);

		for (const f of c.acceptedFindings) {
			lines.push(`**${f.severity.toUpperCase()}** — ${f.title}`);
			lines.push(`- File: \`${f.file}\``);
			lines.push(`- ${f.description}`);
			lines.push(``);
		}

		if (c.recommendedActions.length > 0) {
			lines.push(`## Recommended Actions`);
			lines.push(``);
			for (const action of c.recommendedActions) {
				lines.push(`- ${action}`);
			}
			lines.push(``);
		}

		lines.push(`---`);
		lines.push(`_Reviewed by cr-agent | ${state.traces.length} stages | ${state.traces.reduce((s, t) => s + t.durationMs, 0)}ms total_`);

		return lines.join("\n");
	};

	const buildHandoff = (): ReviewHandoff => {
		if (!state.consensusArtifact) {
			return {
				summary: "No consensus generated.",
				risk: "unknown",
				confidence: 0,
				acceptedIssues: [],
				nextActions: [],
			};
		}
		const c = state.consensusArtifact.data;
		return {
			summary: c.summary,
			risk: c.risk,
			confidence: c.confidence,
			acceptedIssues: c.acceptedFindings.map((f) => ({
				title: f.title,
				severity: f.severity,
				file: f.file,
			})),
			nextActions: c.recommendedActions,
		};
	};

	const maybeEmitArtifact = (stage: string, data: any) => {
		if (!state.showArtifacts) return;
		const rendered = renderArtifactToString(stage, data, state.artifactDetail);
		pi.sendMessage({
			customType: "cr-agent-artifact",
			content: rendered,
			display: true,
		});
	};

	const executeWorkflow = async (ctx: ExtensionContext, model?: string, mode: "commit" | "branch" = "commit", baseBranch?: string) => {
		try {
			// Reset stage tracking
			stageStatuses.clear();
			stageStartTimes.clear();
			for (const s of STAGE_ORDER) stageStatuses.set(s, "pending");

			// --- Stage 1: Detect (extension only) ---
			state.stage = "detect";
			state.status = "running";
			state.mode = mode;
			persistState();
			if (ctx.hasUI) {
				ctx.ui.setStatus("cr-agent", "detect 🔄...");
				ctx.ui.notify(`Collecting ${mode} data...`, "info");
			}
			updateDebugWidget(ctx);

			state.detectArtifact = await buildDetectArtifact(ctx.cwd, mode, baseBranch);
			state.commitHash = state.detectArtifact.data.commitHash;
			state.commitMessage = state.detectArtifact.data.commitMessage;
			if (mode === "branch") {
				state.baseBranch = state.detectArtifact.data.baseBranch;
			}
			stageStatuses.set("detect", "done");
			updateDebugWidget(ctx);

			// --- Stage 2: Explore ---
			state.stage = "explore";
			persistState();
			const exploreResult = await runStage("explore", ctx, model);
			state.exploreArtifact = createArtifact("explore", state.workflowId, {
				findings: (exploreResult.findings ?? []).slice(0, MAX_FINDINGS),
			});
			state.exploreArtifact = truncateArtifact(state.exploreArtifact);
			maybeEmitArtifact("explore", state.exploreArtifact.data);

			// --- Stage 3: Security ---
			state.stage = "security";
			persistState();
			const securityResult = await runStage("security", ctx, model);
			state.securityArtifact = createArtifact("security", state.workflowId, {
				validatedFindings: (securityResult.validatedFindings ?? []).slice(0, MAX_FINDINGS),
				rejectedFindings: securityResult.rejectedFindings ?? [],
				newFindings: (securityResult.newFindings ?? []).slice(0, 5),
			});
			state.securityArtifact = truncateArtifact(state.securityArtifact);
			maybeEmitArtifact("security", state.securityArtifact.data);

			// --- Stage 4: Performance ---
			state.stage = "performance";
			persistState();
			const performanceResult = await runStage("performance", ctx, model);
			state.performanceArtifact = createArtifact("performance", state.workflowId, {
				validatedFindings: (performanceResult.validatedFindings ?? []).slice(0, MAX_FINDINGS),
				rejectedFindings: performanceResult.rejectedFindings ?? [],
				newFindings: (performanceResult.newFindings ?? []).slice(0, 5),
			});
			state.performanceArtifact = truncateArtifact(state.performanceArtifact);
			maybeEmitArtifact("performance", state.performanceArtifact.data);

			// --- Stage 5: Testing ---
			state.stage = "testing";
			persistState();
			const testingResult = await runStage("testing", ctx, model);
			state.testingArtifact = createArtifact("testing", state.workflowId, {
				validatedFindings: (testingResult.validatedFindings ?? []).slice(0, MAX_FINDINGS),
				rejectedFindings: testingResult.rejectedFindings ?? [],
				newFindings: (testingResult.newFindings ?? []).slice(0, 5),
			});
			state.testingArtifact = truncateArtifact(state.testingArtifact);
			maybeEmitArtifact("testing", state.testingArtifact.data);

			// --- Stage 6: Architecture ---
			state.stage = "architecture";
			persistState();
			const architectureResult = await runStage("architecture", ctx, model);
			state.architectureArtifact = createArtifact("architecture", state.workflowId, {
				validatedFindings: (architectureResult.validatedFindings ?? []).slice(0, MAX_FINDINGS),
				rejectedFindings: architectureResult.rejectedFindings ?? [],
				newFindings: (architectureResult.newFindings ?? []).slice(0, 5),
			});
			state.architectureArtifact = truncateArtifact(state.architectureArtifact);
			maybeEmitArtifact("architecture", state.architectureArtifact.data);

			// --- Stage 7: Consensus ---
			state.stage = "consensus";
			persistState();
			const consensusResult = await runStage("consensus", ctx, model);
			state.consensusArtifact = createArtifact("consensus", state.workflowId, {
				acceptedFindings: (consensusResult.acceptedFindings ?? []).slice(0, MAX_FINDINGS),
				rejectedFindings: consensusResult.rejectedFindings ?? [],
				risk: consensusResult.risk ?? "medium",
				confidence: consensusResult.confidence ?? 50,
				recommendedActions: consensusResult.recommendedActions ?? [],
				summary: consensusResult.summary ?? "No summary.",
			});
			state.consensusArtifact = truncateArtifact(state.consensusArtifact);
			maybeEmitArtifact("consensus", state.consensusArtifact.data);

			// --- Stage 8: Report (extension renders) ---
			state.stage = "report";
			persistState();
			if (ctx.hasUI) {
				ctx.ui.setStatus("cr-agent", "report 🔄...");
				ctx.ui.notify("[cr-agent] Rendering report...", "info");
			}
			const report = renderReport();
			stageStatuses.set("report", "done");
			updateDebugWidget(ctx);

			// --- Stage 9: Handoff ---
			state.stage = "handoff";
			persistState();
			if (ctx.hasUI) {
				ctx.ui.setStatus("cr-agent", "handoff 🔄...");
				ctx.ui.notify("[cr-agent] Building handoff...", "info");
			}
			state.handoff = buildHandoff();
			stageStatuses.set("handoff", "done");
			state.status = "done";
			state.stage = "done";
			persistState();
			updateDebugWidget(ctx);

			// Surface only the handoff to main chat
			pi.sendMessage({
				customType: "cr-agent-handoff",
				content: report,
				display: true,
			});

			if (ctx.hasUI) {
				ctx.ui.setStatus("cr-agent", "");
				ctx.ui.notify("Code review complete. Handoff delivered.", "info");
			}
		} catch (err: any) {
			state.status = "error";
			state.error = err.message ?? String(err);
			state.stage = "error";
			stageStatuses.set(state.stage, "error");
			stageStartTimes.delete(state.stage);
			persistState();
			updateDebugWidget(ctx);
			if (ctx.hasUI) {
				ctx.ui.setStatus("cr-agent", "error ❌");
				ctx.ui.notify(`cr-agent failed: ${state.error}`, "error");
			}
			// Surface error as handoff
			pi.sendMessage({
				customType: "cr-agent-handoff",
				content: `**Code Review Error**\n\n${state.error}`,
				display: true,
			});
		}
	};

	// =============================================================================
	// Event handlers
	// =============================================================================

	pi.on("session_start", async (_event, ctx) => reconstructState(ctx));
	pi.on("session_tree", async (_event, ctx) => reconstructState(ctx));

	pi.on("session_shutdown", async (_event, _ctx) => {
		// Cleanup is minimal — state persists via appendEntry
	});

	// =============================================================================
	// Commands
	// =============================================================================

	pi.registerCommand("cr-agent", {
		description:
			"Code review agent workflow. Usage: /cr-agent commit | branch [target] | status | cancel | debug | artifacts [on|off|summary|full|dump]",
		handler: async (args, ctx) => {
			const [subcmd] = args.trim().split(/\s+/);

			switch (subcmd) {
				case "commit": {
					if (state.status === "running") {
						ctx.ui.notify(
							"Workflow already in progress. Use /cr-agent cancel to stop.",
							"warning",
						);
						return;
					}

					const gitDir = runGit("git rev-parse --git-dir", ctx.cwd);
					if (!gitDir) {
						ctx.ui.notify("Not a git repository.", "error");
						return;
					}

					ctx.ui.notify("Starting code review agent workflow...", "info");

					// Reset state
					state = {
						workflowId: `cr-${Date.now()}`,
						status: "running",
						stage: "detect",
						debug: state.debug,
						showArtifacts: state.showArtifacts,
						artifactDetail: state.artifactDetail,
						traces: [],
					};
					persistState();

					// Run workflow asynchronously
					const model = ctx.model ? `${ctx.model.provider}/${ctx.model.id}` : undefined;
					executeWorkflow(ctx, model, "commit").catch((err) => {
						console.error("[cr-agent] Unhandled workflow error:", err);
					});
					break;
				}

				case "branch": {
					if (state.status === "running") {
						ctx.ui.notify(
							"Workflow already in progress. Use /cr-agent cancel to stop.",
							"warning",
						);
						return;
					}

					const gitDir = runGit("git rev-parse --git-dir", ctx.cwd);
					if (!gitDir) {
						ctx.ui.notify("Not a git repository.", "error");
						return;
					}

					// Parse optional target branch
					const parts = args.trim().split(/\s+/);
					const targetBranch = parts[1];

					if (targetBranch) {
						ctx.ui.notify(`Starting branch review against '${targetBranch}'...`, "info");
					} else {
						const detected = detectDefaultBaseBranch(ctx.cwd);
						ctx.ui.notify(`Starting branch review against '${detected}' (auto-detected)...`, "info");
					}

					// Reset state
					state = {
						workflowId: `cr-${Date.now()}`,
						status: "running",
						stage: "detect",
						debug: state.debug,
						showArtifacts: state.showArtifacts,
						artifactDetail: state.artifactDetail,
						traces: [],
					};
					persistState();

					// Run workflow asynchronously
					const model = ctx.model ? `${ctx.model.provider}/${ctx.model.id}` : undefined;
					executeWorkflow(ctx, model, "branch", targetBranch).catch((err) => {
						console.error("[cr-agent] Unhandled workflow error:", err);
					});
					break;
				}

				case "status": {
					if (state.status === "idle") {
						ctx.ui.notify("No workflow in progress.", "info");
					} else if (state.status === "running") {
						if (state.mode === "branch" && state.baseBranch) {
							ctx.ui.notify(
								`Workflow: ${state.stage} (branch → ${state.baseBranch})`,
								"info",
							);
						} else {
							ctx.ui.notify(
								`Workflow: ${state.stage} (commit ${state.commitHash?.slice(0, 7) ?? "unknown"})`,
								"info",
							);
						}
					} else if (state.status === "done") {
						const handoff = state.handoff;
						if (handoff) {
							ctx.ui.notify(
								`Workflow complete. Risk: ${handoff.risk} | Confidence: ${handoff.confidence}% | Issues: ${handoff.acceptedIssues.length}`,
								"info",
							);
						} else {
							ctx.ui.notify("Workflow complete. No handoff generated.", "info");
						}
					} else if (state.status === "error") {
						ctx.ui.notify(`Workflow error: ${state.error}`, "error");
					}
					updateDebugWidget(ctx);
					break;
				}

				case "cancel": {
					if (state.status === "running") {
						state = {
							workflowId: `cr-${Date.now()}`,
							status: "idle",
							stage: "idle",
							debug: state.debug,
							showArtifacts: state.showArtifacts,
							artifactDetail: state.artifactDetail,
							traces: [],
						};
						stageStatuses.clear();
						stageStartTimes.clear();
						persistState();
						ctx.ui.setStatus("cr-agent", "");
						ctx.ui.setWidget(DEBUG_WIDGET_ID, []);
						ctx.ui.notify("Workflow cancelled.", "info");
					} else {
						ctx.ui.notify("No workflow in progress.", "info");
					}
					break;
				}

				case "artifacts": {
					const parts = args.trim().split(/\s+/);
					const sub = parts[1] ?? "on";

					if (sub === "on" || sub === "true") {
						state.showArtifacts = true;
						state.artifactDetail = "summary";
						persistState();
						ctx.ui.notify("[cr-agent] Artifacts ON (summary mode)", "info");
					} else if (sub === "off" || sub === "false") {
						state.showArtifacts = false;
						persistState();
						ctx.ui.notify("[cr-agent] Artifacts OFF", "info");
					} else if (sub === "summary") {
						state.showArtifacts = true;
						state.artifactDetail = "summary";
						persistState();
						ctx.ui.notify("[cr-agent] Artifacts ON (summary mode)", "info");
					} else if (sub === "full") {
						state.showArtifacts = true;
						state.artifactDetail = "full";
						persistState();
						ctx.ui.notify("[cr-agent] Artifacts ON (full mode)", "info");
					} else if (sub === "dump") {
						const artifacts = [
							{ stage: "explore", data: state.exploreArtifact?.data },
							{ stage: "security", data: state.securityArtifact?.data },
							{ stage: "performance", data: state.performanceArtifact?.data },
							{ stage: "testing", data: state.testingArtifact?.data },
							{ stage: "architecture", data: state.architectureArtifact?.data },
							{ stage: "consensus", data: state.consensusArtifact?.data },
						];
						for (const a of artifacts) {
							if (a.data) {
								maybeEmitArtifact(a.stage, a.data);
							}
						}
					} else {
						ctx.ui.notify(
							"Usage: /cr-agent artifacts [on|off|summary|full|dump]",
							"warning",
						);
					}
					break;
				}

				default: {
					ctx.ui.notify(
						"Usage: /cr-agent commit | branch [target] | status | cancel | debug | artifacts",
						"warning",
					);
					break;
				}
			}
		},
	});

	// =============================================================================
	// Custom renderers
	// =============================================================================

	pi.registerMessageRenderer("cr-agent-handoff", (message, _options, _theme) => {
		const mdTheme = getMarkdownTheme();
		return new Markdown(message.content, 0, 0, mdTheme);
	});

	pi.registerMessageRenderer("cr-agent-artifact", (message, _options, _theme) => {
		return new Markdown(message.content, 0, 0, getMarkdownTheme());
	});
}
