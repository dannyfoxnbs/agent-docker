# Portable agent setup

A standalone collection of agent skills plus two isolated ways to try the same basic Claude Code, Codex, and Pi setup.

- [`skills/`](skills/) is the canonical skill collection and does not depend on Docker or Docker Sandboxes.
- [`config/`](config/) holds portable, non-secret harness configuration.
- [`sbx/`](sbx/) runs agents in Docker Sandbox microVMs.
- [`compose/`](compose/) runs all three agents from one conventional Docker image.

Neither variant requires Claude Code, Codex, or Pi to be installed on the host.

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
config/claude/            Claude Code settings
config/codex/             Codex settings
config/pi/                Pi settings, extensions, prompts, and themes
```

Keep credentials, OAuth tokens, sessions, machine-specific paths, and private keys out of `config/`.

Compose sees skill and configuration changes on the next container start. An existing SBX sandbox keeps its creation-time snapshot; reset it explicitly when you want to apply repository changes.

## Use the skills without isolation

Copy or link individual directories from [`skills/`](skills/) into a harness-supported skills directory. Pi can also install this repository as a local or Git package because it contains a conventional `skills/` directory.
