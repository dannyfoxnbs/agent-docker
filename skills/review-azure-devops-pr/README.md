# review-azure-devops-pr

A Claude Code skill that reviews an Azure DevOps pull request and posts a few
terse inline comments for high-confidence findings. It's pure orchestration —
it chains three sibling skills and adds no logic of its own:

| Step | Skill | Role |
|---|---|---|
| what changed | `read-azure-devops-pr-diff` | the PR's diff (3-dot, any target branch) |
| what's been said | `read-azure-devops-pr-comments` | existing threads, so it won't repeat itself |
| post findings | `write-azure-devops-pr-comment` | one `🤖 AI review:` comment per finding |

## How dedup works (and why it's here, not in a file)

Every comment is tagged `🤖 AI review:`. Before posting, the review reads the
PR's existing threads and drops any finding it already made — judged by meaning,
so reworded or line-shifted duplicates are still caught. State lives in the PR,
not a local log, so it works no matter who runs it or from which machine.

Known limit: the reader lists unresolved threads only, so a finding a human
already resolved can reappear on a later run. See `SKILL.md`.

## Setup

Needs the sibling skills present (they're synced together) and a PAT with
**Code (Read & Write)** — the write scope covers all three. Run from inside a
clone of the PR's repo (the diff step shells out to `git`). See each sibling
skill's README for PAT details.

## Usage

Invoke the skill with a PR id; it runs the full process — diff, prior comments,
review, post, report. To dry-run, stop it before step 5 and inspect the findings
JSON it assembled.
