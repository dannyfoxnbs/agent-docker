---
name: write-azure-devops-pr-description
description: Publish a drafted description onto an existing Azure DevOps PR (by id), from a local pr-<branch>.md file or stdin.
disable-model-invocation: true
argument-hint: "<pr-id> [--description path|-]"
---

# Write Azure DevOps PR Description

**Publish** a description onto an existing PR in the `thenbs` org — the remote counterpart to `write-local-azure-devops-pr-description`, which *drafts* the body (from the repo's `pull_request_template.md`) into a local `pr-<branch>.md`. Draft there, publish here.

- **`<pr-id>`** _(required)_ — the PR to update; its repo/project resolve from the id, so you need not be in the clone (except for the `pr-<branch>.md` pickup below).
- **Body** — `--description <path|->` (a file, or `-` for stdin), else the local `pr-<branch>.md` for the current branch. With neither, it stops.

Replaces the whole description — it does not append. Needs a PAT with **Code (Read & Write)**; see README.

!`python3 ${CLAUDE_SKILL_DIR}/scripts/set_description.py $ARGUMENTS`
