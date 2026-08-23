# Portable agent configuration

This directory contains configuration that is safe to share. Runtime state such as credentials, sessions, caches, and trust decisions belongs in each sandbox or Docker volume and must not be committed.

- `shared/AGENTS.md` — instructions shared by all harnesses.
- `nimbus/` — project instructions for the Nimbus workspace (`AGENTS.md`, its `CLAUDE.md` pointer, and the `nx/` workspace guide with domain terms). Kept here as a reference copy rather than wired in, so it applies only where you place it: copy it into that project, not into `shared/`.
- `claude/settings.json` — additional Claude Code settings.
- `codex/config.toml` — Codex defaults.
- `pi/settings.json` — Pi defaults and reproducible package sources.
- `pi/models.json` — portable custom models that resolve credentials from environment variables.
- `pi/extensions/`, `pi/prompts/`, `pi/themes/` — Pi resources.

The Pi setup includes the portable local extensions from Danny's `~/.pi/agent/extensions` and `pi-web-access`. Machine-specific local model endpoints, Herdr integration, the local agent-lint package, the WSL GUI diff-review package, authentication, trust decisions, sessions, caches, and installed package directories are intentionally excluded. Web search uses `auto-summary` so it does not try to open the host-only curator window from a container.

Replace or extend these files with portable configuration. Keep authentication files and secrets out of this directory.
