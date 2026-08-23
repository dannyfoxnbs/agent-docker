---
name: read-azure-devops-pr-comments
description: List the unresolved review threads on an Azure DevOps PR — human reviewers and bots like SonarCloud — grouped by file with anchor line, author, date and text. Use only when reading or addressing review comments on a specific ADO PR by id.
argument-hint: [pr-id]
---

# Read Azure DevOps PR Comments

Unresolved threads only (status active/pending), grouped by file. Resolved/closed threads and system notifications (votes, reviewer changes) are skipped. Needs a PAT with **Code (Read)** — see `README.md`.

!`python3 ${CLAUDE_SKILL_DIR}/scripts/pr_comments.py $ARGUMENTS`

## Presenting results

The output is complete and faithful (including inline code suggestions) — don't summarise it away. Lead with an "at a glance" triage table (thread id · file:line · author · gist, blocking findings and bot reviews called out), group related threads by theme, then work through them file-by-file.
