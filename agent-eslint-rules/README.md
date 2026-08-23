# agent-eslint-rules

A standalone set of stricter ESLint rules for code written through coding agents.
A small harness adapter checks a source file immediately after an editing tool
writes it and sends actionable violations back to the agent before it continues.

The rules repository stays outside every project it checks. Each developer owns
their clone and can change its rules and thresholds without changing a target
project's dependencies or normal lint configuration.

- **Claude Code:** clone this repository, then paste
  [`INSTALL_PROMPT.md`](./INSTALL_PROMPT.md) into a session in the clone.
- **Pi:** after cloning, run `pi install /absolute/path/to/agent-eslint-rules`,
  then run `/reload` or restart Pi. The repository is a Pi package and loads its
  extension globally.
- **Design and invariants:** [`DESIGN.md`](./DESIGN.md)

## What is checked

The runner's **diff scope** is the target project's working tree compared with
`HEAD`: staged and unstaged lines, plus every line of an untracked file. A
committed change has left scope.

This is not session tracking. The runner cannot distinguish an edit from the
current agent session from earlier uncommitted work or a human's uncommitted work
in the same file. The harness adapter points it at the file just edited, and it
checks whatever in that file differs from its committed state.

Only `.ts`, `.tsx`, `.js`, and `.jsx` files are checked.

Rules are attributed in two ways:

- **Localized rules** report the offending token and are retained only when their
  reported line changed: `agent/no-comments`, `no-magic-numbers`, and
  `@typescript-eslint/no-magic-numbers`.
- **Structural rules** report an enclosing declaration, so a body or signature
  edit may create a finding on an unchanged line. The runner compares findings
  with the file at `HEAD` and retains only new violations:
  `max-lines-per-function`, `max-params`, and
  `@typescript-eslint/max-params`.

This classification is an explicit list in `lint-agent.mjs`, not a heuristic.
An unlisted rule is localized unless a maintainer deliberately adds it to the
structural list.

## Rules

Every enabled rule is an error. `noInlineConfig` is enabled, so inline
`eslint-disable` comments cannot silence this configuration.

| Rule | Files | Setting |
| --- | --- | --- |
| `agent/no-comments` | TS, TSX, JS, JSX | No comments |
| `max-lines-per-function` | TS, TSX, JS, JSX | 100 lines; blank lines skipped |
| `@typescript-eslint/max-params` | TS, TSX | 3 parameters |
| `max-params` | JS, JSX | 3 parameters |
| `@typescript-eslint/no-magic-numbers` | TS, TSX | Allows `-1`, `0`, `1` and the exceptions in the config |
| `no-magic-numbers` | JS, JSX | Allows `-1`, `0`, `1`, defaults, and array indexes |

Thresholds are constants in `eslint.config.agent.mjs`. Edit your own clone to
change them.

The configuration is deliberately standalone and type-free. It does not inherit
the target project's ESLint configuration or build a TypeScript program. The
target project's ordinary lint and CI still apply independently. Do not add a
rule requiring type information; that changes per-edit linting from well under a
second to tens of seconds in the measured project. See [`DESIGN.md`](./DESIGN.md).

## Outcomes

The runner and harness adapters preserve three distinct outcomes:

- **Clean:** exit 0 and no adapter output.
- **Violations:** runner exit 1; the adapter returns diagnostics to the agent.
- **Tooling failure:** runner exit 2; the adapter emits one labelled warning and
  fails open. A missing dependency or broken install is never presented as a
  code violation.

The target project supplies `eslint` and `typescript-eslint` from its own
`node_modules`. The rules repository intentionally has no production dependency
on either package.

## Commands

Run the complete fast test suite from this repository:

```bash
npm test
```

Show installer usage:

```bash
node scripts/install.mjs --help
```

Run the runner manually from a target project's root, using the path to your
clone:

```bash
node /path/to/agent-eslint-rules/lint-agent.mjs
```

Optional environment variables:

- `LINT_AGENT_ONLY_FILES`: newline-separated file allowlist, still intersected
  with diff scope. The hook supplies the edited file here.
- `LINT_AGENT_ALLOW_COMMENTS=1`: disables only `agent/no-comments` for one run.
- `LINT_AGENT_FORMAT=json`: emits a machine-readable report.
- `AGENT_ESLINT_RUNNER`: explicit runner path used by the installed hook shim.

There is no base-branch setting because branch names and remotes are irrelevant
to working-tree scope.

## Repository layout

- `rules/` and `index.mjs`: local ESLint plugin.
- `eslint.config.agent.mjs`: declares which ESLint rules and parser settings apply.
- `lint-agent.mjs`: finds changed lines, runs ESLint with that config, and filters
  diagnostics to new violations. Both are needed because configuration and
  execution are separate ESLint responsibilities.
- `claude-hook/`: Claude Code hook implementation and thin installed shim.
- `extensions/pi-agent-lint.mjs`: Pi `tool_result` adapter.
- `scripts/install.mjs`: Claude Code install, check, and uninstall implementation.
- `tests/`: behavioural and contract tests.

## Known gaps

- Edits made outside a harness's `edit` and `write` tools are not checked. Shell
  redirection, `sed`, patch application, code generation, formatters, and custom
  mutation tools do not trigger the adapters.
- The adapters are not target-project CI and do not enforce these rules on human
  commits.
- Because committed work leaves diff scope, a manual run after committing does
  not revisit it. The per-edit hook checks it while it is still uncommitted.
