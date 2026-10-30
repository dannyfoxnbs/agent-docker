# Onboarding skills

Five Claude Code skills that help someone new to a codebase get productive. Each one produces visual HTML pages, and every claim on a page links to the code it describes. They work in any git repository: nothing in them is specific to one codebase.

| Skill | Ask for it | You get |
|---|---|---|
| `onboard` | `/onboard`, or "I'm new to this repo, give me the big picture" | A seven-page guide: start here, architecture, code map, tech stack, how code is written here (good and bad practice), how work gets done, glossary |
| `deep-dive` | `/deep-dive how does sharing work?`, or "walk me through X before I change it" | One page tracing a feature end to end: a sequence diagram, a code tour, data and state, failure paths, why it is like this, how to change it safely, a quiz |
| `learn-stack` | `/learn-stack angular`, or "I've never used GraphQL, teach me" | A syllabus built from what *this* repo actually uses, plus 10–15 minute lessons with predict-first exercises, quizzes, a bridge from tech you know, a cheat sheet, and spaced review across sessions |
| `how-we-change-things` | `/how-we-change-things`, or "show me how a typical feature gets built here" | 3–5 real merged PRs taken apart layer by layer in dependency order, with their tests and review feedback, plus a page on the usual path a change takes |
| `ask` | `/ask how does the API know who is calling?` (typed only, so it never fires on everyday questions) | A short cited answer in chat, saved to a questions page; asking again finds the earlier answer and flags it when the code has moved on |

All five write into one local site at `<repo>/.onboarding/`. Open `index.html` to see the hub. The folder is added to `.git/info/exclude`, so it never shows up in `git status`.

## Install

The folders must sit side by side: the other skills use the kit inside `onboard`.

- **From work-skills:** run `scripts/sync-skills.sh [repo …]`. It links every skill into each target repo's `.claude/skills/`.
- **Anywhere else:** copy or symlink `onboard/`, `deep-dive/`, `learn-stack/`, `how-we-change-things/` and `ask/` into `~/.claude/skills/` (every repo) or into a repo's `.claude/skills/` (that repo).

Requirements: `git`, `python3` (standard library only) and a browser. Pages load fonts, Mermaid and highlight.js from CDNs, so they need internet access.

## Using the pages

- **Code links** open in VS Code. They are WSL-aware: a link opens the file through VS Code's WSL connection. You can also open them on the repo's web host instead (GitHub, GitLab, Azure DevOps or Bitbucket), at the commit the page was written from; toggle this in the top bar. Set `ONBOARDING_EDITOR=cursor` before `init` to open links in Cursor.
- **Quizzes and self-checks** have a "Copy for Claude" button. Paste the result into the chat and Claude will pick up from there.
- **Each page shows a verification strip** saying when its references were last checked against the code.
- **After pulling**, run `python3 onboard/scripts/onboarding.py check`. It flags pages whose cited lines no longer match the code. Running `/onboard` again rebuilds only the stale pages.
- **To share a guide**, copy `.onboarding/` anywhere; the pages are static. Committing it to a `docs/` folder is a team decision, because generated docs go stale unless someone re-runs `check`.

## How it works

**The kit (`onboard/`)**
- `PAGES.md` is the page contract every skill writes to: the evidence rules, components, diagram rules and writing style.
- `templates/page.html` is the page skeleton.
- `assets/` holds the CSS and JS. Agents write content only; the kit supplies navigation, light and dark themes, code links, syntax highlighting with real line numbers, Mermaid diagrams, quizzes, tabs and the self-check widget.
- `scripts/onboarding.py` does seven jobs:
  - `init` creates the workspace;
  - `recon` builds a deterministic fact sheet: projects, dependencies, import aliases, CI stages, test layout, entry points, most-imported files, git hot spots and who works where, debt markers;
  - `check` validates pages;
  - `hub` rebuilds the index and navigation;
  - `open` opens a page in the browser;
  - `changes` lists merged changes that span several areas, smallest first, from first-parent history;
  - `faq` renders the questions page from `notes/faq.md` and flags answers whose cited files changed.

**What `check` enforces**
- every cited file and line range exists, on disk or at the commit a citation is pinned to;
- the cited lines contain the symbol the link names;
- every code excerpt matches the source verbatim (gaps may be marked `// …`);
- internal links resolve;
- Mermaid has none of the syntax mistakes that break rendering;
- cited files haven't changed since the page's commit.

### Design choices and where they come from

- **Evidence over inference.** Every claim cites `file:line` and excerpts are verbatim, with inferences badged. This counters the failure modes reported for DeepWiki-style generators: architecture guessed from file names, simplified code, hand-wavy diagrams. Rules adapted from gitdiagram, docs-sync-audit, legacy-analyst and visual-explainer.
- **Tools first, model second.** Recon, the workspace's own dependency graph and git history set the skeleton. Fan-in ranking picks out the modules that matter (from Understand-Anything and code-maat).
- **An independent fact-check pass.** A subagent that didn't write a page audits its diagram edges, counts and absolute claims.
- **Matklad's ARCHITECTURE.md order, and C4 context and container views**, for the architecture page. Diagrams keep to at most 12 nodes, every arrow carries a verb, and inferred edges are dashed.
- **"Direction of travel".** The patterns page compares old and new approaches by counting them in recently touched files, so a newcomer copies the current way.
- **Learning science in `learn-stack`.**
  - predict before you explain (PRIMM);
  - worked examples with labelled steps, faded for experienced developers (expertise reversal);
  - bridge tables that call out false friends from the learner's known stack;
  - Leitner-box spaced review;
  - exercise turns that end at the question.

  It also builds on Anthropic's finding that developers who hand the work to AI learn least. The workspace and lesson shape adapt mattpocock's `teach` skill.
- **A prebuilt kit**, as codebase-to-course does. The model writes only content, so pages stay consistent and cheap to produce.

To restyle everything, edit the colour and font tokens at the top of `assets/onboarding.css`. `init` copies the kit's assets into a workspace each time it runs, so existing workspaces pick up the change.
