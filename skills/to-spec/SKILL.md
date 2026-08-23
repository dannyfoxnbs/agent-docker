---
name: to-spec
description: Turn the current conversation into a local Markdown spec or PRD without creating remote tickets. Use when the user asks for a spec, PRD, or requirements document.
disable-model-invocation: true
---

# To Spec

Turn the current conversation context and codebase understanding into a spec (also known as a PRD). Do NOT interview the user - synthesize what is already known, except to confirm the proposed testing seams.

This is a local-only workflow. Never call Azure DevOps, GitHub, GitLab, or another remote issue tracker. Do not run `/setup-matt-pocock-skills`.

## Process

1. Explore the repo to understand the current state of the codebase, if you have not already. Use the project's domain glossary vocabulary and respect ADRs in the relevant area.

2. Sketch the seams at which the feature will be tested. Prefer existing seams and use the highest seam possible. If a new seam is needed, propose it at the highest point possible. Check with the user that the seams match their expectations.

3. Derive a short kebab-case feature slug from the spec title. Write the approved spec to `.scratch/<feature-slug>/SPEC.md`, creating the directory if necessary. If the target exists, ask before overwriting it.

Use this template:

## Problem Statement

The problem the user is facing, from the user's perspective.

## Solution

The solution to the problem, from the user's perspective.

## User Stories

An extensive numbered list of user stories in this format:

1. As a <actor>, I want a <feature>, so that <benefit>

## Implementation Decisions

Record modules, interfaces, technical clarifications, architectural decisions, schema changes, API contracts, and specific interactions. Do not include file paths or code snippets because they go stale quickly.

Exception: inline a concise decision-rich snippet from a prototype when it expresses a state machine, reducer, schema, or type shape more precisely than prose. Note that it came from a prototype.

## Testing Decisions

Record what makes a good test, which behaviours or modules need testing, and comparable existing tests in the codebase. Test external behaviour, not implementation details.

## Out of Scope

Describe what this spec intentionally does not cover.

## Further Notes

Record unresolved details, constraints, or useful context.
