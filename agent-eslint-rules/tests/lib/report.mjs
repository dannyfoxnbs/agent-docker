import { formatNumber } from "./evaluation.mjs";

const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
const percent = (value) => (value === null || value === undefined ? "—" : `${formatNumber(value * 100, 1)}%`);
const signed = (value, digits = 2) =>
  value === null || value === undefined || Number.isNaN(value)
    ? "—"
    : `${value > 0 ? "+" : ""}${formatNumber(value, digits)}`;
const money = (value) => (value === null || value === undefined ? "—" : `$${formatNumber(value, 4)}`);
const seconds = (value) => (value === null || value === undefined ? "—" : `${formatNumber(value / 1000)} s`);

const MEASURE_LABELS = {
  correctionRounds: ["Review rounds a human had to send", (value) => formatNumber(value, 2), 2],
  costUsd: ["Cost", (value) => money(value), 4],
  tokens: ["Billable tokens", (value) => formatNumber(value, 0), 0],
  contextPeakTokens: ["Peak context", (value) => formatNumber(value, 0), 0],
  durationMs: ["Wall time", (value) => seconds(value), 2],
  turns: ["Turns", (value) => formatNumber(value, 1), 1],
  toolCalls: ["Tool calls", (value) => formatNumber(value, 1), 1],
  residualViolations: ["Violations left in the diff", (value) => formatNumber(value, 1), 1],
};

function ruleCounts(byRule) {
  const entries = Object.entries(byRule ?? {}).sort((a, b) => b[1] - a[1]);
  if (!entries.length) return "none";
  return entries.map(([ruleId, count]) => `${escapeHtml(ruleId)} ×${count}`).join(", ");
}

const ARM_LABELS = {
  "no-lint": "No lint",
  prompt: "CLAUDE.md",
  lint: "Lint hook",
};

const METRIC_ROWS = [
  ["Runs", (s) => formatNumber(s.runs, 0), false],
  ["Acceptable first time, no review needed", (s) => percent(s.firstPassAcceptedRate), true],
  ["Median review rounds sent back", (s) => formatNumber(s.medianCorrectionRounds, 2), false],
  ["Review rounds sent back, total", (s) => formatNumber(s.totalCorrectionRounds, 0), false],
  ["Still unacceptable after the round budget", (s) => percent(s.unresolvedRate), false],
  ["Task behaviour passed (final)", (s) => percent(s.taskPassRate), false],
  ["Diff clean of agent-rule violations (final)", (s) => percent(s.cleanLintRate), false],
  ["Accepted (works and clean)", (s) => percent(s.acceptanceRate), true],
  ["Cost per accepted solution", (s) => money(s.costPerAcceptedUsd), true],
  ["Median cost", (s) => money(s.medianCostUsd), false],
  ["Median billable tokens", (s) => formatNumber(s.medianTokens, 0), false],
  ["… of which resume cache re-writes (harness artifact)", (s) => percent(s.resumeCacheShareOfTokens), false],
  ["Median peak context", (s) => formatNumber(s.medianContextPeakTokens, 0), false],
  ["Median wall time", (s) => seconds(s.medianDurationMs), false],
  ["Median turns", (s) => formatNumber(s.medianTurns, 1), false],
  ["Median tool calls", (s) => formatNumber(s.medianToolCalls, 1), false],
  ["Violations left in the diff (median)", (s) => formatNumber(s.medianResidualViolations, 1), false],
  ["Violations left, by rule", (s) => ruleCounts(s.residualByRule), false],
  ["Runs where the hook blocked", (s) => percent(s.lint?.blockRate), false],
  ["Median hook lint time per run", (s) => seconds(s.lint?.medianLintDurationMs), false],
  ["Median block-message tokens", (s) => formatNumber(s.lint?.medianBlockReasonTokens, 0), false],
];

function comparisonTable(report) {
  const arms = report.arms ?? ["no-lint", "lint"];
  const head = arms.map((arm) => `<th>${escapeHtml(ARM_LABELS[arm] ?? arm)}</th>`).join("");
  const body = METRIC_ROWS.map(([label, pick, strong]) => {
    const cells = arms
      .map((arm) => `<td>${report.treatments[arm] ? pick(report.treatments[arm]) : "—"}</td>`)
      .join("");
    return `<tr><td>${strong ? `<strong>${label}</strong>` : label}</td>${cells}</tr>`;
  }).join("");
  return `<table><thead><tr><th>Metric</th>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

function pairedTable(paired) {
  if (!paired.count) return "<p>No matched task/replicate pairs yet.</p>";
  const label = ARM_LABELS[paired.treatment] ?? paired.treatment;
  const rows = Object.entries(MEASURE_LABELS).map(([name, [rowLabel, format]]) => {
    const measure = paired.measures[name];
    if (!measure) return "";
    const direction = measure.medianDelta === 0 ? "" : measure.medianDelta < 0 ? "good" : "warn";
    const p = (test) => (test?.pValue === null || test?.pValue === undefined ? "—" : formatNumber(test.pValue, 3));
    return `<tr><td>${rowLabel}</td><td>${format(measure.medianBaseline)}</td><td class="${direction}">${signed(measure.medianDelta, 2)}</td><td>${measure.relativeDelta === null ? "—" : signed(measure.relativeDelta * 100, 1) + "%"}</td><td>${measure.wins}/${measure.losses}/${measure.ties}</td><td><strong>${p(measure.taskLevel)}</strong></td><td>${p(measure)}</td></tr>`;
  });
  return `<p><strong>${escapeHtml(label)}</strong> vs no lint · ${formatNumber(paired.count, 0)} pairs over ${formatNumber(paired.tasks, 0)} task(s). Negative deltas favour ${escapeHtml(label)}.</p>
<table><thead><tr><th>Measure</th><th>No-lint median</th><th>Median delta</th><th>Relative</th><th>Better/worse/tied</th><th>Sign-test p (by task)</th><th>p (pooled)</th></tr></thead><tbody>${rows.join("")}</tbody></table>`;
}

// The all-or-nothing acceptance rule means one rule can carry the whole result.
// If dropping a rule would have let the baseline arm through on its first pass
// anyway, then that rule is the finding, not the hook.
function sensitivityTable(sensitivity, arms) {
  if (!sensitivity?.rows?.length) {
    return "<p>No first-pass rule breakdown in this dataset — re-run to collect it.</p>";
  }
  const head = arms.map((arm) => `<th>${escapeHtml(ARM_LABELS[arm] ?? arm)}</th>`).join("");
  const body = sensitivity.rows
    .map((row) => {
      const cells = arms.map((arm) => `<td>${percent(row.firstPassAcceptedRate[arm])}</td>`).join("");
      const name = row.dropped === null
        ? "<strong>as measured, all rules enforced</strong>"
        : `without <code>${escapeHtml(row.dropped)}</code>`;
      return `<tr><td>${name}</td>${cells}</tr>`;
    })
    .join("");
  return `<p>First-pass acceptance if one rule were dropped, over ${formatNumber(sensitivity.measurable, 0)} run(s) that recorded a rule breakdown.</p>
<table><thead><tr><th>Rule set</th>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

function taskTable(byTask, arms) {
  const head = arms.map((arm) => `<th>${escapeHtml(ARM_LABELS[arm] ?? arm)}</th>`).join("");
  const rows = Object.entries(byTask).map(([taskId, entry]) => {
    const cells = arms
      .map((arm) => {
        const summaryObject = entry[arm];
        if (!summaryObject) return "<td>—</td>";
        return `<td>${percent(summaryObject.firstPassAcceptedRate)} first pass<br>${money(summaryObject.medianCostUsd)} · ${formatNumber(summaryObject.medianCorrectionRounds, 1)} round(s)</td>`;
      })
      .join("");
    return `<tr><td><code>${escapeHtml(taskId)}</code></td>${cells}</tr>`;
  });
  return `<table><thead><tr><th>Task</th>${head}</tr></thead><tbody>${rows.join("")}</tbody></table>`;
}

export function renderReport(report) {
  const arms = report.arms ?? ["no-lint", "lint"];
  const comparisonArms = arms.filter((arm) => arm !== (report.baseline ?? "no-lint"));
  const warnings = report.warnings?.length
    ? `<section class="card warn"><h2>Warnings</h2><ul>${report.warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join("")}</ul></section>`
    : "";

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Agent lint evaluation</title><style>
:root{color-scheme:light dark;font-family:ui-sans-serif,system-ui,sans-serif}body{max-width:1080px;margin:3rem auto;padding:0 1.25rem;line-height:1.5}table{border-collapse:collapse;width:100%;margin:1.25rem 0;font-variant-numeric:tabular-nums}th,td{text-align:left;padding:.6rem .7rem;border-bottom:1px solid #8886;vertical-align:top}th{background:#8882}.card{padding:1rem 1.25rem;border:1px solid #8886;border-radius:.6rem;margin:1.25rem 0}.good{color:#16803c}.warn{color:#b45309}code{background:#8882;padding:.1rem .3rem;border-radius:.2rem}p.meta{color:#8889}</style></head>
<body>
<h1>Agent lint evaluation</h1>
<p class="meta">Generated ${escapeHtml(report.generatedAt)} · ${formatNumber(report.totalRuns, 0)} runs · model ${escapeHtml((report.models ?? []).join(", ") || "unknown")}</p>
${warnings}
<p>A run is <strong>accepted</strong> only when the task behaviour check passes <em>and</em> the diff carries no agent-rule violations. Work that is not acceptable goes back to the agent as a reviewer's correction, in both arms, and every round is charged to the run. So the cost, time, turn and token figures below are <strong>totals to reach a solution a human would take</strong> — not the cost of one session.</p>
${comparisonTable(report)}
<section class="card"><h2>Paired comparison</h2>${comparisonArms.length
    ? comparisonArms.map((arm) => pairedTable(report.pairedByTreatment?.[arm] ?? report.paired)).join("")
    : "<p>No matched task/replicate pairs yet.</p>"}</section>
<section class="card"><h2>How much rests on a single rule</h2>${sensitivityTable(report.sensitivity, arms)}</section>
<section class="card"><h2>Per task</h2>${taskTable(report.byTask ?? {}, arms)}</section>
<section class="card"><h2>Reading this honestly</h2><ul>
<li><strong>The comparison that matters is <code>CLAUDE.md</code> vs <code>Lint hook</code></strong>, not either against no lint. Beating no enforcement at all was never in doubt; the question is whether deterministic enforcement beats simply telling the agent the rules once, up front, at near-zero marginal cost.</li>
<li>Cost and time are expected to go <em>up</em> for the lint arm when it blocks. The question is whether cost per accepted solution goes down once the review rounds the other arms need are charged too.</li>
<li>Review rounds are the metric that stands in for your attention, and it is the one the round budget cannot flatter: a round the harness spends is a round you would have spent reading the diff and writing the correction.</li>
<li><strong>Part of every correction round's cost is an artifact.</strong> Each round is a fresh <code>claude --resume</code> process, so it re-pays the whole cached prefix as cache <em>writes</em>; a human carrying on in a live session inside the cache TTL pays cache reads instead. The “resume cache re-writes” row above is that share, and it lands only on arms that needed a round — so it inflates their cost. Pointing the other way, and larger, your own attention is not priced at all.</li>
<li>Any residual violation in the lint arm is a rule the agent could not satisfy on its own — treat it as a false positive to investigate, not as noise.</li>
<li><strong>Use the by-task p-value, not the pooled one.</strong> Replicates of one task share a prompt and a fixture, so pooling them counts correlated runs as independent evidence. With four tasks the by-task test cannot go below 0.125 no matter how clean the split.</li>
<li>Every task here is built so the obvious solution violates the rules, which puts the measured benefit near its ceiling. Real branches contain plenty of edits with no numbers and no comment temptation, where the hook's benefit is zero and its cost is the “hook lint time” row plus no tokens at all. Read these figures as per <em>violation-prone</em> edit.</li>
<li>Task behaviour regressions in the lint arm are the failure mode that should veto a rule outright.</li>
</ul></section>
</body></html>`;
}
