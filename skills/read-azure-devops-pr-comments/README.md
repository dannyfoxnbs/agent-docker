# read-azure-devops-pr-comments

A Claude Code skill for reading unresolved pull-request comment threads from the
`thenbs` org — human reviewer comments and automated ones (e.g. SonarCloud) —
so they can be addressed in the local environment.

## Setup (one-time, per person)

1. Create a Personal Access Token with **Code (Read)** scope at
   https://thenbs.visualstudio.com/_usersSettings/tokens

   > Note: the ticket skill's PAT is scoped `Work Items (Read)` and will NOT
   > work here. Either add `Code (Read)` to that token or make a new one.
2. Store it (never commit it):

   ```bash
   mkdir -p ~/.config/azure-devops
   printf %s '<your-pat>' > ~/.config/azure-devops/pat && chmod 600 ~/.config/azure-devops/pat
   ```

   `$AZURE_DEVOPS_EXT_PAT` works instead of the file, and `ADO_PAT_FILE` points
   at a different file path if you keep your PAT elsewhere.

## Usage

```bash
python3 scripts/pr_comments.py <pr-id>
```

The PR id is the number in the PR URL
(`.../_git/<repo>/pullrequest/<pr-id>`). Override the target org with the
`ADO_ORG` env var.

## What it shows

- Only **unresolved** threads (status `active` / `pending`).
- Both human and bot comments (SonarCloud, policy bots, etc.).
- Grouped by file, with the anchored line number, author, date and text.
- Skips resolved/closed/won't-fix threads and system notifications (votes,
  reviewer additions, "marked as fixed").

## Troubleshooting

- **PAT rejected** — the token is expired or missing the `Code (Read)` scope.
- **not found** — wrong PR id, or the PAT can't see that project.
- **`az` not found** — not used; threads are read over the REST API with the
  Python standard library only.
