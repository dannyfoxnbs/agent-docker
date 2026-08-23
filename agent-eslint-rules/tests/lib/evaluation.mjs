// Three arms, not two. `prompt` exists because the honest alternative to a hook
// is not "no style at all" - it is telling the agent the rules once, up front, in
// CLAUDE.md, the way any repo already tells it everything else. That file is
// loaded every session automatically and sits in the cached prefix, so its
// marginal cost is close to zero. Without this arm the experiment can only show
// that a hook beats nothing, which was never the question.
export const TREATMENTS = ["no-lint", "prompt", "lint"];

// Everything is measured as a delta against this arm, so it is the one that must
// be present for a task/replicate to count as a pair.
export const BASELINE_TREATMENT = "no-lint";

const REQUIRED_FIELDS = [
  "runId",
  "taskId",
  "replicate",
  "treatment",
  "model",
  "startedAt",
  "endedAt",
  "durationMs",
  "tokens",
  "costUsd",
  "toolCalls",
  "turns",
  "validation",
];

const OPTIONAL_NUMERIC = ["contextPeakTokens", "correctionRounds"];

const TOKEN_FIELDS = ["input", "output", "cacheRead", "cacheCreation"];
const LINT_FIELDS = ["blocks", "violations", "lintDurationMs", "blockReasonTokens"];

const numeric = (value) => typeof value === "number" && Number.isFinite(value) && value >= 0;

export function validateRun(run) {
  const errors = [];
  if (!run || typeof run !== "object") return ["record must be an object"];

  for (const field of REQUIRED_FIELDS) {
    if (run[field] === undefined || run[field] === null || run[field] === "") errors.push(`missing ${field}`);
  }
  if (!TREATMENTS.includes(run.treatment)) errors.push(`treatment must be one of ${TREATMENTS.join(", ")}`);
  if (!Number.isInteger(run.replicate) || run.replicate < 1) errors.push("replicate must be a positive integer");

  for (const field of TOKEN_FIELDS) {
    if (!numeric(run.tokens?.[field])) errors.push(`tokens.${field} must be a non-negative number`);
  }
  for (const field of ["costUsd", "toolCalls", "turns", "durationMs"]) {
    if (!numeric(run[field])) errors.push(`${field} must be a non-negative number`);
  }
  for (const field of OPTIONAL_NUMERIC) {
    if (run[field] !== undefined && !numeric(run[field])) {
      errors.push(`${field} must be a non-negative number when present`);
    }
  }
  if (run.firstPass !== undefined && typeof run.firstPass?.accepted !== "boolean") {
    errors.push("firstPass.accepted must be boolean when firstPass is present");
  }

  for (const field of ["taskPassed", "accepted"]) {
    if (typeof run.validation?.[field] !== "boolean") errors.push(`validation.${field} must be boolean`);
  }
  if (!numeric(run.validation?.residualViolations)) {
    errors.push("validation.residualViolations must be a non-negative number");
  }
  if (run.validation?.accepted === true && run.validation?.residualViolations > 0) {
    errors.push("validation.accepted cannot be true while residualViolations > 0");
  }

  if (run.treatment === "lint") {
    for (const field of LINT_FIELDS) {
      if (!numeric(run.lint?.[field])) errors.push(`lint.${field} must be a non-negative number for lint runs`);
    }
  }
  if (Number.isNaN(Date.parse(run.startedAt)) || Number.isNaN(Date.parse(run.endedAt))) {
    errors.push("timestamps must be ISO dates");
  }
  return errors;
}

export function parseJsonl(text) {
  return text.split(/\r?\n/).filter(Boolean).map((line, index) => {
    try { return JSON.parse(line); }
    catch { throw new Error(`invalid JSON on line ${index + 1}`); }
  });
}

export function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

export const billableTokens = (run) =>
  run.tokens.input + run.tokens.output + run.tokens.cacheRead + run.tokens.cacheCreation;

const keyFor = (run) => `${run.taskId}#${run.replicate}`;
const rate = (count, total) => (total ? count / total : null);

// Exact two-sided sign test. With 3-5 replicates per task nothing here is
// significant on its own, so the p-value exists to stop a 3-1 split being read
// as a result.
//
// Replicates of the same task share a prompt and a fixture, so pooling them
// treats correlated observations as independent and reports a p-value far
// smaller than the evidence supports. `taskLevel` below is the honest test:
// one observation per task, from the median of its replicates.
export function signTest(deltas) {
  const wins = deltas.filter((delta) => delta < 0).length;
  const losses = deltas.filter((delta) => delta > 0).length;
  const ties = deltas.length - wins - losses;
  const trials = wins + losses;
  if (!trials) return { wins, losses, ties, pValue: null };

  const choose = (n, k) => {
    let value = 1;
    for (let i = 0; i < k; i++) value = (value * (n - i)) / (i + 1);
    return value;
  };
  const extreme = Math.min(wins, losses);
  let tail = 0;
  for (let k = 0; k <= extreme; k++) tail += choose(trials, k);
  return { wins, losses, ties, pValue: Math.min(1, (2 * tail) / 2 ** trials) };
}

function mergeCounts(runs) {
  const merged = {};
  for (const run of runs) {
    for (const [ruleId, count] of Object.entries(run.validation.residualByRule ?? {})) {
      merged[ruleId] = (merged[ruleId] ?? 0) + count;
    }
  }
  return merged;
}

function summary(runs) {
  if (!runs.length) return null;
  const accepted = runs.filter((run) => run.validation.accepted);
  const totalCost = runs.reduce((sum, run) => sum + run.costUsd, 0);
  const lintRuns = runs.filter((run) => run.lint);

  return {
    runs: runs.length,
    accepted: accepted.length,
    acceptanceRate: rate(accepted.length, runs.length),
    taskPassRate: rate(runs.filter((run) => run.validation.taskPassed).length, runs.length),
    cleanLintRate: rate(runs.filter((run) => run.validation.residualViolations === 0).length, runs.length),
    medianDurationMs: median(runs.map((run) => run.durationMs)),
    medianTokens: median(runs.map(billableTokens)),
    medianCostUsd: median(runs.map((run) => run.costUsd)),
    medianToolCalls: median(runs.map((run) => run.toolCalls)),
    medianTurns: median(runs.map((run) => run.turns)),
    medianContextPeakTokens: median(runs.map((run) => run.contextPeakTokens ?? 0)),
    medianResidualViolations: median(runs.map((run) => run.validation.residualViolations)),
    // The number the rules exist to move: how often the first attempt was
    // already acceptable, and how many review rounds the rest needed.
    firstPassAcceptedRate: rate(runs.filter((run) => run.firstPass?.accepted).length, runs.length),
    medianCorrectionRounds: median(runs.map((run) => run.correctionRounds ?? 0)),
    totalCorrectionRounds: runs.reduce((total, run) => total + (run.correctionRounds ?? 0), 0),
    unresolvedRate: rate(runs.filter((run) => !run.validation.accepted).length, runs.length),
    // Every review round is a fresh `claude --resume` process, so it re-pays the
    // whole cached prefix as cache *writes*. A human carrying on in a live
    // session inside the cache TTL pays cache reads instead. This is the slice of
    // the correction-round cost that belongs to the harness, not to the
    // correction, and it only ever lands on arms that needed a round.
    totalResumeCacheCreationTokens: runs.reduce((total, run) => total + (run.resumeCacheCreationTokens ?? 0), 0),
    resumeCacheShareOfTokens: rate(
      runs.reduce((total, run) => total + (run.resumeCacheCreationTokens ?? 0), 0),
      runs.reduce((total, run) => total + billableTokens(run), 0),
    ),
    totalCostUsd: totalCost,
    costPerAcceptedUsd: accepted.length ? totalCost / accepted.length : null,
    residualByRule: mergeCounts(runs),
    lint: lintRuns.length ? {
      medianBlocks: median(lintRuns.map((run) => run.lint.blocks)),
      medianLintDurationMs: median(lintRuns.map((run) => run.lint.lintDurationMs)),
      medianBlockReasonTokens: median(lintRuns.map((run) => run.lint.blockReasonTokens)),
      blockRate: rate(lintRuns.filter((run) => run.lint.blocks > 0).length, lintRuns.length),
    } : null,
  };
}

const MEASURES = {
  durationMs: (run) => run.durationMs,
  tokens: billableTokens,
  costUsd: (run) => run.costUsd,
  toolCalls: (run) => run.toolCalls,
  turns: (run) => run.turns,
  contextPeakTokens: (run) => run.contextPeakTokens ?? 0,
  correctionRounds: (run) => run.correctionRounds ?? 0,
  residualViolations: (run) => run.validation.residualViolations,
};

// One arm measured against the baseline arm, over the task/replicate keys where
// both are present.
function pairedStats(pairs, treatment = "lint") {
  const usable = pairs.filter((pair) => pair[treatment] && pair[BASELINE_TREATMENT]);
  if (!usable.length) {
    return { treatment, count: 0, tasks: 0, acceptanceDelta: null, taskPassDelta: null, firstPassDelta: null, measures: {} };
  }

  const acceptScore = (run) => (run.validation.accepted ? 1 : 0);
  const passScore = (run) => (run.validation.taskPassed ? 1 : 0);
  const firstPassScore = (run) => (run.firstPass?.accepted ? 1 : 0);
  const delta = (score) =>
    usable.reduce((sum, pair) => sum + score(pair[treatment]) - score(pair[BASELINE_TREATMENT]), 0) / usable.length;

  const taskIds = [...new Set(usable.map((pair) => pair[treatment].taskId))];
  const measures = {};
  for (const [name, measure] of Object.entries(MEASURES)) {
    const deltaFor = (pair) => measure(pair[treatment]) - measure(pair[BASELINE_TREATMENT]);
    const deltas = usable.map(deltaFor);
    const medianDelta = median(deltas);
    const medianBaseline = median(usable.map((pair) => measure(pair[BASELINE_TREATMENT])));
    const perTask = taskIds.map((taskId) =>
      median(usable.filter((pair) => pair[treatment].taskId === taskId).map(deltaFor)),
    );
    measures[name] = {
      medianDelta,
      medianBaseline,
      relativeDelta: medianBaseline ? medianDelta / medianBaseline : null,
      ...signTest(deltas),
      taskLevel: signTest(perTask),
    };
  }

  return {
    treatment,
    count: usable.length,
    tasks: taskIds.length,
    acceptanceDelta: delta(acceptScore),
    taskPassDelta: delta(passScore),
    firstPassDelta: delta(firstPassScore),
    measures,
  };
}

// Acceptance is all-or-nothing: one `agent/no-comments` hit costs a run a whole
// review round. That makes it worth asking how much of the effect rests on a
// single rule - if dropping one rule would have let the baseline arm through
// first time anyway, that rule is carrying the result on its own.
//
// Measured on the *first* pass, because by the final round the rule has already
// been corrected away. Returns null rates for runs recorded before per-round
// rule breakdowns existed.
function sensitivity(runs) {
  const rules = [...new Set(runs.flatMap((run) => Object.keys(run.firstPass?.residualByRule ?? {})))].sort();
  const measurable = runs.filter((run) => run.firstPass?.residualByRule);
  if (!measurable.length) {
    return { rules, rows: [], measurable: 0 };
  }

  const acceptedWithout = (run, dropped) =>
    run.firstPass.taskPassed &&
    Object.entries(run.firstPass.residualByRule).every(([ruleId, count]) => ruleId === dropped || count === 0);

  const rateByTreatment = (dropped) =>
    Object.fromEntries(
      TREATMENTS.map((treatment) => {
        const armRuns = measurable.filter((run) => run.treatment === treatment);
        return [treatment, rate(armRuns.filter((run) => acceptedWithout(run, dropped)).length, armRuns.length)];
      }),
    );

  return {
    rules,
    measurable: measurable.length,
    rows: [
      { dropped: null, firstPassAcceptedRate: rateByTreatment(null) },
      ...rules.map((ruleId) => ({ dropped: ruleId, firstPassAcceptedRate: rateByTreatment(ruleId) })),
    ],
  };
}

export function compare(runs) {
  const invalid = runs.flatMap((run, index) => validateRun(run).map((error) => `record ${index + 1}: ${error}`));
  if (invalid.length) throw new Error(invalid.join("\n"));

  const models = [...new Set(runs.map((run) => run.model))];
  const byKey = new Map();
  for (const run of runs) {
    const entry = byKey.get(keyFor(run)) ?? {};
    if (entry[run.treatment]) throw new Error(`duplicate ${run.treatment} run for ${keyFor(run)}`);
    entry[run.treatment] = run;
    byKey.set(keyFor(run), entry);
  }
  // A key is usable as a pair when the baseline arm ran alongside at least one
  // other arm; each comparison then uses whichever keys carry its own arm.
  const armsPresent = TREATMENTS.filter((treatment) => runs.some((run) => run.treatment === treatment));
  const comparisonArms = armsPresent.filter((treatment) => treatment !== BASELINE_TREATMENT);
  const pairs = [...byKey.values()].filter(
    (entry) => entry[BASELINE_TREATMENT] && comparisonArms.some((treatment) => entry[treatment]),
  );
  const unpaired = [...byKey.entries()]
    .filter(([, entry]) => !entry[BASELINE_TREATMENT] || !comparisonArms.some((treatment) => entry[treatment]))
    .map(([key]) => key);

  const pairedByTreatment = Object.fromEntries(
    comparisonArms.map((treatment) => [treatment, pairedStats(pairs, treatment)]),
  );

  const taskIds = [...new Set(runs.map((run) => run.taskId))].sort();
  const byTask = Object.fromEntries(taskIds.map((taskId) => {
    const taskRuns = runs.filter((run) => run.taskId === taskId);
    const taskPairs = pairs.filter((pair) => pair[BASELINE_TREATMENT].taskId === taskId);
    return [taskId, {
      ...Object.fromEntries(armsPresent.map((treatment) => [
        treatment,
        summary(taskRuns.filter((run) => run.treatment === treatment)),
      ])),
      paired: pairedStats(taskPairs, "lint"),
      pairedByTreatment: Object.fromEntries(
        comparisonArms.map((treatment) => [treatment, pairedStats(taskPairs, treatment)]),
      ),
    }];
  }));

  return {
    generatedAt: new Date().toISOString(),
    totalRuns: runs.length,
    models,
    arms: armsPresent,
    baseline: BASELINE_TREATMENT,
    warnings: [
      ...(models.length > 1 ? [`runs span ${models.length} models: ${models.join(", ")}`] : []),
      ...(unpaired.length ? [`${unpaired.length} unpaired task/replicate key(s): ${unpaired.join(", ")}`] : []),
      ...(armsPresent.includes("prompt")
        ? []
        : ["no `prompt` arm: this run cannot say whether a CLAUDE.md would have done the hook's job"]),
    ],
    treatments: Object.fromEntries(
      TREATMENTS.map((treatment) => [treatment, summary(runs.filter((run) => run.treatment === treatment))]),
    ),
    paired: pairedByTreatment.lint ?? pairedStats([], "lint"),
    pairedByTreatment,
    sensitivity: sensitivity(runs),
    byTask,
  };
}

export function formatNumber(value, digits = 2) {
  return value === null || value === undefined || Number.isNaN(value)
    ? "—"
    : new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(value);
}
