# Portable agent setup

The agent skills, configuration, and hooks I use day to day, shared so you can take the pieces you want.

## What's here

- [`skills/`](skills/): Agent Skills such as TDD, Angular coding and testing, grilling, SonarCloud coverage, and a group of Azure DevOps skills for tickets and PRs. See [`skills/README.md`](skills/README.md).
- [`config/`](config/): harness configuration you can share safely. That covers instructions shared across harnesses, Claude Code settings, slash commands, the status line, and MCP servers, plus Pi extensions and Codex defaults. See [`config/README.md`](config/README.md).
- [`config/claude/hooks/`](config/claude/hooks/): Claude Code hooks. They lint each edit, review diffs, notify you when you are away, and update the status line.
- [`agent-eslint-rules/`](agent-eslint-rules/): stricter lint rules that check only the lines an agent just wrote (no comments, short functions, few parameters, no magic numbers).
- [`compose/`](compose/) and [`sbx/`](sbx/): optional ways to run Claude Code, Codex, and Pi in Docker so they don't touch your host.

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

| Tool | Used for |
|---|---|
| [WezTerm](https://wezterm.org) | Terminal |
| Herdr | Terminal multiplexer for running several agent sessions side by side |
| [Neovim](https://neovim.io) | Editor |
| [lazygit](https://github.com/jesseduffield/lazygit) | Git TUI for reviewing and staging what agents change |
| [Claude Code](https://docs.anthropic.com/en/docs/claude-code) | Main coding agent |
| Pi | Second coding agent, for local models and GitHub Copilot models |

All of this runs on Windows under WSL2.

## Chrome DevTools MCP

The [Chrome DevTools MCP](https://github.com/ChromeDevTools/chrome-devtools-mcp) lets an agent drive a real browser. It can click through the app, read the console and network requests, and take screenshots. I use it all the time to check frontend changes. You log in yourself, and the agent takes over from there.

On WSL it has to run on the Windows side. WSL can't reach a Windows Chrome debug port, and a headed Chromium inside WSL is unreliable. Run this from the project you want it in:

```sh
claude mcp add chrome-devtools -- cmd.exe /c npx -y -p node@22 -p chrome-devtools-mcp@latest \
  chrome-devtools-mcp --no-performance-crux --no-usage-statistics
```

`-p node@22` covers an older Windows Node, since the MCP needs Node 22. The two `--no-*` flags stop internal URLs from being sent to Google. On macOS or native Linux, drop the `cmd.exe /c` and the `node@22` package.

It isn't in [`config/claude/mcp.json`](config/claude/mcp.json) because that file feeds the containers, which have neither `cmd.exe` nor a browser.

## Azure DevOps skills

The `*-azure-devops-*` skills read and write Azure DevOps tickets and pull requests. They need:

- `python3` and `git`.
- A Personal Access Token in `AZURE_DEVOPS_EXT_PAT` or `~/.config/azure-devops/pat`.
- The [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli) with the `azure-devops` extension (`az extension add --name azure-devops`). Only `read-azure-devops-ticket` needs it. The rest call the REST API directly.

Install the whole group, because the review skill calls its siblings' scripts. [`skills/README.md`](skills/README.md#azure-devops-skills) covers PAT scopes, organisation settings, and how the skills chain together.

## Running agents in Docker (optional)

Both variants run Claude Code, Codex, and Pi without installing any of them on the host.

| | Docker Sandboxes (`sbx/`) | Docker Compose (`compose/`) |
|---|---|---|
| Host requirement | `sbx`, Docker login, hardware virtualisation | Docker Engine/Desktop with Compose |
| Isolation | Separate microVM and kernel | Ordinary container isolation |
| Skills/config updates | Snapshot when a sandbox is created | Live read-only bind mounts |
| Subscription login | Best integration, especially Codex | Works, but browser callbacks can be less convenient |
| Resource use | Higher | Lower |

```sh
./sbx/run claude ../my-project       # or codex, pi
./compose/run claude ../my-project
```

Both runners read `.env`, which `./compose/run` creates from [`env.example`](env.example) on first run:

| Variable | Effect |
|---|---|
| `WORKSPACE` | Project mounted at `/workspace` when no workspace argument is given |
| `AGENT_ESLINT_RULES` | Location of the lint rules clone, relative to `compose/` |
| `AZURE_DEVOPS_EXT_PAT` | PAT for the Azure DevOps skills |
| `ADO_ORG`, `ADO_PROJECT` | Organisation and default project those skills target |
| `INSTALL_AZURE_CLI` | Build the `az` CLI into the Compose image (about 900MB, off by default) |

A workspace given on the command line wins over `WORKSPACE`. `AGENT_ENV_FILE` points the runners at a different file. [`compose/README.md`](compose/README.md) and [`sbx/README.md`](sbx/README.md) cover authentication, the per-edit lint hook, MCP servers, and isolation.

Keep credentials, tokens, sessions, and machine-specific paths out of `config/`.
