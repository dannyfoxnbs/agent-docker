# write-azure-devops-pr-description

A Claude Code skill for setting the **description of an existing** Azure DevOps
pull request in the `thenbs` org. It's the real-PR counterpart to
`write-local-azure-devops-pr-description`:

- `write-local-azure-devops-pr-description` — **drafts** a body from the repo's
  `pull_request_template.md`, grounded in the diff, into a local `pr-<branch>.md`
  you review and keep. Touches nothing on the server.
- `write-azure-devops-pr-description` (this one) — **publishes** a body onto the
  real PR's description field.

Same `-local-` convention as `write-local-azure-devops-ticket`: no `-local-`
means it writes to ADO.

## Setup (one-time, per person)

A Personal Access Token with **Code (Read & Write)** at
https://thenbs.visualstudio.com/_usersSettings/tokens — the same token the other
PR write skills use.

```bash
mkdir -p ~/.config/azure-devops
printf %s '<your-pat>' > ~/.config/azure-devops/pat && chmod 600 ~/.config/azure-devops/pat
```

`$AZURE_DEVOPS_EXT_PAT` works instead of the file; `ADO_PAT_FILE` points at a
different path; `ADO_ORG` overrides the org.

## Usage

```bash
# publish the local draft for the current branch onto PR 12345 (auto-pickup)
python3 scripts/set_description.py 12345

# from an explicit file
python3 scripts/set_description.py 12345 --description pr-my-branch.md

# from stdin
some-generator | python3 scripts/set_description.py 12345 --description -
```

The PR id is the number in the PR URL
(`.../_git/<repo>/pullrequest/<pr-id>`). The repo and project are resolved from
the id, so you don't have to be in the clone — except that the `pr-<branch>.md`
auto-pickup needs the current branch, so it only works from the clone. This
**replaces** the description (it does not append).

## Typical flow

```bash
/write-local-azure-devops-pr-description   # 1. draft -> pr-<branch>.md (review/edit it)
/write-azure-devops-pr-description 12345   # 2. publish it onto the PR
```

## Verifying it worked

The script prints the PR URL and the character count it set. Open the PR and
confirm the description rendered as expected. Do this once by hand before
trusting it in an agent.

## Troubleshooting

- **PAT rejected** — expired, or only has `Code (Read)`; it needs
  `Code (Read & Write)`.
- **not found** — wrong PR id, or the PAT can't see that project.
- **no description source** — pass `--description <path|->`, or run from the
  clone where `pr-<branch>.md` exists.
