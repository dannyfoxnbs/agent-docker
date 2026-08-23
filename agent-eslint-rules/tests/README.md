# Local evaluation suite

Two separate things live here:

1. **Regression tests** for the shipped runner and hook — fast, free, no network.
2. **A three-arm experiment** that runs Claude Code over the same task with the
   hook, with the rules stated up front in `CLAUDE.md`, and with neither, and
   measures what each way of enforcing the standard costs and what it buys.

Everything is self-contained: throwaway git repos under `tests/workspaces/`, no
dependency on nimbus or any other checkout.

## Layout

| Path | Role |
|---|---|
| `evaluation.test.mjs` | unit tests for the aggregation/report library |
| `lint-agent.test.mjs` | regression tests for `lint-agent.mjs` and the hook |
| `fixtures.test.mjs` | validity tests for the benchmark tasks themselves |
| `fixtures/<task>/workspace/` | the starting state the agent is given |
| `fixtures/<task>/prompt.md` | the task, as a user would phrase it |
| `fixtures/<task>/check.mjs` | behaviour check — does the code actually work |
| `fixtures/<task>/reference/` | a clean solution: proves the task is winnable within the rules |
| `fixtures/<task>/naive/` | the obvious solution: proves the task exerts the pressure it claims |
| `fixtures/_deps/` | shared `node_modules` (eslint + typescript-eslint) symlinked into every workspace |
| `tasks/manifest.json` | task catalogue and the rule pressure each one targets |
| `lib/` | workspace setup, session runner, grading, aggregation, report |
| `scripts/run-eval.mjs` | the experiment driver |
| `results/*.jsonl` | one telemetry record per session |
| `reports/index.html` | generated report (git-ignored) |

## Setup

```bash
npm install --prefix tests/fixtures/_deps
```

## Run the tests

From the repository root:

```bash
npm test
```

Equivalent to `node --test tests/*.test.mjs` (matches every fast test file, so
new ones are picked up without touching this command). About five seconds, no
API calls. These are the tests to run on every change to `lint-agent.mjs`,
`eslint.config.agent.mjs`, `rules/`, or the hook.

## Run the experiment

This is the paid, slow multi-arm evaluation — a separate command from `npm
test`, and never run by it.

```bash
npm run eval -- --tasks retry-backoff --replicates 1 --model sonnet
npm run eval -- --replicates 2
npm run eval -- --arms no-lint,prompt --replicates 3
npm run eval -- --correction lint --replicates 2
npm run eval -- --help
```

Or equivalently, from the repository root:

```bash
node tests/scripts/run-eval.mjs --tasks retry-backoff --replicates 1 --model sonnet
```

Every session is a real `claude -p` invocation and costs real usage — roughly
$0.10–$0.15 per session on Sonnet for the four small tasks and $0.25–$0.40 for
`settings-validate`. 5 tasks × 2 replicates × 3 arms is 30 first sessions plus
review rounds, which came to about $6. On an OAuth login that is subscription
usage against your rate limits rather than an API bill. Start with one task and
one replicate.

`--dry-run` sets up the workspaces and prints the plan without calling the model.

## Experimental design

For each task and replicate the driver creates **three fresh workspaces** and runs
three fresh sessions:

- `no-lint` — nothing. No `.claude/`, no `CLAUDE.md`. The agent is never told the
  house style and only hears about it when the work comes back for review.
- `prompt` — the house style in `CLAUDE.md`, committed in the baseline, no hook.
- `lint` — `.claude/settings.json` and `.claude/hooks/agent-lint-changed-file.mjs`,
  copied verbatim from `claude-hook/` and pointed at this folder's `lint-agent.mjs`
  via `AGENT_ESLINT_RUNNER`. No `CLAUDE.md`.

Exactly one artefact distinguishes each arm; `fixtures.test.mjs` asserts it. Same
prompt, same model, same baseline commit, same tools, same permission mode. Arm
order rotates by replicate so each arm takes each position equally often and
provider-side drift cannot land consistently on one of them.

### Why the `prompt` arm is the one that matters

`DESIGN.md` §1 justifies the hook by saying the same corrections should not have
to be re-prompted every session. But `CLAUDE.md` is loaded automatically every
session and sits in the cached prefix, so **repetition was never the problem** —
a two-arm experiment comparing a hook against no enforcement at all can only
show that some enforcement beats none, which was never in doubt.

The real claim for the hook is *deterministic verification* over *probabilistic
compliance*: `CLAUDE.md` is advice the model may drift from, while the hook
cannot be ignored. Whether that is worth its cost is an empirical question, and
`prompt` vs `lint` is the comparison that answers it. `no-lint` stays as the
shared baseline both are measured against.

Both the style guide and the `standard` correction are generated from
`HOUSE_STYLE_RULES` in `lib/corrections.mjs`, so every arm is told the same
thing and the only difference is **when** — up front, or after review.

Each workspace is a git repo whose baseline sits on a `dev` branch, so
`lint-agent.mjs` resolves its diff base exactly as it does in a real checkout.

### How a run is judged

Two independent verdicts, deliberately kept apart:

- **`taskPassed`** — `check.mjs` passes, so the code the agent wrote actually works.
- **`residualViolations`** — running the agent lint over the *final* diff, for
  **both** arms. This is what a human would otherwise have to send back.

A run is **accepted** only when both hold.

### The review loop — why the arms are comparable

A session that stops with a violation in the diff has not finished the work; it
has reached the point where you read it and send it back. Charging nobody for
that turn is what makes a no-lint run look cheap, and it is the single biggest
way to get this experiment wrong.

So after the first session, **every arm enters the same loop**: while the work is
not acceptable and rounds remain, the session is resumed (`claude --resume`, warm
context, exactly as a human would carry on) with a reviewer's correction. Every
round's cost, time, turns and tokens are added to the run's totals.

Two correction styles bracket what a real re-prompt costs:

- `standard` (default) — a fixed, identical message stating the house style from
  memory: no comments, no bare numeric literals, at most 3 parameters. This is
  the correction `DESIGN.md` §1 says should not have to be repeated every session.
  It never contains file names, line numbers or rule ids.
- `lint` — the reviewer pastes the exact violations. The cheapest possible
  re-prompt, so it is a *lower bound* on the cost of a human round.

`--max-corrections 0` disables the loop and reproduces the older, biased
comparison, which is occasionally useful for isolating first-pass behaviour.

The headline metrics are therefore **cost per accepted solution** and **review
rounds sent back**. The lint arm is expected to spend more inside its first
session; the question is whether that is cheaper than the rounds the other arm
needs afterwards.

Review rounds are also the closest available proxy for **your attention**, which
is the cost the token figures cannot show: a round the harness spends is a round
you would have spent reading a diff and writing a correction.

Interpretation rules that matter:

- A residual violation in the **lint** arm is a rule the agent could not satisfy
  on its own — a false positive to investigate, per `DESIGN.md` §5.
- A `taskPassed` regression in the lint arm should veto a rule outright: it means
  the rule pushed the agent into breaking working code.
- **Use the by-task sign test, not the pooled one.** Replicates of one task share
  a prompt and a fixture, so pooling them counts correlated runs as independent
  evidence. The report prints both; the by-task column is the honest one, and with
  five tasks it cannot go below 0.0625 however clean the split.

### Three things the numbers are not

- **Part of every correction round's cost is a harness artifact.** Each round is a
  fresh `claude --resume` process, so it re-pays the whole cached prefix as cache
  *writes* — measured at ~11k tokens, the largest single line item in a round. A
  human carrying on in a live session inside the cache TTL pays cache reads
  instead. The report's `resumeCacheShareOfTokens` row is that share, and it only
  ever lands on arms that needed a round, so it inflates their cost. Pointing the
  other way, and larger: your own attention is not priced at all, which is what
  `correctionRounds` stands in for.
- **Acceptance is all-or-nothing, so one rule can carry the whole result.** The
  report's sensitivity table recomputes first-pass acceptance with each rule
  dropped in turn. If dropping `agent/no-comments` alone would have let `no-lint`
  through first time, that rule is the finding and the rest are along for the ride.
- **Every task is built so the obvious solution violates something**, which puts
  the measured benefit near its ceiling — `fixtures.test.mjs` *requires* each
  `naive/` solution to trip every rule its manifest entry claims. Real branches
  contain plenty of edits with no numbers and no comment temptation, where the
  benefit is zero and the hook's cost is ~0.5 s per edit and, per `DESIGN.md` §8,
  no tokens at all. Read every figure here as *per violation-prone edit*, and
  weight by how often your own edits look like these tasks.

### What the tasks are for

Prompts never mention comments, magic numbers, lint or style — `fixtures.test.mjs`
asserts that. The pressure has to come from the task, otherwise the experiment
measures instruction-following instead of the rules.

Each task is guarded by three tests: the check must **fail** on the untouched
fixture, the `reference/` solution must **pass both** the check and the agent
rules, and the `naive/` solution must **pass the check while tripping every rule**
the manifest claims. Without those, a broken or vacuous task would quietly make
both arms look identical.

`settings-validate` is the one that covers `max-lines-per-function`: sixteen
ordered field checks, whose obvious shape is one sequential function that clears
100 lines. It is also the only task where satisfying a rule means **restructuring**
rather than substituting a constant, which is where a rule is most likely to break
working code — so it is the task most able to trip the `taskPassed` veto. It is
correspondingly slower and dearer per session than the other four.

## Telemetry contract

One JSONL line per session. `scripts/validate-results.mjs` enforces it.

```json
{
  "runId": "retry-backoff--lint--r1",
  "taskId": "retry-backoff",
  "replicate": 1,
  "treatment": "lint",
  "model": "sonnet",
  "startedAt": "2026-07-30T10:05:00.000Z",
  "endedAt": "2026-07-30T10:08:10.000Z",
  "durationMs": 190000,
  "turns": 13,
  "tokens": { "input": 610, "output": 3900, "cacheRead": 252000, "cacheCreation": 26000 },
  "costUsd": 0.27,
  "toolCalls": 10,
  "editToolCalls": 4,
  "contextPeakTokens": 47000,
  "correctionRounds": 0,
  "correctionStyle": "standard",
  "firstPass": { "accepted": true, "taskPassed": true, "residualViolations": 0, "costUsd": 0.27, "durationMs": 190000, "turns": 13 },
  "lint": { "blocks": 2, "violations": 6, "lintDurationMs": 2600, "blockReasonTokens": 92 },
  "validation": {
    "taskPassed": true,
    "accepted": true,
    "residualViolations": 0,
    "residualByRule": {}
  }
}
```

`treatment` is one of `no-lint`, `prompt`, `lint`.
`durationMs`, `turns`, `toolCalls`, `costUsd` and all token counts are **totals
across every round**, including corrections; `firstPass` keeps the first
session's figures — including its `residualByRule`, which is what the sensitivity
table needs — so the two can be separated.
`resumeCacheCreationTokens` is the cache-write traffic paid by correction rounds
only, i.e. the harness artifact described above. `rounds` (omitted above) holds the
full per-round breakdown. `costUsd`, `turns` and all token counts come from the
provider's own result event, not from estimates. `contextPeakTokens` is the largest per-message
input + cache-read + cache-creation total seen in the session. `lint` is required
on the lint arm and comes from the hook's own telemetry, written only when
`LINT_AGENT_TELEMETRY` is set. `blockReasonTokens` is characters/4 — an
approximation only ever compared against itself.

Every run also drops `.eval/verdict.json` in its workspace with the full check
output and every residual violation, so a surprising number can be traced back to
the actual code.

## Two env vars the harness relies on

Both are opt-in and inert in normal use:

- `LINT_AGENT_FORMAT=json` — `lint-agent.mjs` emits machine-readable violations
  instead of stylish output. Used for grading.
- `LINT_AGENT_TELEMETRY=<file>` — the hook appends one JSON line per invocation
  (`blocked`, `violations`, `lintDurationMs`, `reasonChars`).

## Confounds this design does not remove

- **Your user-level Claude Code settings still apply** to both arms — global
  hooks, plugins, skills, `~/.claude/CLAUDE.md`. Identical across arms, so it does
  not bias the comparison, but it does mean absolute costs here are not portable
  to another machine.
- **Provider-side caching and load** move wall time and cache-token counts run to
  run. Use medians across replicates and the sign test, never a single pair.
- **The checks pin an API.** A run can fail `taskPassed` for a naming choice
  rather than a real defect. `csv-import` deliberately accepts several call shapes
  to avoid this; if a task starts failing for shape reasons, widen its check.
