# Skills

Every directory here containing a `SKILL.md` is a self-contained Agent Skill. Nothing in this directory depends on Docker, SBX, or the rest of this repository, so a skill can be lifted straight into an existing workflow.

## Take a skill into your own setup

Copy or symlink the skill directory into whichever location your harness discovers. A symlink keeps it updating with `git pull`; a copy is yours to edit.

| Harness | Location |
|---|---|
| Claude Code (one project) | `<project>/.claude/skills/<skill>` |
| Claude Code (everywhere) | `~/.claude/skills/<skill>` |
| Pi | `<project>/.agents/skills/<skill>` or `~/.pi/agent/skills/<skill>` |
| opencode | `<project>/.opencode/skills/<skill>` |

```sh
# from a clone of this repository at ~/repos/agent-docker
mkdir -p ~/.claude/skills
ln -s ~/repos/agent-docker/skills/tdd ~/.claude/skills/tdd
```

Pi can also install this repository as a local or Git package, because `skills/` is a conventional skills directory.

Both isolation variants pick these up with no extra wiring: Compose bind-mounts `skills/` read-only and links it into each harness, and SBX snapshots it into a kit when a sandbox is created.

## Azure DevOps skills

Nine skills that read and write Azure DevOps work items and pull requests. They are one group: `review-azure-devops-pr` shells out to its siblings' scripts by relative path, and the description skills reference each other, so **install the whole group rather than picking single directories**.

| Skill | Does |
|---|---|
| `read-azure-devops-ticket` | Print a work item (PBI, bug, task) — fields, acceptance criteria, links |
| `read-azure-devops-pr-diff` | Print a PR's diff as a three-dot `git diff`, matching the ADO Files view |
| `read-azure-devops-pr-comments` | List unresolved review threads, grouped by file |
| `write-local-azure-devops-ticket` | Draft a PBI or bug into a local markdown file from a template |
| `write-local-azure-devops-pr-description` | Draft a PR body from the repo's `pull_request_template.md`, grounded in the diff |
| `write-azure-devops-pr-description` | Publish a drafted body onto an existing PR |
| `write-azure-devops-pr-comment` | Post inline review threads and one idempotent summary thread |
| `create-azure-devops-pr` | Open a PR for the current branch, titled and linked from a PBI |
| `review-azure-devops-pr` | Risk-review a PR from its diff and post only high-risk findings |

The `-local-` prefix is the safety convention: those two skills only write files in the working directory and never touch the server.

The usual chain is draft → open → review:

```text
write-local-azure-devops-pr-description   ->  pr-<branch>.md
create-azure-devops-pr                    ->  PR opened, PBI linked
review-azure-devops-pr                    ->  inline findings + summary posted
```

### Requirements

`python3` and `git`. The scripts use the Azure DevOps REST API through the Python standard library — no pip packages, and **the `az` CLI is not needed**.

### Authentication

A [Personal Access Token](https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate) for your organisation, with the scopes the skills you use need:

| Scopes | Covers |
|---|---|
| Work Items (Read) | reading tickets |
| Code (Read) | reading PR diffs and comments |
| Code (Read & Write) | posting comments, setting descriptions, creating PRs |
| Work Items (Read & Write) | linking a PBI to a new PR |

One token with all four is simplest. A Packaging-scoped npm token will not work.

Supply it either way:

```sh
# environment variable — what the Compose variant passes into the container
export AZURE_DEVOPS_EXT_PAT='<your-pat>'

# or a file, which survives shell restarts
mkdir -p ~/.config/azure-devops
printf %s '<your-pat>' > ~/.config/azure-devops/pat && chmod 600 ~/.config/azure-devops/pat
```

### Pointing them at your organisation

The scripts default to the org and project these skills were written against, overridden per environment:

| Variable | Default | Used by |
|---|---|---|
| `ADO_ORG` | `https://thenbs.visualstudio.com/` | all skills |
| `ADO_PROJECT` | `Nimbus` | `read-azure-devops-ticket` |
| `ADO_PAT_FILE` | `~/.config/azure-devops/pat` | all skills |

Set `ADO_ORG` and `ADO_PROJECT` before first use if you are not on that organisation. The skill prose still names the `thenbs` org in places; only these variables decide where a request goes. `create-azure-devops-pr` also defaults its target branch to `dev` (`--target` overrides).

Each skill's own `README.md` covers its flags, verification steps, and troubleshooting.

### Running them in the containers

The Compose variant passes `AZURE_DEVOPS_EXT_PAT`, `ADO_ORG`, and `ADO_PROJECT` through from the host or `.env` — see [`../env.example`](../env.example). `ADO_PAT_FILE` is deliberately not passed, since a host path is not a container path; use the environment variable there.

The PR skills that shell out to `git` need the PR's clone to be the mounted workspace, so launch with that project:

```sh
./compose/run claude ~/repos/my-ado-project
```

The `az` CLI is not installed by default. Build it in when you want it for ad-hoc shell work:

```sh
INSTALL_AZURE_CLI=true ./compose/run --build claude ~/repos/my-ado-project
```

The SBX variant snapshots these skills like any other, but does not wire the PAT through; set it inside the sandbox or via an SBX secret.
