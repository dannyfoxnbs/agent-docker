# Portable agent setup

A standalone collection of agent skills plus two isolated ways to try the same basic Claude Code, Codex, and Pi setup.

- [`skills/`](skills/) is the canonical skill collection and does not depend on Docker or Docker Sandboxes. See [`skills/README.md`](skills/README.md) to lift skills into an existing setup.
- [`config/`](config/) holds portable, non-secret harness configuration.
- [`agent-eslint-rules/`](agent-eslint-rules/) is a vendored copy of the stricter per-edit lint rules, wired into the Compose variant's Claude and Pi.
- [`sbx/`](sbx/) runs agents in Docker Sandbox microVMs.
- [`compose/`](compose/) runs all three agents from one conventional Docker image.

Neither variant requires Claude Code, Codex, or Pi to be installed on the host.

## Hand it to an agent

Paste [`PROMPT.md`](PROMPT.md) into an agent session opened in this clone. It works out whether you want Compose, Docker Sandboxes, or the skills copied into a harness already on your machine, confirms the paths, and then does only that.

## Choose a variant

| | Docker Sandboxes | Docker Compose |
|---|---|---|
| Host requirement | `sbx`, Docker login, hardware virtualisation | Docker Engine/Desktop with Compose |
| Isolation | Separate microVM and kernel | Ordinary container isolation |
| Agent installation | Built-in Claude/Codex templates; Pi installed by a kit | All three installed in one image |
| Skills/config updates | Snapshot when a sandbox is created | Live read-only bind mounts |
| Subscription login | Best integration, especially Codex | Works, but browser callbacks can be less convenient |
| Resource use | Higher | Lower |
| Maturity | SBX environments and kits are experimental | Stable Docker Compose workflow |

Start with SBX for the stronger agent boundary, then use Compose to compare simplicity and resource use.

## Workspace and paths

Copy [`env.example`](env.example) to `.env` in the repository root to set defaults instead of passing them every time:

```sh
cp env.example .env
```

| Variable | Effect |
|---|---|
| `WORKSPACE` | Project mounted at `/workspace` when no workspace argument is given. Absolute path or `~`. |
| `AGENT_ESLINT_RULES` | Location of the lint rules clone. A relative value resolves against `compose/`. |
| `AZURE_DEVOPS_EXT_PAT` | Personal Access Token used by the Azure DevOps skills. |
| `ADO_ORG`, `ADO_PROJECT` | Organisation and default project those skills target. |
| `INSTALL_AZURE_CLI` | Build the `az` CLI into the Compose image. Off by default. |

Both `./compose/run` and `./sbx/run` read `.env`, and `./compose/run` passes it to Compose as `--env-file` so plain `docker compose` sees the same values. A workspace given on the command line always wins. `.env` is git-ignored; `AGENT_ENV_FILE` points either runner at a different file.

## Docker Sandboxes

Install and authenticate Docker Sandboxes using the [official installation guide](https://docs.docker.com/ai/sandboxes/install/), then run:

```sh
./sbx/run claude ../my-project
./sbx/run codex ../my-project
./sbx/run pi ../my-project
```

The first run downloads the relevant template and creates a persistent sandbox. Later runs reattach to it.

See [`sbx/README.md`](sbx/README.md) for authentication, configuration behaviour, and resetting after skill changes.

## Docker Compose

With Docker and the Compose plugin installed:

```sh
./compose/run claude ../my-project
./compose/run codex ../my-project
./compose/run pi ../my-project
```

The first run builds the shared image. Agent credentials and sessions persist in named volumes while the selected project is mounted at `/workspace`.

See [`compose/README.md`](compose/README.md) for authentication and isolation details.

## Per-edit lint rules

The Compose variant checks the lines an agent just wrote against [`agent-eslint-rules/`](agent-eslint-rules/): no comments, 100-line functions, 3 parameters, no magic numbers. Claude runs it as a `PostToolUse` hook, Pi as a loaded package; Codex has no per-edit hook mechanism and is not wired in. The rules resolve `eslint` and `typescript-eslint` from the mounted project and fail open with a labelled warning when they are absent, so a tooling problem never looks like a code violation.

Thresholds live in `agent-eslint-rules/eslint.config.agent.mjs`. See [`compose/README.md`](compose/README.md#per-edit-lint-rules) for details and [`agent-eslint-rules/README.md`](agent-eslint-rules/README.md) for what each rule does.

## Azure DevOps skills

The `*-azure-devops-*` skills in [`skills/`](skills/) read and write Azure DevOps work items and pull requests — tickets, PR diffs, review comments, PR descriptions, opening a PR, and a risk review that chains them. They talk to the REST API with the Python standard library, so they need no `az` CLI and no pip packages, only a Personal Access Token.

Set `AZURE_DEVOPS_EXT_PAT` (plus `ADO_ORG` and `ADO_PROJECT` for your own organisation) in `.env` and the Compose variant passes them into the container. The `az` CLI is available on request for ad-hoc shell work:

```sh
INSTALL_AZURE_CLI=true ./compose/run --build claude ~/repos/my-ado-project
```

It adds roughly 900MB to the image, which is why it is off by default. See [`skills/README.md`](skills/README.md#azure-devops-skills) for PAT scopes and the draft → open → review chain.

## Authentication

Authentication is user-specific runtime state and is never included in this repository or its images.

- Claude and Pi support Anthropic subscription login through `/login`.
- Codex supports ChatGPT subscription login.
- Pi also supports OpenAI subscription login through `/login`.
- API keys can be supplied through SBX secrets or host environment variables, depending on the variant.

A developer needs the chosen container runtime but does not need any agent harness installed locally.

## Customize the setup

Edit the canonical files directly:

```text
skills/                  Agent Skills packages
config/shared/AGENTS.md  Instructions shared across harnesses
config/nimbus/           Project instructions for the Nimbus workspace
config/claude/           Claude Code settings
config/claude/mcp.json   Optional MCP servers, passed as --mcp-config when present
config/codex/            Codex settings
config/pi/               Pi settings, extensions, prompts, and themes
agent-eslint-rules/      Per-edit lint rules and their thresholds
.env                     Workspace and path defaults (git-ignored)
```

Keep credentials, OAuth tokens, sessions, machine-specific paths, and private keys out of `config/`.

Compose sees skill and configuration changes on the next container start. An existing SBX sandbox keeps its creation-time snapshot; reset it explicitly when you want to apply repository changes.

## Use the skills without isolation

Copy or link individual directories from [`skills/`](skills/) into a harness-supported skills directory. Pi can also install this repository as a local or Git package because it contains a conventional `skills/` directory.
