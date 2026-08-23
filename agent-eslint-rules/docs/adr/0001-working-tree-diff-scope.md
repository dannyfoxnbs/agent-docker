# ADR 0001 — Diff scope is the working tree, not a branch comparison

**Status:** accepted
**Date:** 2026-08-20

## Context

The runner has to decide which lines are eligible to be reported. Reporting every
violation in a file would bury the agent in pre-existing findings it did not cause,
so some scoping rule is required.

The original answer was a branch comparison: resolve a base of `origin/dev`, then
`dev`, then fall back to `HEAD`, take the merge base with the current branch, and
treat everything since as in scope. An environment variable could override the base.

That model carried assumptions the tool has no business making:

- that the target project's trunk is named `dev` — projects using `main`, `master`
  or `develop` silently fell through to the `HEAD` fallback;
- that a remote exists and is fetched, so `origin/dev` is meaningful and current;
- that the person is on a feature branch rather than working on trunk directly.

None of these hold generally, and when they failed the tool did not fail loudly —
it quietly changed what it checked. The degradation was narrow rather than total
(the `HEAD` fallback still sees uncommitted work, and the hook fires while the edit
is uncommitted), but a colleague on a differently-named trunk had to read the source
to find out why behaviour differed from the documentation.

## Decision

Diff scope is the working tree compared against `HEAD` — staged and unstaged changes
both — plus untracked files, treated as wholly changed.

Base-branch resolution, merge-base computation and the base-override environment
variable are removed. There is one scoping model and no configuration.

## Consequences

The tool behaves identically in every repository with nothing to configure. Branch
names, trunk conventions, remote configuration and network connectivity all stop
mattering, and the fallback chain that changed behaviour without saying so is gone.

Retrieving "the committed version of a file" — which structural attribution needs to
tell a new violation from a pre-existing one — becomes a single cheap `git show
HEAD:<path>` with no branch reasoning.

**The trade accepted:** once a change is committed it leaves scope, so a manual run
after committing checks less than the branch comparison would have. This costs
essentially nothing in practice, because the hook checks each line at the moment it
is written, when the edit is by definition uncommitted — which is the only moment the
branch model's extra reach ever mattered. Work committed mid-session then reviewed
manually is the one case that loses coverage, and re-running the hook is not how that
review happens anyway.

**What this scope is not:** it is not session awareness. The tool cannot distinguish
the current session's edits from an earlier one's, or from a human's uncommitted work
in the same file. It checks what differs from the committed state in the file it was
pointed at. Documentation states this plainly rather than implying the stronger claim.

## Alternatives rejected

**Keep the base-branch model, add a fallback chain per repository.** Proposed by the
upstream architecture review. Rejected: it makes the assumption configurable instead
of removing it, and every added link in the chain is another way for the tool to check
something other than what the reader expects.

**A per-repository configuration file naming the base.** Rejected with per-repository
configuration generally: a knob nobody can be expected to discover is worse than a
model that needs no knob.

**Two modes — working tree for the hook, branch comparison for manual runs.** Rejected:
two scoping models mean two behaviours to document, test and reason about, in exchange
for coverage of the committed-mid-session case described above.
