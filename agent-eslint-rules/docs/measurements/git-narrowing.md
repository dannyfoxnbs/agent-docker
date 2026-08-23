# Measurement — narrowing git operations to one file

**Date:** 2026-08-20  
**Decision:** do not add a pathspec-specific code path

Ticket 10 asked whether a hook run narrowed with `LINT_AGENT_ONLY_FILES` should
also pass that file as a pathspec to the git commands. The working-tree scope had
already removed branch-history traversal, so this was measured before changing
code.

## Repository and method

The measurement used a large local monorepo with:

- 6,137 tracked files below the runner's working directory;
- 577,179 packed git objects;
- a 480.65 MiB pack;
- one temporary untracked JavaScript file used as the hook's requested file.

Caches were warmed first. Ten complete scoped runner processes and 50 invocations
of each git command were timed with Python's `time.perf_counter`. Output was
discarded. The temporary file was removed afterwards.

## Results

| Operation | Samples | Median | Mean | Range |
| --- | ---: | ---: | ---: | ---: |
| Complete single-file runner | 10 | 510.0 ms | 510.7 ms | 500.6–527.5 ms |
| Full `git diff HEAD` | 50 | 3.6 ms | 3.6 ms | 3.2–4.6 ms |
| Full untracked-file enumeration | 50 | 10.5 ms | 10.5 ms | 10.1–11.3 ms |
| Pathspec `git diff HEAD` | 50 | 2.6 ms | 2.7 ms | 2.4–3.3 ms |
| Pathspec untracked-file query | 50 | 2.3 ms | 2.3 ms | 2.1–2.9 ms |

A pathspec would reduce the measured git portion from about 14.1 ms to 4.9 ms:
a roughly 9.2 ms saving, or about 1.8% of the complete runner invocation. ESLint
startup and linting dominate the run.

## Decision

No code changed. A second pathspec-aware change-discovery path would need to
preserve staged, unstaged, untracked, no-`HEAD`, scoped, and unscoped semantics
for a saving below normal run-to-run variation at human scale. The measured cost
does not justify that complexity. Unscoped manual runs and scoped hook runs
therefore continue to share one implementation and identical diagnostics.
