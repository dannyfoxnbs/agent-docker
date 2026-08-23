import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { runClaude } from "../lib/claude-runner.mjs";
import { grade, readLintTelemetry } from "../lib/grade.mjs";
import { CORRECTION_STYLES, correctionPrompt } from "../lib/corrections.mjs";
import { FIXTURES_DIR, TESTS_DIR, assertDepsInstalled, createWorkspace } from "../lib/workspace.mjs";
import { TREATMENTS, compare, parseJsonl } from "../lib/evaluation.mjs";
import { renderReport } from "../lib/report.mjs";

const DEFAULT_MODEL = "sonnet";
const DEFAULT_REPLICATES = 3;
const DEFAULT_MAX_CORRECTIONS = 2;

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const option = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 || index === args.length - 1 ? fallback : args[index + 1];
};

if (flag("help")) {
  console.log(`Usage: node tests/scripts/run-eval.mjs [options]

  --tasks a,b          task ids to run (default: every task in the manifest)
  --arms a,b           treatments to run (default ${TREATMENTS.join(",")})
  --replicates N       paired replicates per task (default ${DEFAULT_REPLICATES})
  --model NAME         model alias passed to claude -p (default ${DEFAULT_MODEL})
  --max-corrections N  review rounds allowed after the first session (default ${DEFAULT_MAX_CORRECTIONS}, 0 disables)
  --correction STYLE   ${CORRECTION_STYLES.join(" | ")} (default standard)
  --out FILE           telemetry jsonl (default tests/results/run-<timestamp>.jsonl)
  --workspaces DIR     where workspaces are created (default tests/workspaces)
  --timeout MS         per-session timeout (default 900000)
  --dry-run            set up workspaces and print the plan without calling claude

Arms:
  no-lint  nothing - the agent is never told the house style
  prompt   the house style in CLAUDE.md, up front, no hook
  lint     the agent lint hook, no CLAUDE.md

Every arm runs the same review loop: while the work is not acceptable and rounds
remain, the session is resumed with a reviewer's correction. Reported cost, time,
turns and tokens are totals across every round, so the arms are compared on what
it takes to reach a solution a human would accept.
`);
  process.exit(0);
}

const manifest = JSON.parse(await readFile(resolve(TESTS_DIR, "tasks/manifest.json"), "utf8"));
const requested = option("tasks", null);
const taskIds = requested ? requested.split(",").map((id) => id.trim()).filter(Boolean) : manifest.tasks.map((task) => task.id);
const unknown = taskIds.filter((id) => !manifest.tasks.some((task) => task.id === id));
if (unknown.length) {
  console.error(`unknown task id(s): ${unknown.join(", ")}`);
  process.exit(1);
}

const requestedArms = option("arms", null);
const arms = requestedArms ? requestedArms.split(",").map((arm) => arm.trim()).filter(Boolean) : [...TREATMENTS];
const unknownArms = arms.filter((arm) => !TREATMENTS.includes(arm));
if (unknownArms.length) {
  console.error(`unknown arm(s): ${unknownArms.join(", ")}. Known arms: ${TREATMENTS.join(", ")}`);
  process.exit(1);
}

const replicates = Number(option("replicates", DEFAULT_REPLICATES));
const model = option("model", DEFAULT_MODEL);
const maxCorrections = Number(option("max-corrections", DEFAULT_MAX_CORRECTIONS));
const correctionStyle = option("correction", "standard");
const timeoutMs = Number(option("timeout", 900000));
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const outFile = resolve(option("out", resolve(TESTS_DIR, `results/run-${stamp}.jsonl`)));
const workspaceRoot = resolve(option("workspaces", resolve(TESTS_DIR, "workspaces")), stamp);
const dryRun = flag("dry-run");

if (!CORRECTION_STYLES.includes(correctionStyle)) {
  console.error(`--correction must be one of ${CORRECTION_STYLES.join(", ")}`);
  process.exit(1);
}

assertDepsInstalled();
for (const taskId of taskIds) {
  for (const file of ["prompt.md", "check.mjs", "workspace"]) {
    if (!existsSync(resolve(FIXTURES_DIR, taskId, file))) {
      console.error(`task ${taskId} is missing ${file}`);
      process.exit(1);
    }
  }
}

await mkdir(dirname(outFile), { recursive: true });
await mkdir(workspaceRoot, { recursive: true });

// Arm order rotates by replicate, so each arm takes each position an equal number
// of times and any drift in provider latency or caching cannot land consistently
// on one of them.
const plan = [];
for (const taskId of taskIds) {
  for (let replicate = 1; replicate <= replicates; replicate++) {
    const offset = (replicate - 1) % arms.length;
    for (const treatment of [...arms.slice(offset), ...arms.slice(0, offset)]) {
      plan.push({ taskId, replicate, treatment });
    }
  }
}

console.log(
  `${plan.length} sessions minimum: ${taskIds.length} task(s) x ${replicates} replicate(s) x ${arms.length} arm(s) (${arms.join(", ")}), model ${model}`,
);
console.log(`review loop: up to ${maxCorrections} correction round(s), ${correctionStyle} style`);
console.log(`telemetry -> ${outFile}`);
console.log(`workspaces -> ${workspaceRoot}`);

if (dryRun) {
  for (const item of plan) {
    const workspace = await createWorkspace({ ...item, root: workspaceRoot });
    console.log(`  ${item.taskId} r${item.replicate} ${item.treatment} -> ${workspace}`);
  }
  console.log("dry run: no sessions executed.");
  process.exit(0);
}

const sum = (rounds, pick) => rounds.reduce((total, round) => total + (pick(round) ?? 0), 0);

let index = 0;
for (const item of plan) {
  index += 1;
  const lintEnabled = item.treatment === "lint";
  const runId = `${item.taskId}--${item.treatment}--r${item.replicate}`;
  const workspace = await createWorkspace({ ...item, root: workspaceRoot });
  const telemetryFile = lintEnabled ? resolve(workspace, ".eval/lint-telemetry.jsonl") : null;
  const taskPrompt = await readFile(resolve(FIXTURES_DIR, item.taskId, "prompt.md"), "utf8");

  process.stdout.write(`[${index}/${plan.length}] ${runId} `);

  const rounds = [];
  let prompt = taskPrompt;
  let kind = "task";
  let resumeSessionId = null;
  let verdict = null;

  for (let round = 0; round <= maxCorrections; round++) {
    const session = await runClaude({ cwd: workspace, prompt, model, telemetryFile, timeoutMs, resumeSessionId });
    verdict = grade({ workspace, taskId: item.taskId });
    rounds.push({
      round,
      kind,
      promptChars: prompt.length,
      sessionId: session.sessionId,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      durationMs: session.reportedDurationMs ?? session.wallDurationMs,
      turns: session.turns ?? 0,
      tokens: session.tokens,
      costUsd: session.costUsd ?? 0,
      toolCalls: session.toolCalls,
      editToolCalls: session.editToolCalls,
      contextPeakTokens: session.contextPeakTokens,
      taskPassed: verdict.taskPassed,
      residualViolations: verdict.residualViolations,
      // Per round, not just per run, because the sensitivity analysis asks what
      // the *first* pass would have looked like with a given rule dropped - and
      // by the final round the rule has already been corrected away.
      residualByRule: verdict.residualByRule,
      accepted: verdict.accepted,
      error: session.isError || session.timedOut
        ? { timedOut: session.timedOut, exitCode: session.exitCode, stopReason: session.stopReason, stderr: session.stderr }
        : null,
    });
    process.stdout.write(verdict.accepted ? "." : verdict.taskPassed ? "o" : "x");

    if (verdict.accepted) {
      break;
    }
    const correction = correctionPrompt({ verdict, style: correctionStyle });
    if (!correction || round === maxCorrections) {
      break;
    }
    // Resuming keeps the reviewer in the same conversation, which is both what a
    // human does and the cheaper path - a fresh session would have to re-read
    // everything and would overstate the cost of a correction.
    resumeSessionId = rounds.at(-1).sessionId;
    prompt = correction.prompt;
    kind = correction.kind;
  }

  const lint = lintEnabled ? readLintTelemetry(telemetryFile) : null;
  const first = rounds[0];

  const record = {
    runId,
    taskId: item.taskId,
    replicate: item.replicate,
    treatment: item.treatment,
    model,
    correctionStyle,
    startedAt: first.startedAt,
    endedAt: rounds.at(-1).endedAt,
    durationMs: sum(rounds, (round) => round.durationMs),
    turns: sum(rounds, (round) => round.turns),
    tokens: {
      input: sum(rounds, (round) => round.tokens.input),
      output: sum(rounds, (round) => round.tokens.output),
      cacheRead: sum(rounds, (round) => round.tokens.cacheRead),
      cacheCreation: sum(rounds, (round) => round.tokens.cacheCreation),
    },
    costUsd: sum(rounds, (round) => round.costUsd),
    toolCalls: sum(rounds, (round) => round.toolCalls),
    editToolCalls: sum(rounds, (round) => round.editToolCalls),
    contextPeakTokens: Math.max(...rounds.map((round) => round.contextPeakTokens)),
    correctionRounds: rounds.length - 1,
    firstPass: {
      accepted: first.accepted,
      taskPassed: first.taskPassed,
      residualViolations: first.residualViolations,
      residualByRule: first.residualByRule,
      costUsd: first.costUsd,
      durationMs: first.durationMs,
      turns: first.turns,
    },
    // Cache creation is re-paid in full every round because each round is a
    // fresh `claude --resume` process. A human carrying on in a live session
    // inside the cache TTL pays cache reads instead, so this is the part of a
    // correction round's cost that is an artifact of the harness. Recorded so
    // the report can show the cost delta with it netted out.
    resumeCacheCreationTokens: sum(rounds.slice(1), (round) => round.tokens.cacheCreation),
    rounds,
    sessionError: rounds.find((round) => round.error)?.error ?? null,
    ...(lint ? { lint } : {}),
    validation: {
      taskPassed: verdict.taskPassed,
      accepted: verdict.accepted,
      residualViolations: verdict.residualViolations,
      residualByRule: verdict.residualByRule,
      lintError: verdict.lintError,
    },
    diff: { files: verdict.changedFiles, ...verdict.diffStat },
    workspace,
  };

  await appendFile(outFile, `${JSON.stringify(record)}\n`);
  await writeFile(
    resolve(workspace, ".eval/verdict.json"),
    `${JSON.stringify({ record, taskCheckOutput: verdict.taskCheckOutput, residualDetail: verdict.residualDetail }, null, 2)}\n`,
  );

  console.log(
    ` ${verdict.accepted ? "accepted" : verdict.taskPassed ? `unresolved (${verdict.residualViolations} violation(s))` : "task FAILED"}` +
      ` after ${record.correctionRounds} correction(s)` +
      ` · ${record.costUsd.toFixed(4)} USD · ${Math.round(record.durationMs / 1000)}s · ${record.turns} turns` +
      (lint ? ` · ${lint.blocks} block(s)` : ""),
  );
}

const reportFile = resolve(TESTS_DIR, "reports/index.html");
const runs = parseJsonl(await readFile(outFile, "utf8"));
await mkdir(dirname(reportFile), { recursive: true });
await writeFile(reportFile, renderReport(compare(runs)));
console.log(`\nreport -> ${reportFile}`);
