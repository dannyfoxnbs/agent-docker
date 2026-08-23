# read-azure-devops-ticket

A Claude Code skill for reading Azure DevOps work items (PBIs, bugs, tasks) from
the `thenbs` org, `Nimbus` project. Built to grow toward PRs and code reviews.

## Setup (one-time, per person)

1. Create a Personal Access Token with **Work Items (Read)** scope at
   https://thenbs.visualstudio.com/_usersSettings/tokens
2. Store it (never commit it):

   ```bash
   mkdir -p ~/.config/azure-devops
   printf %s '<your-pat>' > ~/.config/azure-devops/pat && chmod 600 ~/.config/azure-devops/pat
   ```

   `$AZURE_DEVOPS_EXT_PAT` works instead of the file, and `ADO_PAT_FILE` points
   at a different file path if you keep your PAT elsewhere. The npm PAT in
   `~/.npmrc` is Packaging-scoped and will NOT work here.

## Installing the skill

See [`../README.md`](../README.md) for the per-harness skill directories, and
install the whole `*-azure-devops-*` group together — the review skill calls its
siblings' scripts.

## Usage

```bash
python3 scripts/workitem.py <id>
```

Override the target with the `ADO_ORG` / `ADO_PROJECT` env vars.

## Troubleshooting

- **Auth error / PAT rejected** — the token is expired or missing the Work Items
  (Read) scope. Regenerate it at the link above.
- **`az` not found** — not used; this skill talks to the REST API with the Python
  standard library only.
