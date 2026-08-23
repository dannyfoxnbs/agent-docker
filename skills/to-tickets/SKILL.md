---
name: to-tickets
description: Break a plan, spec, or conversation into local Markdown tracer-bullet tickets with blocking edges. Use when the user asks to split work into tickets.
disable-model-invocation: true
---

# To Tickets

Break a plan, spec, or conversation into tracer-bullet vertical-slice tickets. Each ticket declares the tickets that block it.

This is a local-only workflow. Never call Azure DevOps, GitHub, GitLab, or another remote issue tracker. Do not run `/setup-matt-pocock-skills`.

## Process

### 1. Gather context

Use the current conversation. If the user supplies a local spec path, read it in full.

### 2. Explore the codebase

If the codebase has not already been explored, inspect it to understand the current state. Use the project's domain vocabulary and respect relevant ADRs. Look for prefactoring that makes the change easier before making the easy change.

### 3. Draft vertical slices

Each ticket must be a narrow but complete path through every relevant layer, demoable or verifiable on its own, and sized for one fresh context window. Do not split work horizontally by layer. Put necessary prefactoring first.

For a wide mechanical refactor that cannot stay green as vertical slices, use expand-contract: expand first, migrate callers in green batches, then contract after every migration is complete.

Give every ticket its blocking edges. A ticket without blockers can start immediately.

### 4. Confirm the breakdown

Present a numbered list showing each ticket's title, blockers, and end-to-end behaviour. Ask whether the granularity and blocking edges are correct, and whether tickets should be merged or split. Iterate until approved.

### 5. Write local ticket files

Derive a short kebab-case feature slug from the source spec or work. Write one approved ticket per file under `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01` in dependency order. Never create, update, or link remote tickets. If the directory already contains ticket files, ask before overwriting them.

Use this template:

```md
# <NN> - <Ticket title>

**What to build:** the end-to-end behaviour this ticket makes work, from the user's perspective, not a layer-by-layer implementation list.

**Blocked by:** the numbers and titles of tickets that gate this one, or "None - can start immediately".

**Status:** ready-for-agent

- [ ] Acceptance criterion 1
- [ ] Acceptance criterion 2
```

Avoid specific file paths and code snippets because they go stale quickly. Exception: include a concise decision-rich snippet from a prototype when it expresses a state machine, reducer, schema, or type shape more precisely than prose, and state that it came from a prototype.
