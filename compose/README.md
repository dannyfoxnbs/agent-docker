# Docker Compose variant

This variant builds one image containing Claude Code, Codex, and Pi. Skills are bind-mounted read-only. Portable configuration is bind-mounted read-write so changes made through a harness settings UI can be reviewed and kept in the repository. Repository changes are visible without rebuilding the image.

## Run

From the repository root:

```sh
./compose/run claude ../my-project
./compose/run codex ../my-project
./compose/run pi ../my-project
```

The workspace defaults to this repository when omitted. Agent packages use their latest releases at image-build time. Refresh them explicitly with a clean, pull-through rebuild:

```sh
./compose/run --build claude ../my-project
```

Normal launches reuse the existing image so startup remains fast.

You can also use Compose directly:

```sh
WORKSPACE="$(realpath ../my-project)" docker compose -f compose/compose.yaml run --rm claude
```

## Authentication

Each harness has a named state volume, so an interactive login survives replacement of the short-lived agent container.

- Claude: use `/login`. In a container, copy the displayed URL into the host browser and paste the returned code when prompted. `ANTHROPIC_API_KEY` and `CLAUDE_CODE_OAUTH_TOKEN` are passed through when set on the host.
- Codex: follow its ChatGPT/API-key login prompt. Browser callback flows can be less convenient in plain Compose than in SBX. Credentials use file storage under the persistent Codex volume.
- Pi: use `/login`. `ANTHROPIC_API_KEY` and `OPENAI_API_KEY` are passed through when set on the host.

Never add credentials to `compose.yaml`, the image, or `config/`. Harness settings can write through to `config/`, so review those changes before committing them.

## Azure DevOps skills

`AZURE_DEVOPS_EXT_PAT`, `ADO_ORG`, and `ADO_PROJECT` are passed through from the host or `.env`, which is all the `*-azure-devops-*` skills need — they use the REST API through the Python standard library. `ADO_PAT_FILE` is not passed, because a host path is not a container path.

The PR skills shell out to `git`, so launch with the PR's clone as the workspace.

The `az` CLI is not in the image by default; it adds roughly 900MB and no skill calls it. Build it in, with its `azure-devops` extension, when you want it for ad-hoc shell work:

```sh
INSTALL_AZURE_CLI=true ./compose/run --build claude ~/repos/my-ado-project
```

The flag is a build argument, so it applies on a `--build` run and persists in the image until the next rebuild without it.

## Per-edit lint rules

[`agent-eslint-rules/`](../agent-eslint-rules/) is bind-mounted read-only at `/opt/agent-eslint-rules` and checks the lines an agent just changed, before it moves on.

- **Claude** runs it as a `PostToolUse` hook on `Edit|Write|MultiEdit|NotebookEdit`. Violations come back as a `block` decision naming the rule and line; clean edits are silent.
- **Pi** loads it as a package, added to the container's `packages` list next to `/opt/diff-review`, and its `tool_result` extension returns violations as a tool error.
- **Codex** has no per-edit hook mechanism, so it is not wired in.

The rules need `eslint` and `typescript-eslint` resolvable from the mounted project, because upstream deliberately has no dependency of its own. A project that has not run its install step yet produces one labelled `agent-lint: not checked - lint tooling failure` warning per edit and nothing is blocked. The same fail-open path covers a missing mount, so a tooling problem is never presented as a code violation.

Only `.ts`, `.tsx`, `.js`, and `.jsx` files are checked, and only lines that differ from `HEAD`. Thresholds are constants in `agent-eslint-rules/eslint.config.agent.mjs`; edit them there, or point `AGENT_ESLINT_RULES` at a different clone. Changes apply on the next container start, with no rebuild.

## MCP servers

No MCP servers are configured. Drop a `config/claude/mcp.json` in the usual `{"mcpServers": {...}}` shape and the entrypoint passes it to Claude as `--mcp-config`, alongside the existing `--settings`. No file, no flag.

Prefer declaring a remote endpoint here over installing a plugin that carries one: the container has no SSH key, so a marketplace cloned over `git@github.com:` cannot be fetched from inside it. Servers needing a login are authenticated once per state volume with `/mcp`; credentials stay in the `claude-state` volume, never in `config/`.

## Isolation

The selected workspace is a direct read-write bind mount. The agent can modify it. Other host paths are unavailable unless added as mounts, but this remains ordinary container isolation rather than SBX's per-agent microVM boundary. The container does not receive the host Docker socket.

The image runs as the existing non-root `node` user (UID 1000). On Linux hosts whose developer UID is not 1000, files created in the workspace may have unexpected ownership; that can be handled in a later refinement if needed.
