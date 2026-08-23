# read-azure-devops-pr-diff

A Claude Code skill for getting the exact diff an Azure DevOps pull request
represents — the same changes shown in the PR "Files" tab — as a git diff,
resolved deterministically from the PR's own commits. It's the read primitive a
code-review flow pairs with `write-azure-devops-pr-comment`.

It resolves the diff from the PR's own `lastMergeTargetCommit` /
`lastMergeSourceCommit` and runs a **three-dot** `git diff target...source` — see
`SKILL.md` for why that matches the ADO UI and works for any target branch.

## Setup (one-time, per person)

Uses the same `Code (Read)` PAT as `read-azure-devops-pr-comments`:

```bash
mkdir -p ~/.config/azure-devops
printf %s '<your-pat>' > ~/.config/azure-devops/pat && chmod 600 ~/.config/azure-devops/pat
```

`$AZURE_DEVOPS_EXT_PAT` works instead of the file, and `ADO_PAT_FILE` points at a
different file path if you keep your PAT elsewhere. Override the org with
`ADO_ORG`.

## Usage

```bash
# from inside a clone of the PR's repo
python3 scripts/pr_diff.py <pr-id>              # full unified diff
python3 scripts/pr_diff.py <pr-id> --stat       # diffstat summary
python3 scripts/pr_diff.py <pr-id> --name-only  # changed paths only
```

## Troubleshooting

- **PAT rejected** — token expired or missing `Code (Read)`.
- **not found** — wrong PR id, or the PAT can't see that project.
- **commit(s) not found locally even after fetch** — you're not in a clone of
  the PR's repo, or `origin` doesn't point at it. `cd` into the right repo.
- **not inside a git repo** — run it from within the repo clone, not an
  arbitrary directory.
