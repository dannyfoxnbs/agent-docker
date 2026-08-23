---
name: sonar-coverage
description: Check SonarCloud coverage gaps on the current branch. Finds changed TypeScript source files, runs Karma with coverage for their specs, parses the LCOV report, and surfaces exactly which lines and branches are uncovered — then writes the missing tests.
license: MIT
---

## Overview

SonarCloud's "new code" quality gate requires ≥80% on lines, branches, and functions for every source file touched by a PR. This skill automates the loop:

1. Discover which `.ts` source files changed on this branch (vs `dev`)
2. Run Karma with `--codeCoverage` scoped to those spec files only (fast)
3. Parse `coverage/apps/nimbus-app/lcov.info` with `check_coverage.py`
4. For any file below 80%, read it, identify the uncovered paths, and write the missing tests

The skill lives at:
```
~/personal/projects/agent-skills/skills/sonar-coverage/
├── SKILL.md          ← this file
└── check_coverage.py ← LCOV parser
```

---

## Step 1 — Find changed source files

```bash
git diff dev...HEAD --name-only \
  | grep -E '\.ts$' \
  | grep -v '\.spec\.ts$' \
  | grep -v '/e2e/'
```

This gives you the source files. Derive the spec paths by replacing `.ts` → `.spec.ts`.
Only include spec files that actually exist — skip any that are missing entirely (those need creating from scratch).

---

## Step 2 — Run coverage for just those specs

Run from `nx/`:

```bash
npx nx test nimbus-app \
  --browsers=ChromeNoSandboxHeadless \
  --codeCoverage \
  --include="<comma-separated spec paths>"
```

Example:
```bash
npx nx test nimbus-app \
  --browsers=ChromeNoSandboxHeadless \
  --codeCoverage \
  --include="apps/nimbus-app/src/app/foo/bar.service.spec.ts,apps/nimbus-app/src/app/baz/qux.service.spec.ts"
```

The LCOV report lands at:
```
nx/coverage/apps/nimbus-app/lcov.info
```

---

## Step 3 — Parse the report

Run the script, passing the changed source filenames as filters:

```bash
python3 ~/personal/projects/agent-skills/skills/sonar-coverage/check_coverage.py \
  nx/coverage/apps/nimbus-app/lcov.info \
  bar.service.ts \
  qux.service.ts
```

The script prints pass/fail per file with:
- Lines / Branches / Functions percentages
- Exact uncovered line numbers
- Uncovered branch locations (line + block + branch index)

Exit code `0` = all pass, `1` = one or more below threshold.

---

## Step 4 — Fix the gaps

For each file flagged below 80%:

1. **Read the source file** — focus on the uncovered line numbers reported.
2. **Identify the missing path** — each uncovered line is a branch not taken or a function never called. Common patterns:
   - Early-return guards (`if (!x) return`)
   - Ternary falsy arms (`x ? a : b` — the `b` side)
   - `?? fallback` when the left side is never null
   - Observable callbacks that only fire when a Subject emits
   - Error / catch blocks
3. **Write the test** — follow the `angular-testing` skill conventions (ts-mockito, fakeAsync/flush, no template testing).
4. **Re-run Step 2–3** to confirm all metrics reach ≥80%.

### Key patterns for common coverage gaps

**Uncovered Subject callback** (the most common gap after a service rename):
The service subscribes to an observable from a dependency. In the test the dep is mocked with `EMPTY` or never emits. Fix: expose a `Subject` at outer scope, provide it instead of `EMPTY`, and emit in a dedicated test.

```typescript
// outer scope
let mockRowMutated$: Subject<SomeMutation>;

// beforeEach
mockRowMutated$ = new Subject();
{ provide: SomeService, useValue: { rowMutated$: mockRowMutated$ } }

// test
it('should handle mutation', fakeAsync(() => {
  constructService();
  flush();

  mockRowMutated$.next({ ... });

  // check synchronous effects before calling flush()
  expect(service['cache'].has('x')).toBeFalse();

  flush(); // let retrigger/async chain complete
}));
```

**Uncovered `?? fallback`** — the left side is always truthy in tests:
Directly set the underlying BehaviorSubject / signal to `undefined` / `null` before triggering the code path.

**Uncovered preference-change branch** — `preferencesChanged$` emits before the service subscribes:
Move the `Subject` to outer scope, remove the premature `.next()` from `beforeEach`, and emit *after* `constructService()` + `flush()`.

**Uncovered early-return guard** (`if (!viewer?.editor) return`):
Mock the dependency to return an object *without* the nested property, then subscribe to the lazy observable that exercises the guard (e.g. `item.user$.subscribe(...)`).

---

## Quick-reference cheat sheet

| Symptom | Fix |
|---------|-----|
| Callback body uncovered | Replace `EMPTY` with a `Subject`; emit in test |
| `?? []` fallback uncovered | Set BehaviorSubject to `undefined` before the action |
| Preference branch uncovered | Move `Subject` to outer scope; emit after `flush()` |
| Function at 0% | The observable/method is never subscribed to or called in any test |
| Branch 0/0 | No branching code — not a failure, Sonar ignores it |
| `verify()` only, no `expect()` | Jasmine warns "no expectations" but test still passes — add a trivial `expect(result).toBeDefined()` to silence it if the quality gate checks for warnings |

---

## Worked example

```bash
# 1. Find changed files
git diff dev...HEAD --name-only | grep -E '\.ts$' | grep -v spec

# 2. Run coverage
npx nx test nimbus-app --browsers=ChromeNoSandboxHeadless --codeCoverage \
  --include="apps/nimbus-app/src/app/spec/.../my.service.spec.ts"

# 3. Check
python3 ~/personal/projects/agent-skills/skills/sonar-coverage/check_coverage.py \
  nx/coverage/apps/nimbus-app/lcov.info \
  my.service.ts

# Output example:
# ✗ apps/nimbus-app/src/app/.../my.service.ts
#    Lines:    87.7% (164/187)
#    Branches: 66.7% (42/63) ⚠
#    Funcs:    79.3% (65/82) ⚠
#    Uncovered lines: 208, 209, 214, 216
#    Uncovered branches (3):
#      - line 208 block 13 branch 1
#      - line 422 block 4 branch 0
#      - line 491 block 34 branch 0
```

Then read lines 208, 209, 214, 216 in the source, identify the missing path, write the test, re-run.
