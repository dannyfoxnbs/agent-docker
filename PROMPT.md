# Set this up for me

One route in: clone this repository, open an agent session in the clone, paste
the prompt below, and answer which way you want to use it.

There are three ways to use this repository, and the prompt works out which one
you mean before it changes anything:

| Route | What you get | Needs |
|---|---|---|
| **Docker Compose** | Claude, Codex, and Pi in one container, skills and config bind-mounted | Docker Engine/Desktop with Compose |
| **Docker Sandboxes** | The same agents in per-agent microVMs | `sbx`, Docker login, hardware virtualisation |
| **Your own harness** | The skills copied or linked into the harness already on your machine | Nothing extra |

The first two need no agent harness installed on the host. The third needs no
container runtime.

---

Set up this repository for me. It is a portable agent setup: agent skills, plus
harness configuration, plus two containerised ways to run agents. Work out which
route I want, confirm it, then do only that route.

1. **Read the repository first.** `README.md` is the map. `compose/README.md` and
   `sbx/README.md` cover the two containerised variants. `skills/README.md`
   covers the skills. Do not guess at behaviour these files describe — read them.
   If your working directory is not this repository, ask me where the clone is
   before going further.

2. **Ask which route I want**, using the table above: Compose, Docker Sandboxes,
   or copying skills into a harness already on my machine. If I have already said
   which, skip ahead. If I am unsure, ask what I have installed and recommend
   Compose when Docker is present.

3. **Check the prerequisites for that route before doing anything.** Report what
   is missing rather than working around it.
   - Compose: `docker compose version`
   - Sandboxes: `command -v sbx`, and see `sbx/README.md`
   - Own harness: which harness, and where it reads skills from

4. **Confirm paths before writing anything.** Show me the project directory you
   would mount or the skills directory you would write into, and wait for my
   answer. Change nothing outside this repository until I confirm.

5. **Do the route.**

   **Compose.** `./compose/run <claude|codex|pi> [workspace]`. The first run
   builds the image. Tell me a `.env` is optional — `WORKSPACE` and
   `AGENT_ESLINT_RULES` both default, and `env.example` documents every variable.
   Copy it with `cp env.example .env` only if I want defaults rather than passing
   a workspace each time.

   **Sandboxes.** `./sbx/run <claude|codex|pi> [workspace]`. Tell me that an
   existing sandbox keeps its creation-time snapshot of skills and config, so
   `./sbx/run --reset <agent> [workspace]` is how repository changes are applied.

   **Own harness.** Copy or symlink the directories under `skills/` into the
   skills directory my harness reads. This repository's own containers use
   `~/.claude/skills` and `~/.agents/skills`; verify the right location for my
   harness and version rather than assuming. Pi can instead install this whole
   repository as a package — `pi install /absolute/path/to/this/clone` — because
   it contains a conventional `skills/` directory. Prefer symlinks so my skills
   track the clone, and say which you used. Do not copy anything from `config/`
   into my host harness without asking: it would overwrite my real settings.

6. **Point out what needs a secret, without asking me for one.** The
   `*-azure-devops-*` skills read `AZURE_DEVOPS_EXT_PAT` from the environment and
   fail without it; `ADO_ORG` and `ADO_PROJECT` are optional overrides. Never
   write a token, PAT, OAuth credential, or session file into this repository or
   into `config/`.

7. **Mention the per-edit lint rules if I chose a containerised route.**
   `agent-eslint-rules/` checks the lines an agent just wrote, in Claude via a
   `PostToolUse` hook and in Pi as a loaded package. It resolves `eslint` and
   `typescript-eslint` from the mounted project, so a project that has not run
   its install step gets one `agent-lint: not checked` warning per edit and no
   checking. That is expected, not a fault. Codex has no per-edit hook mechanism
   and is not wired in.

8. **Finish by telling me what you actually did**, the exact command to start an
   agent, and how to authenticate: Claude and Pi use `/login`, Codex uses its
   ChatGPT or API-key prompt. Say plainly if a step failed or you skipped it.

Do not commit, do not stage, and do not edit files outside this repository
without confirming first.

---

## Troubleshooting

**The agent cannot see a skill.** Skills are bind-mounted in Compose, so they
appear on the next container start. In a sandbox they are a snapshot taken at
creation: `./sbx/run --reset <agent> [workspace]`, then run again.

**Every edit warns `agent-lint: not checked`.** The mounted project has no
`eslint` or `typescript-eslint` resolvable from its root. Run the project's own
install step. This fails open by design so a tooling problem is never reported as
a rule violation.

**Lint findings I disagree with.** Thresholds are constants in
`agent-eslint-rules/eslint.config.agent.mjs`. Edit them there, or point
`AGENT_ESLINT_RULES` at a different clone. Compose picks the change up on the
next container start.

**An Azure DevOps skill fails on authentication.** `AZURE_DEVOPS_EXT_PAT` is not
reaching the container. Set it in `.env` or export it on the host; Compose passes
it through. The PAT needs Work Items (Read) and Code (Read & Write) for the full
read/write/review chain.

**A workspace path is wrong.** A workspace argument always beats `WORKSPACE` in
`.env`. A relative `WORKSPACE` resolves against your current directory, not this
repository, so prefer an absolute path or `~`.
