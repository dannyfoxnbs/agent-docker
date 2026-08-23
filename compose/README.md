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

## Isolation

The selected workspace is a direct read-write bind mount. The agent can modify it. Other host paths are unavailable unless added as mounts, but this remains ordinary container isolation rather than SBX's per-agent microVM boundary. The container does not receive the host Docker socket.

The image runs as the existing non-root `node` user (UID 1000). On Linux hosts whose developer UID is not 1000, files created in the workspace may have unexpected ownership; that can be handled in a later refinement if needed.
