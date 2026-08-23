# Docker Sandboxes variant

This variant requires only Docker Sandboxes (`sbx`) on the host. Claude Code and Codex come from Docker's built-in agent templates; the Pi kit installs Pi inside a generic sandbox.

## Run

From the repository root:

```sh
./sbx/run claude ../my-project
./sbx/run codex ../my-project
./sbx/run pi ../my-project
```

The workspace defaults to this repository when omitted. The script generates a local sandbox environment under `.sandbox-cache/`, copies the current `skills/` and `config/` snapshot into its kits, and runs `sbx env run`.

A sandbox persists between runs. Changes to `skills/` or `config/` therefore apply to a newly created sandbox, not an existing one. Recreate one explicitly:

```sh
./sbx/run --reset claude ../my-project
./sbx/run claude ../my-project
```

Resetting removes that sandbox's agent login, sessions, installed packages, and other VM state. It does not remove the host workspace.

## Authentication

- Claude: use `/login`, or configure `sbx secret set anthropic` for an API key.
- Codex: follow SBX's host-side ChatGPT login, or configure an OpenAI secret.
- Pi: use `/login` inside Pi. API-key environment support can be added to the generated environment later.

The shared mixin copies skills into the standard Claude and Codex skill directories. On supported SBX versions these may be backed by Docker's shared skills store, so sandboxes sharing that store belong to the same skills trust boundary.

## Configuration status

`config/shared/AGENTS.md` is installed for all three harnesses when non-empty. Pi's settings and resources are installed directly. Claude and Codex settings are included in the generated kit as placeholders but are not applied by SBX because their user settings files are sandbox-managed. They can be wired later through agent-specific supported settings layers.

Kits and sandbox environment files are experimental Docker Sandboxes features and may need updates as SBX evolves.
