# Install for Claude Code

One route in: clone this repository, paste the prompt below into Claude Code,
answer which project you want checked.

1. `git clone <this repo's url>` somewhere **outside** the project you want
   checked — the rules are never committed into it.
2. Open a Claude Code session in the clone.
3. Paste everything between the rules below.
4. Answer which project to wire up, and confirm the path it reads back to you.

The prompt resolves which project you mean, confirms it, then hands the work to
`scripts/install.mjs`. The script writes everything and proves it worked by
running the installed hook against a deliberate violation. If it cannot prove
that, it says so.

---

Wire agent-eslint-rules into one of my projects. `scripts/install.mjs` in this
repository does the entire install — your job is to work out which project I
mean, confirm it with me, run the script, and tell me what happened.

1. **Locate the installer.** It is `scripts/install.mjs` in the
   agent-eslint-rules clone. If your working directory is not that clone, ask me
   where the clone is before going further.

2. **Ask which project to wire up.** Resolve whatever I answer — a path, a
   repository name, "my monorepo" — to one directory. If it exists as given, use
   it. Otherwise search plausible locations for a close match, e.g.
   `find ~ -maxdepth 4 -type d -iname '*<name>*' -not -path '*/node_modules/*'`.
   Find nothing, or more than one candidate? Ask me instead of guessing.

3. **Confirm before anything is written.** Show me the resolved directory and its
   git top level (`git -C <dir> rev-parse --show-toplevel`), and ask me whether
   that is the project I meant. Wait for my answer. Change nothing until I
   confirm.

4. **Run the installer once**, on the confirmed path:
   `node <clone>/scripts/install.mjs <path>`. Show me its output verbatim. The
   script is the only thing that writes: do no part of the install yourself, and
   patch up nothing it leaves behind.

5. **Read its result back to me.** Its last line is a `=>` summary, and each
   `+` line is a change it made, each `!` a warning, each `x` a refusal.
   - Exit 0 — installed. Tell me what changed, from its own `+` lines, and that
     it all sits under `.claude/` in my project, git-ignored through
     `.git/info/exclude`, so none of it enters git. If the summary says checking
     could not be proven to work yet, give me the `!` lines saying why.
   - Exit 1 — it refused, or checking is not working. Give me every `x` and `!`
     line and stop; do not work around it. Point me at the Troubleshooting
     section of `INSTALL_PROMPT.md` in this clone.
   - Exit 2 — you called it wrong. Check `node scripts/install.mjs --help`.

6. **Finish with the restart note.** Claude Code reads hook settings when a
   session starts, so a session already open in that project will not run the
   hook until it restarts. Tell me to start a fresh Claude Code session there,
   and that `/hooks` will then list `agent-lint-changed-file.mjs` under
   PostToolUse.

Do not commit, do not stage, and do not edit a tracked file in my project.

---

## Troubleshooting

Everything here is the installer with a different flag. Run it from the clone;
`<project>` is any path inside the target project.

**Check an existing install.** `node scripts/install.mjs <project> --check`
changes nothing, reports whether the install is present and healthy, and runs
the hook to prove checking still works. Exit 0 healthy, 1 not.

**"does not resolve to an agent-eslint-rules clone", or "neither … nor … exists".**
The clone moved, was renamed, or was deleted. Re-run the installer from the
clone's current location — it repoints the link.

**"no ESLint is resolvable".** The target project supplies `eslint` and
`typescript-eslint`; this repository has no dependencies of its own. The install
is still complete and starts working once they are there: run the project's
install (e.g. `npm install`), then `--check` to confirm.

**".claude/settings.json is tracked by git".** The installer never modifies a
tracked file, so it refuses. Either untrack it —
`git -C <project> rm --cached .claude/settings.json` keeps the file on disk and
stages the removal for you to commit — and re-run, or copy the
`hooks.PostToolUse` entry from `claude-hook/settings.json` into it by hand.

**Symlinks unavailable.** The installer falls back on its own and says so. To
choose the fallback up front, add `--path-file`: it records the clone's absolute
path in `.claude/agent-eslint-rules.path` instead of linking. Moving the clone
then means re-running the installer.

**The hook never fires during real work.** `--check` passing while nothing is
blocked means the session predates the settings. Restart Claude Code in that
project and confirm the entry in `/hooks`.

**Remove it.** `node scripts/install.mjs <project> --uninstall` takes out what it
put in and leaves unrelated settings and hooks alone.
