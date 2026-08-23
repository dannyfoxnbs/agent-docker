---
name: write-azure-devops-pr-comment
description: Post AI review comments on an Azure DevOps PR — inline threads anchored to lines and/or one idempotent PR-level summary thread, tagged 🤖 AI review. Use only when posting review findings to a specific ADO PR by id.
argument-hint: [pr-id] --json [path] [--summary path]  |  [pr-id] [file] [line] [message]
---

# Write Azure DevOps PR Comment

Post threads on a PR in the `thenbs` org. Inline findings and a summary can be combined in one call:

- **Inline findings** — `<pr-id> --json <path>`, a JSON array of `{file, line, message}`.
- **One inline finding** — `<pr-id> <file> <line> "<message>"`.
- **Summary** — `<pr-id> --summary <path|->` (plain text/markdown; `-` reads stdin). One PR-level thread with no line anchor, posted non-blocking (closed). **Idempotent** — re-running updates the existing summary thread in place, so a PR only ever has one.
- **Both** — `<pr-id> --json <findings> --summary <summary>`.

`file` is repo-root-relative; `line` anchors to the **right-hand (new) side** of the diff; every message is posted after an `🤖 AI review:` tag under the PAT owner (ADO has no bot identity). Malformed inline findings are reported and skipped, never fatal. Prints what was posted/updated and the PR URL.

!`python3 ${CLAUDE_SKILL_DIR}/scripts/post_comment.py $ARGUMENTS`
