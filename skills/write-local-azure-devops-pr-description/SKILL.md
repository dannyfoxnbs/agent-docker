---
name: write-local-azure-devops-pr-description
description: Draft a pull request description for our team's Azure DevOps format as a local markdown file, grounded in the branch's actual changes. Use when the user wants to write / draft / generate a PR description or PR write-up for the current branch. To push a description onto the real PR, use write-azure-devops-pr-description.
disable-model-invocation: true
---

# Write Local Azure DevOps PR Description

Draft a PR description **grounded** in what the branch actually changed, using
the team's own template, and write it to a markdown file in the working directory.

1. Gather the change. Detect the base branch (the branch this one will merge
   into — ask if ambiguous)

   ```
   git diff <base> ...HEAD
   ```

   The diff is the source of truth - describe what the code does, not just what
   the commit messages claim.

2. Read the team template from the repo root: `pull_request_template.md`. This
   is the single source of truth for section layout and the Y/N checklist — it
   changes over time, so always read the live file, never a remembered copy. If
   it's absent, ask the user where the template lives.

3. Fill:
   - **Changes** — the fewest bullets that convey what changed and why it
     matters to a reviewer. Scale with the number of *distinct logical changes*,
     not the diff size — a 200-file mechanical edit (e.g. an import rename) is
     still one bullet. Even a large PR rarely needs more than ~8. Describe the
     user-visible effect, not the code; don't add a bullet just for tests.
   - **Risk** _(optional)_ — if the change already looks obviously low-risk,
     paste this verbatim right after Changes. Otherwise leave it out — don't
     think or search to decide.

     ```
     # Risk
     Low - no domain knowledge required for this review
     ```
   - **Y/N checklist items** — answer each from evidence when the diff settles
     it (e.g. common package touched → Y). For anything the diff can't settle leave as Y/N.

4. Write the result to `pr-<kebab-branch-name>.md` in the working directory.

## Length calibration

Even a one-line fix earns just one bullet — the user-visible effect and the ticket, no root-cause essay:

```
# 🛠 Changes
- Fix: in the *Select a clause to create* modal, a lone padlocked (out-of-subscription)
  clause is no longer auto-selected, so the **Create & paste** button stays disabled. (PBI 92401)
```
