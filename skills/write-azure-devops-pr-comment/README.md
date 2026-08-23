# write-azure-devops-pr-comment

A Claude Code skill for posting inline review comments against lines of an Azure
DevOps pull request in the `thenbs` org. It's the write counterpart to
`read-azure-devops-pr-comments`, and the primitive a code review agent uses to
post its findings.

## Setup (one-time, per person)

1. Create a Personal Access Token with **Code (Read & Write)** scope at
   https://thenbs.visualstudio.com/_usersSettings/tokens

   > Note: the reader skill's `Code (Read)` PAT is NOT enough to post. Either
   > upgrade that token to `Code (Read & Write)` or make a new one.
2. Store it (never commit it):

   ```bash
   mkdir -p ~/.config/azure-devops
   printf %s '<your-pat>' > ~/.config/azure-devops/pat && chmod 600 ~/.config/azure-devops/pat
   ```

   `$AZURE_DEVOPS_EXT_PAT` works instead of the file, and `ADO_PAT_FILE` points
   at a different file path if you keep your PAT elsewhere.

## Usage

```bash
# many findings: JSON array of {file, line, message} on stdin or a file
python3 scripts/post_comment.py <pr-id> --json findings.json
python3 scripts/post_comment.py <pr-id> --json -        # from stdin

# one finding: positional
python3 scripts/post_comment.py <pr-id> <file-path> <line> "<message>"
```

The PR id is the number in the PR URL
(`.../_git/<repo>/pullrequest/<pr-id>`). Override the target org with the
`ADO_ORG` env var. `line` must be an integer anchoring to the right-hand (new)
side of the diff. The PR is resolved once and each finding posted; a malformed
finding is reported and skipped without aborting the rest (exit code 1 if any
were skipped).

Every comment is prefixed with `🤖 AI review:` and posted under the PAT
owner's identity (Azure DevOps has no bot identity here); the tag is how you
tell machine-authored threads apart in the reader.

## Verifying it worked

The script prints the new thread id and PR URL. Open the PR, confirm the
comment is anchored to the right line, then resolve or delete it. Do this once
by hand before trusting the primitive in an agent.

## Troubleshooting

- **PAT rejected** — the token is expired or only has `Code (Read)`; it needs
  `Code (Read & Write)`.
- **not found** — wrong PR id, or the PAT can't see that project.
- **comment lands on the wrong line** — the line is anchored to the right-hand
  (new) side of the diff; make sure you're passing a line number from the
  post-change file, not the original.
