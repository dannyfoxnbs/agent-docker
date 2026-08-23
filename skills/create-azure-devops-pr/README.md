# create-azure-devops-pr

A Claude Code skill for opening a new Azure DevOps pull request in the `thenbs`
org. It's the create counterpart to the read/comment PR skills: those operate on
a PR that already exists (resolved from an org-unique PR id); this one has no id
yet, so it reads the **local clone** to decide which repo and branch the PR is
for — the same way a PR is inherently tied to one repo.

## What it infers vs. what you pass

| PR needs | Where it comes from |
|---|---|
| repository (id + project) | the clone → `git remote get-url origin` |
| source branch | current branch (or `--source`) |
| target branch | `dev` (or `--target`) |
| title | the PBI title, or the last commit subject (or `--title`) |
| description | `write-local-azure-devops-pr-description`'s `pr-<branch>.md` if present, else a PBI-link line (or `--description`) |
| work-item link | the optional PBI id |

A work item (PBI) has **no repository** in Azure DevOps, so a PBI alone can't
route a PR — the clone supplies that. PBI + clone is enough for a fully-formed,
linked PR.

## Setup (one-time, per person)

1. Create a Personal Access Token at
   https://thenbs.visualstudio.com/_usersSettings/tokens with:
   - **Code (Read & Write)** — to create the PR, and
   - **Work Items (Read & Write)** — to read a PBI's title and link it.

   > The reader skills' `Code (Read)` PAT is not enough to create; upgrade it or
   > make a new one.
2. Store it (never commit it):

   ```bash
   mkdir -p ~/.config/azure-devops
   printf %s '<your-pat>' > ~/.config/azure-devops/pat && chmod 600 ~/.config/azure-devops/pat
   ```

   `$AZURE_DEVOPS_EXT_PAT` works instead of the file, and `ADO_PAT_FILE` points
   at a different path if you keep your PAT elsewhere. Override the org with
   `ADO_ORG`.

## Usage

Run from inside the repo clone, on the branch you want to PR:

```bash
# PR from the current branch into dev, titled + linked to a PBI
python3 scripts/create_pr.py 92401

# choose the target branch, and push the branch first if it isn't on origin yet
python3 scripts/create_pr.py 92401 --target release/2026.7 --push

# no PBI — title comes from the last commit subject
python3 scripts/create_pr.py --draft

# take the body from a description file (e.g. one produced by write-local-azure-devops-pr-description)
python3 scripts/create_pr.py 92401 --description pr-my-branch.md
```

The source branch must exist on `origin` first — the script stops with a clear
instruction if it doesn't (or pass `--push`). If an active PR for the same
source → target already exists, it prints that PR rather than creating a
duplicate.

## PR description

This skill only *publishes* a description; it doesn't draft one. A description
grounded in the repo's `pull_request_template.md` (and in the actual diff) is the
job of the separate **`write-local-azure-devops-pr-description`** skill, which writes
`pr-<branch>.md` to the working directory. So the full flow is:

```bash
# 1. draft the templated body (fills the repo's pull_request_template.md)
#    -> writes pr-<branch>.md
/write-local-azure-devops-pr-description

# 2. open the PR — it auto-picks up that pr-<branch>.md
python3 scripts/create_pr.py 92401
```

`create_pr.py` resolves the body in this order: an explicit `--description
<path|->`, then the `pr-<branch>.md` sitting in the cwd, then a one-line PBI
link. It prints which source it used.

## Verifying it worked

The script prints the new PR id and URL, and `linked PBI #…` when a work item
was attached. Open the URL, confirm the source/target branches and that the PBI
shows under the PR's linked work items. Do this once by hand before trusting it
in an agent.

## Troubleshooting

- **PAT rejected** — expired, or missing `Code (Read & Write)` /
  `Work Items (Read & Write)`.
- **branch isn't on origin yet** — push it (`git push -u origin <branch>`) or
  re-run with `--push`.
- **can't parse an Azure DevOps repo from origin** — the clone's `origin` isn't
  an ADO repo URL; run from the right clone.
- **PR created but linking PBI failed** — the PR is fine; the token likely lacks
  `Work Items (Read & Write)`. Re-linking by hand on the PR is safe.
- **source and target are both …** — you're on the default branch; check out
  your feature branch or pass `--source`.
