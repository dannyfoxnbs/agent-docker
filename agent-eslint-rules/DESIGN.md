# Agent-only ESLint design

This document records why the tool has its present shape and the conditions a
change must preserve.

## Goal

Give an agent immediate, fixable feedback about a small set of stricter rules
without changing the target project's normal lint configuration. A correction
made immediately by the agent avoids a later human review-and-reprompt cycle.

The design optimizes for:

- no target-project dependency or tracked configuration;
- sub-second feedback in the normal case;
- no pre-existing violation blocking current work;
- visible but non-blocking infrastructure failures;
- small harness-specific adapters around one runner.

## Architecture

```text
Claude Code PostToolUse ─> claude-hook/hook-main.mjs ─┐
Pi tool_result ─────────> extensions/pi-agent-lint.mjs ├─> lint-agent.mjs
manual invocation ────────────────────────────────────┘
  -> target node_modules/eslint
  -> eslint.config.agent.mjs
  -> target working tree compared with HEAD
```

Harness adapters identify the edited file and translate the runner's three exit
codes into native feedback. Diff scope, ESLint execution, and attribution remain
harness-neutral in `lint-agent.mjs`.

Claude Code receives git-ignored files below `.claude/`: the shim, merged hook
settings, and either a symlink to the rules clone or an absolute-path fallback.
Pi loads the clone directly as a package and writes nothing into target projects.

The runner resolves `eslint` and `typescript-eslint` from the target project's
current working directory. This repository is not vendored into the project and
is not added to its package manifest.

## Working-tree diff scope

Diff scope is the working tree compared with `HEAD`:

- `git diff HEAD` supplies staged and unstaged changed lines;
- `git ls-files --others --exclude-standard` supplies untracked files, which are
  wholly changed;
- before a repository's first commit, every tracked and untracked file is wholly
  changed.

Branch names, remotes, merge bases, and network access play no part. There is one
scope model for adapter and manual runs and no scope configuration.

This deliberately accepts a trade: after work is committed it leaves scope, so a
manual run checks less than a branch-wide comparison would. The cost is cheap in
practice because the adapters run immediately after each editing-tool write,
while the edit is uncommitted. A manual review of work committed mid-session is the
case that loses coverage.

The model is not session-aware. It cannot separate the current session's edit
from older or human-authored uncommitted work in the same file. It checks the
working-tree differences in the file named by the harness adapter.

The full decision and alternatives are in
[`docs/adr/0001-working-tree-diff-scope.md`](./docs/adr/0001-working-tree-diff-scope.md).

## Diagnostic attribution

Changed-line filtering is correct only when a rule reports where the offending
edit occurred. `lint-agent.mjs` therefore contains an explicit classification:

**Localized** (the default):

- `agent/no-comments`
- `no-magic-numbers`
- `@typescript-eslint/no-magic-numbers`

A localized diagnostic survives only when its reported line is changed.

**Structural**:

- `max-lines-per-function`
- `max-params`
- `@typescript-eslint/max-params`

A structural diagnostic is only a candidate until the runner lazily lints the
file's content at `HEAD`. A counted pool of normalized rule-and-message keys
matches pre-existing findings; only unmatched, new findings survive. Counts are
necessary because two anonymous functions can produce identical messages.

`max-lines-per-function` is gated by intersection between changed lines and its
reported range, which covers the function. ESLint's max-params rules report on a
function head or arrow token whose range can exclude the parameter list. Those
two rules therefore use “the file has a changed line” as their safe early gate;
the committed-version comparison still determines correctness. This can cost one
extra `git show` for a touched file with a legacy max-params finding, but cannot
miss a new finding.

Untracked files and repositories without `HEAD` have no committed version, so all
of their diagnostics are new. Retrieval remains lazy: a file without a structural
candidate incurs no `git show` and no second lint.

The classification must remain explicit. Adding a rule cannot silently acquire
structural semantics; maintainers must decide and test its attribution.

## Standalone, type-free configuration

The agent config does not extend the target project's config. The original
project-specific setup built a TypeScript program and measured about 21.3 seconds
per file. The standalone syntactic configuration measured about 0.6 seconds on
the same file. Per-edit linting is practical only at the latter cost.

All enabled rules must remain type-free:

- no `parserOptions.project`;
- no rule whose metadata requires type checking;
- type-aware concerns belong in the target project's ordinary lint and CI.

`@typescript-eslint/no-unnecessary-condition` is intentionally absent. Besides
requiring type information, it can misclassify valid null guards in projects
without `strictNullChecks`. Every hook rule must have a correction the agent can
make without changing valid behaviour.

`noInlineConfig: true` is also an invariant: an agent must not bypass an
agent-only rule with an inline directive. Contract tests enforce both conditions
and require every enabled rule to remain an error.

## Per-edit adapters

Claude Code's `PostToolUse` and Pi's `tool_result` both supply the edited path, so
neither adapter needs session markers, mtime snapshots, a daemon, or stop-time
reconstruction. Claude blocks with diagnostics; Pi marks the successful edit's
tool result as an error and appends the same diagnostics, prompting its agent to
fix the file.

Each adapter narrows lint results to the edited file with
`LINT_AGENT_ONLY_FILES`. The runner currently computes the complete working-tree
change map before applying that allowlist. Measurement in a large repository
showed that narrowing the git commands would save roughly 9 ms in a roughly
510 ms invocation, so the extra code path was not added. See
[`docs/measurements/git-narrowing.md`](./docs/measurements/git-narrowing.md).

## Failure policy

There are three outcomes, and only one blocks:

| Outcome | Runner | Harness adapter |
| --- | --- | --- |
| Clean | exit 0 | silent |
| Violations | exit 1 | return diagnostics to the agent |
| Tooling failure | exit 2 | one labelled warning; fail open |

A spawn error, signal, null status, unexpected status, dependency import failure,
or git failure is tooling failure, never a rule violation. Fail-open prevents a
partial installation from obstructing work; the warning prevents it from becoming
invisible. A clean adapter is silent so it adds no model context.

The Claude adapter still parses formatted lint output to count telemetry violations. A
structured imported runner API would remove the subprocess and parser, but is a
deferred follow-up rather than part of this design change.

## Installation

For Claude Code, [`INSTALL_PROMPT.md`](./INSTALL_PROMPT.md) resolves the target
project and delegates all writes to `scripts/install.mjs`.

The Claude installer:

- refuses non-git targets, malformed settings, and tracked destination files
  before writing;
- merges settings without losing unrelated keys or duplicating its hook;
- creates a visible symlink to the clone, with an absolute-path-file fallback;
- ignores installed paths through the clone-local `.git/info/exclude`;
- is idempotent and supports `--check` and `--uninstall`;
- verifies installation by creating a temporary violating source file and
  requiring the installed hook to block it.

It never edits a tracked target-project file.

For Pi, this repository is itself a package. `pi install
/absolute/path/to/agent-eslint-rules` records the clone globally and discovers
`extensions/pi-agent-lint.mjs` through the package manifest. Restarting Pi loads
the adapter for every project.

## Verification

The trusted fast check is:

```bash
npm test
```

It covers diff scope, structural attribution, failure handling, installation,
harness integration, rule behaviour, configuration invariants, and the existing
evaluation harness's unit tests. The paid multi-session evaluation remains a
separate `npm run eval` command and is never part of `npm test`.

## Known gaps

1. Changes made outside harness editing tools are not checked. Shell edits,
   patch application, code generation, formatters, and custom mutation tools do
   not trigger the adapters.
2. This is not target-project CI. It does not enforce rules on human commits.
3. A committed edit is outside diff scope even when committed during the same
   session.
4. The tool does not identify authorship or sessions; it sees uncommitted lines.
5. Native Windows behaviour is not tested beyond platform-safe relative path
   handling and the symlink fallback.
