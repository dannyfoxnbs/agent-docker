# Portable agent setup

The agent skills, configuration, and hooks I use day to day, shared so you can take the pieces you want.

A lot of my skills come from / inspired by Matt Pocock : https://github.com/mattpocock/skills

## What's here

- [`skills/`](skills/): Agent Skills such as TDD, Angular coding and testing, grilling, SonarCloud coverage, and a group of Azure DevOps skills for tickets and PRs. See [`skills/README.md`](skills/README.md).
- [`config/`](config/): harness configuration you can share safely. That covers instructions shared across harnesses, Claude Code settings, slash commands, the status line, and MCP servers, plus Pi extensions and Codex defaults. See [`config/README.md`](config/README.md).
- [`mcp/`](mcp/): the MCP servers I use (Chrome DevTools) and the `claude mcp add` command for each.
- [`config/claude/hooks/`](config/claude/hooks/): Claude Code hooks. They lint each edit, review diffs, notify you when you are away, and update the status line.
- [`agent-eslint-rules/`](agent-eslint-rules/): stricter lint rules that check only the lines an agent just wrote (no comments, short functions, few parameters, no magic numbers).
- [`compose/`](compose/) and [`sbx/`](sbx/): optional ways to run Claude Code, Codex, and Pi (plus omp under Compose) in Docker so they don't touch your host.

## Quick start: let Claude pick for you

Paste this into Claude Code (or any agent) in the project you want the skills in:

```text
Fetch the skills from https://github.com/dannyfoxnbs/agent-docker (clone it to
~/repos/agent-docker if it isn't there, otherwise git pull). Read skills/README.md
and each skills/*/SKILL.md description, then show me the list and ask which ones I
want. Also ask whether they should go in this project (.claude/skills) or
everywhere (~/.claude/skills). Symlink the ones I pick so they update with git
pull. Install the Azure DevOps skills as a whole group, never singly. Don't touch
my settings or anything outside the skills directory.
```

For the full setup (Docker, config, lint rules), paste [`PROMPT.md`](PROMPT.md) instead.

## Pick what you want

You don't need to copy the whole repository. Each skill, hook, and config file stands on its own, so take what is useful and leave the rest. Most people only want a few skills.

Symlink a skill to keep it updating with `git pull`, or copy it if you plan to edit your own version:

```sh
ln -s ~/repos/agent-docker/skills/tdd ~/.claude/skills/tdd               # every project
ln -s ~/repos/agent-docker/skills/tdd <project>/.claude/skills/tdd       # one project
```

[`skills/README.md`](skills/README.md) lists the skill directories for Pi and opencode. If you'd rather an agent do the setup, paste [`PROMPT.md`](PROMPT.md) into a session opened in this clone.

## My setup

What I run day to day, for context. None of it is required.

| Tool                                                          | Used for                                                             |
| ------------------------------------------------------------- | -------------------------------------------------------------------- |
| [WezTerm](https://wezterm.org)                                | Terminal                                                             |
| [Herdr](https://herdr.dev/)                                   | Terminal multiplexer for running several agent sessions side by side |
| [Neovim](https://neovim.io)                                   | Editor                                                               |
| [lazygit](https://github.com/jesseduffield/lazygit)           | Git TUI for reviewing and staging what agents change                 |
| [Claude Code](https://docs.anthropic.com/en/docs/claude-code) | Main coding agent                                                    |
| [Pi](https://pi.dev/)                                         | Second coding agent, for local models and GitHub Copilot models      |

All of this runs on Windows under WSL2.

## Azure DevOps skills

The `*-azure-devops-*` skills read and write Azure DevOps tickets and pull requests. They need:

- `python3` and `git`.
- A Personal Access Token in `AZURE_DEVOPS_EXT_PAT` or `~/.config/azure-devops/pat`.
- The [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli) with the `azure-devops` extension (`az extension add --name azure-devops`). Only `read-azure-devops-ticket` needs it. The rest call the REST API directly.

Install the whole group, because the review skill calls its siblings' scripts. [`skills/README.md`](skills/README.md#azure-devops-skills) covers PAT scopes, organisation settings, and how the skills chain together.

## Running agents in Docker (optional)

Both variants run Claude Code, Codex, and Pi without installing any of them on the host.

|                       | Docker Sandboxes (`sbx/`)                    | Docker Compose (`compose/`)                         |
| --------------------- | -------------------------------------------- | --------------------------------------------------- |
| Host requirement      | `sbx`, Docker login, hardware virtualisation | Docker Engine/Desktop with Compose                  |
| Isolation             | Separate microVM and kernel                  | Ordinary container isolation                        |
| Skills/config updates | Snapshot when a sandbox is created           | Live read-only bind mounts                          |
| Subscription login    | Best integration, especially Codex           | Works, but browser callbacks can be less convenient |
| Resource use          | Higher                                       | Lower                                               |

```sh
./sbx/run claude ../my-project       # or codex, pi
./compose/run claude ../my-project
./compose/run omp ../my-project     # Compose only; picks up local llama-server models
```

Both runners read `.env`, which `./compose/run` creates from [`env.example`](env.example) on first run:

| Variable                 | Effect                                                                  |
| ------------------------ | ----------------------------------------------------------------------- |
| `WORKSPACE`              | Project mounted at `/workspace` when no workspace argument is given     |
| `AGENT_ESLINT_RULES`     | Location of the lint rules clone, relative to `compose/`                |
| `AZURE_DEVOPS_EXT_PAT`   | PAT for the Azure DevOps skills                                         |
| `ADO_ORG`, `ADO_PROJECT` | Organisation and default project those skills target                    |
| `INSTALL_AZURE_CLI`      | Build the `az` CLI into the Compose image (about 900MB, off by default) |
| `LLAMA_CPP_BASE_URL`     | llama-server omp discovers models from (default: the host's port 8080)  |

A workspace given on the command line wins over `WORKSPACE`. `AGENT_ENV_FILE` points the runners at a different file. [`compose/README.md`](compose/README.md) and [`sbx/README.md`](sbx/README.md) cover authentication, the per-edit lint hook, MCP servers, and isolation.

Keep credentials, tokens, sessions, and machine-specific paths out of `config/`.
