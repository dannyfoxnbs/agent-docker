---
name: read-azure-devops-pr-diff
description: Print the exact diff an Azure DevOps PR introduces (the ADO "Files" view) as a git diff. Use only when reading or reviewing a specific ADO PR referenced by id.
argument-hint: [pr-id] [--name-only|--stat]
---

# Read Azure DevOps PR Diff

Runs `git diff target...source` from the PR's own `targetSha`/`sourceSha` — **three-dot**, so it matches the ADO UI (the branch's changes vs its merge-base, never unrelated target churn) with the base read live from the PR. Run from inside a clone of the PR's repo; missing commits are fetched from `origin` first.

!`python3 ${CLAUDE_SKILL_DIR}/scripts/pr_diff.py $ARGUMENTS`
