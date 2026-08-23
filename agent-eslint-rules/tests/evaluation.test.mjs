import test from "node:test";
import assert from "node:assert/strict";
import { billableTokens, compare, median, parseJsonl, signTest, validateRun } from "./lib/evaluation.mjs";
import { renderReport } from "./lib/report.mjs";

const control = {
  runId: "control", taskId: "task", replicate: 1, treatment: "no-lint", model: "sonnet",
  startedAt: "2026-01-01T00:00:00.000Z", endedAt: "2026-01-01T00:01:00.000Z",
  durationMs: 60000, turns: 8, toolCalls: 6, costUsd: 0.2, contextPeakTokens: 40000,
  tokens: { input: 400, output: 2500, cacheRead: 150000, cacheCreation: 20000 },
  correctionRounds: 2,
  firstPass: { accepted: false, taskPassed: true, residualViolations: 4, residualByRule: { "agent/no-comments": 4 }, costUsd: 0.1, durationMs: 30000, turns: 4 },
  validation: { taskPassed: true, accepted: false, residualViolations: 4, residualByRule: { "agent/no-comments": 4 } },
};

const treated = {
  ...control,
  runId: "treated", treatment: "lint",
  durationMs: 90000, turns: 12, toolCalls: 9, costUsd: 0.3, contextPeakTokens: 46000,
  tokens: { input: 600, output: 3500, cacheRead: 220000, cacheCreation: 21000 },
  lint: { blocks: 2, violations: 4, lintDurationMs: 1400, blockReasonTokens: 80 },
  correctionRounds: 0,
  firstPass: { accepted: true, taskPassed: true, residualViolations: 0, residualByRule: {}, costUsd: 0.3, durationMs: 90000, turns: 12 },
  validation: { taskPassed: true, accepted: true, residualViolations: 0, residualByRule: {} },
};

test("required lint telemetry is enforced only on the lint arm", () => {
  assert.deepEqual(validateRun(control), []);
  assert.match(validateRun({ ...treated, lint: undefined }).join("\n"), /lint\.blocks/);
  assert.deepEqual(validateRun(treated), []);
});

test("acceptance cannot be claimed while the diff still violates the rules", () => {
  const errors = validateRun({
    ...control,
    validation: { taskPassed: true, accepted: true, residualViolations: 2 },
  });
  assert.match(errors.join("\n"), /accepted cannot be true/);
});

test("token accounting includes cache traffic", () => {
  assert.equal(billableTokens(control), 400 + 2500 + 150000 + 20000);
});

// The previous implementation reduced over an array of pair objects, so this
// value came out NaN and rendered as "+NaN percentage points".
test("acceptance delta is a real number in every direction", () => {
  assert.equal(compare([control, treated]).paired.acceptanceDelta, 1);

  const flipped = compare([
    { ...control, validation: { ...control.validation, accepted: true, residualViolations: 0 } },
    { ...treated, validation: { ...treated.validation, accepted: false, residualViolations: 1 } },
  ]);
  assert.equal(flipped.paired.acceptanceDelta, -1);

  const neutral = compare([
    { ...control, validation: { ...control.validation, accepted: true, residualViolations: 0 } },
    treated,
  ]);
  assert.equal(neutral.paired.acceptanceDelta, 0);
});

test("paired measures carry direction, magnitude and a sign test", () => {
  const report = compare([control, treated]);
  assert.equal(report.paired.count, 1);
  assert.ok(Math.abs(report.paired.measures.costUsd.medianDelta - 0.1) < 1e-9);
  assert.equal(report.paired.measures.durationMs.medianDelta, 30000);
  assert.equal(report.paired.measures.residualViolations.medianDelta, -4);
  assert.equal(report.paired.measures.tokens.medianDelta, billableTokens(treated) - billableTokens(control));
  assert.ok(Math.abs(report.paired.measures.costUsd.relativeDelta - 0.5) < 1e-9);
  assert.equal(report.paired.measures.costUsd.losses, 1);
  assert.equal(report.paired.measures.residualViolations.wins, 1);
});

test("cost per accepted solution is the headline the raw medians hide", () => {
  const report = compare([control, treated]);
  assert.equal(report.treatments["no-lint"].costPerAcceptedUsd, null, "nothing accepted, so no per-solution cost");
  assert.equal(report.treatments.lint.costPerAcceptedUsd, 0.3);
  assert.equal(report.treatments["no-lint"].cleanLintRate, 0);
  assert.equal(report.treatments.lint.cleanLintRate, 1);
});

test("unpaired and mixed-model runs are flagged rather than silently averaged", () => {
  const report = compare([control, { ...treated, replicate: 2, model: "opus" }]);
  assert.equal(report.paired.count, 0);
  assert.match(report.warnings.join("\n"), /models/);
  assert.match(report.warnings.join("\n"), /unpaired/);
});

// A two-arm run can only ever show that the hook beats nothing. That is not the
// question, so the absence of the prompt arm has to be stated on the report
// rather than left for the reader to notice.
test("a run without the prompt arm says so", () => {
  assert.match(compare([control, treated]).warnings.join("\n"), /no `prompt` arm/);
  assert.equal(
    compare([control, treated, { ...treated, runId: "p", treatment: "prompt", lint: undefined }]).warnings.length,
    0,
  );
});

test("a duplicated arm for one task and replicate is rejected", () => {
  assert.throws(() => compare([control, { ...control, runId: "again" }]), /duplicate no-lint run/);
});

test("per-task breakdown keeps tasks separable", () => {
  const other = { ...control, runId: "c2", taskId: "other" };
  const otherLint = { ...treated, runId: "t2", taskId: "other" };
  const report = compare([control, treated, other, otherLint]);
  assert.deepEqual(Object.keys(report.byTask), ["other", "task"]);
  assert.equal(report.byTask.task.paired.count, 1);
  assert.equal(report.byTask.other.lint.runs, 1);
});

test("sign test reports wins, losses, ties and an exact p-value", () => {
  assert.deepEqual(signTest([-1, -1, -1, -1, -1, -1]), { wins: 6, losses: 0, ties: 0, pValue: 2 / 64 });
  assert.deepEqual(signTest([0, 0]), { wins: 0, losses: 0, ties: 2, pValue: null });
  assert.equal(signTest([-1, 1]).pValue, 1);
});

test("median handles empty and even-length inputs", () => {
  assert.equal(median([]), null);
  assert.equal(median([4, 1, 3, 2]), 2.5);
});

test("rejects malformed JSONL", () => assert.throws(() => parseJsonl("not json\n"), /line 1/));

test("the report renders every section without NaN or undefined", () => {
  const html = renderReport(compare([control, treated]));
  assert.match(html, /Agent lint evaluation/);
  assert.match(html, /Cost per accepted solution/);
  assert.match(html, /Violations left in the diff/);
  assert.ok(!html.includes("NaN"), "no NaN in rendered output");
  assert.ok(!html.includes("undefined"), "no undefined in rendered output");
});

test("the report survives a one-armed dataset", () => {
  const html = renderReport(compare([control]));
  assert.match(html, /No matched task\/replicate pairs yet/);
  assert.ok(!html.includes("NaN"));
});

test("review rounds are a first-class measure, not a footnote", () => {
  const report = compare([control, treated]);
  assert.equal(report.treatments["no-lint"].medianCorrectionRounds, 2);
  assert.equal(report.treatments.lint.medianCorrectionRounds, 0);
  assert.equal(report.treatments["no-lint"].firstPassAcceptedRate, 0);
  assert.equal(report.treatments.lint.firstPassAcceptedRate, 1);
  assert.equal(report.treatments["no-lint"].unresolvedRate, 1, "still dirty after its round budget");
  assert.equal(report.paired.measures.correctionRounds.medianDelta, -2);
  assert.equal(report.paired.firstPassDelta, 1);
});

// The prompt arm is the one the whole experiment turns on, so it has to be a
// first-class comparison against the same baseline, not a footnote.
test("every arm is compared against the baseline arm", () => {
  const prompted = {
    ...control,
    runId: "prompted", treatment: "prompt", costUsd: 0.22, correctionRounds: 0,
    firstPass: { ...control.firstPass, accepted: true, residualViolations: 0, residualByRule: {} },
    validation: { taskPassed: true, accepted: true, residualViolations: 0, residualByRule: {} },
  };
  const report = compare([control, prompted, treated]);

  assert.deepEqual(report.arms, ["no-lint", "prompt", "lint"]);
  assert.deepEqual(Object.keys(report.pairedByTreatment), ["prompt", "lint"]);
  assert.equal(report.pairedByTreatment.prompt.count, 1);
  assert.equal(report.pairedByTreatment.lint.count, 1);
  assert.ok(Math.abs(report.pairedByTreatment.prompt.measures.costUsd.medianDelta - 0.02) < 1e-9);
  assert.equal(report.pairedByTreatment.prompt.measures.correctionRounds.medianDelta, -2);
  assert.equal(report.paired.treatment, "lint", "`paired` stays the lint-vs-baseline view");
});

// Pooling replicates of one task treats correlated runs as independent. Six
// same-signed replicates of two tasks is two observations, not six.
test("the sign test is also reported at task level", () => {
  const runs = [];
  for (const taskId of ["a", "b"]) {
    for (let replicate = 1; replicate <= 3; replicate++) {
      runs.push({ ...control, runId: `c-${taskId}-${replicate}`, taskId, replicate });
      runs.push({ ...treated, runId: `t-${taskId}-${replicate}`, taskId, replicate });
    }
  }
  const rounds = compare(runs).paired.measures.correctionRounds;
  assert.equal(rounds.wins, 6, "pooled: one observation per replicate");
  assert.equal(rounds.pValue, 2 / 64);
  assert.equal(rounds.taskLevel.wins, 2, "task level: one observation per task");
  assert.equal(rounds.taskLevel.pValue, 0.5, "and a p-value that cannot go below 0.5 with two tasks");
});

test("sensitivity shows how much of the effect rests on one rule", () => {
  const report = compare([control, treated]);
  const rows = report.sensitivity.rows;
  const rateFor = (dropped) => rows.find((row) => row.dropped === dropped).firstPassAcceptedRate;

  assert.deepEqual(report.sensitivity.rules, ["agent/no-comments"]);
  assert.equal(rateFor(null)["no-lint"], 0, "as measured, the baseline arm fails first time");
  assert.equal(
    rateFor("agent/no-comments")["no-lint"],
    1,
    "drop the only rule it broke and it would have passed first time - the whole effect is that rule",
  );
  assert.equal(rateFor("agent/no-comments").lint, 1);
});

test("the resume cache-write artifact is attributed to the arm that paid it", () => {
  const report = compare([
    { ...control, resumeCacheCreationTokens: 11000 },
    { ...treated, resumeCacheCreationTokens: 0 },
  ]);
  assert.equal(report.treatments["no-lint"].totalResumeCacheCreationTokens, 11000);
  assert.equal(report.treatments.lint.totalResumeCacheCreationTokens, 0);
  assert.ok(report.treatments["no-lint"].resumeCacheShareOfTokens > 0.06);
});

test("firstPass must be well formed when present", () => {
  assert.match(validateRun({ ...control, firstPass: {} }).join("\n"), /firstPass.accepted/);
  assert.match(validateRun({ ...control, correctionRounds: -1 }).join("\n"), /correctionRounds/);
});
