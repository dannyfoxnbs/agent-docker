# Guide

The seven pages of the big-picture guide, plus the formats that carry facts between the survey and the page writers. Every page also follows [PAGES.md](PAGES.md).

## Project card

What a survey subagent returns for each project or deployable. Every line ends with a citation or the command that produced it. Missing knowledge goes under open questions; never pad a card to fill it.

```md
### <name> — <path>
- Purpose: one sentence (cite the README or entry point)
- Kind: deployable app | library | tool | tests; runtime (browser, node server, lambda, worker, CLI)
- Entry points: file:line for each way in (bootstrap, server start, handler, CLI main, deployment config)
- Key modules: dir — what it owns (cite a representative file)
- Depends on (internal): project — via import / DI / config (cite)
- Talks to (external): database, queue, third-party API — how (cite the client call)
- Patterns (≥ 3 instances each): name — count + command — exemplar file
- Tests: framework, location, naming, how to run one (cite config)
- Surprises: anything that differs from framework defaults or the docs (cite)
- Open questions: what you could not resolve, and who in recon's activity list might know
```

## Facts file

`notes/facts.md` is the single source every page writer reads. Merge the project cards into it:

```md
# Facts — <repo> @ <short sha>
## Canonical names    the one name for each system, project and domain concept; every page uses exactly these
## Projects           the cards, deployables first
## Flows to trace     the 2–4 operations that matter most to users, each with a trigger, an outcome and its entry point
## Patterns           name, count and command, exemplar, older variants still present
## Conventions        rules from agent docs, lint config and CI, each with its source
## Gotchas            each with evidence
## Why                decisions found in ADRs, PRs and commits: confirmed | inferred | unknown
## Open questions     and who to ask
```

## Writer brief

When a subagent writes a page, its prompt carries:
- the page's spec below;
- the absolute paths of PAGES.md, the template, `notes/facts.md`, `notes/recon.md` and PROFILE.md;
- the workspace path and commit SHA;
- the page filename.

The writer reads the code it cites; the facts file tells it where to look, not what to say. It finishes with `check` on its own page returning zero errors, and it reports what it cut or marked as inferred.

## The pages

Each spec lists what the page must answer. Section order is up to the writer. A section the repo gives nothing to is cut, and start-here says so.

### 01-start-here.html — Start here

What a newcomer needs on day one.

- **What this system is.** Three sentences on its purpose and users, from the docs, cited. Status flags if any part is deprecated, mid-migration or end-of-life.
- **Bird's-eye diagram.** At most 8 nodes: users → deployables → stores and external systems.
- **Key files.** A table with the columns Priority | File | What it does | When to read (day 1, week 1, when needed). Use at most 15 rows. Rank by fan-in, churn and the reader's first area.
- **Run it locally.** Prerequisites (runtime pins, services, secrets you must ask for) and the commands. Cite each one to a script, README or config. Steps you could not verify are marked inferred.
- **Reading path.** The rest of the guide in order, then 2–3 suggested `/deep-dive` topics and `/learn-stack` technologies chosen from PROFILE.md's gaps.
- **Who to ask.** Area → the people most active in it recently, from recon. Say they are recent contributors, not owners.
- **Self-check.** A `selfcheck` list of the 8–12 concepts the guide covers.

### 02-architecture.html — Architecture

How the system fits together and why. The section order follows matklad's ARCHITECTURE.md: bird's-eye view, then the map, then invariants, then boundaries, then cross-cutting concerns.

- **Context.** The system, its users and the external systems it depends on (C4 level 1).
- **Containers.** Deployables, stores and queues, with the protocol on each arrow (C4 level 2).
- **Internal dependencies.** From the workspace's own graph tool when there is one. Group projects when there are more than 12.
- **Key flows.** 2–4 sequence diagrams for the flows in the facts file. Each is traced through the code, and the hops are cited in the text beside it.
- **Invariants and boundaries.**
  - What always holds: auth checks, tenancy, transactions, idempotency.
  - What must never happen: "the UI never talks to the database".
  - Enforced module boundaries: lint rules, project tags, layering.
  - Cite where each one is enforced, or mark it as convention only.
- **Cross-cutting concerns.** One row each for auth, configuration, logging, errors, feature flags, caching, i18n and background jobs. Each row says where the concern lives and how to use it.
- **Why it is like this.** Decisions with their evidence level.

### 03-codebase-map.html — Code map

Where things live and where to make a change.

- **Annotated tree.** The top 2–3 levels, each with its purpose. Generated and vendored directories are marked as hands-off.
- **Project cards.** One card per project: purpose, entry point, depends on, tests, most active people.
- **Where do I change…?** 10–15 common tasks. Each gives where to change it and a real commit that did it, found with `git log --oneline -- <path>` or `git log -S`.
- **Handle with care.** Files that are both high-churn and high-fan-in, fragile areas and generated code. Each comes with its evidence: churn count, fan-in, debt markers.
- **Screens map.** Only for a frontend whose app is running and a browser tool is available. Ask the user for the URL; don't start servers yourself. Each entry runs screen → route → component → data source, with a screenshot.

### 04-stack.html — Tech stack

What the system is built with, and how it is used *here*.

- **Grouped by layer:** frontend, API, data, messaging, infrastructure, testing, build. Each technology gets:
  - its version from the manifest;
  - a one-line role here, citing a real usage;
  - its official docs link;
  - for anything PROFILE.md lists as new, a pointer to `/learn-stack <tech>`.
- **Unusual choices called out.** Internal or forked packages, pinned old majors, and the places where the repo departs from the framework's defaults: "Angular 19, but NgModule-based: tutorials will show standalone components".
- **Tooling kept apart from production.** Dev dependencies and the build chain go in their own group.

### 05-patterns.html — How code is written here

The good practices to copy and the bad ones to avoid. This is the page that most separates a guide from generic documentation.

- **Recurring patterns.** 6–10 of them. Each gets what it is, an exemplar file to copy, a count with its command, and the variants.
- **Do and avoid pairs.** Drawn from agent docs, lint rules, review conventions and the code itself. Each side is cited.
- **Direction of travel.** Where old and new approaches coexist, compare their counts across all files with their counts in files touched over the last six months (`git log --since=6.months --name-only`). Say which way new code goes, then say "write new code like X".
- **Testing.** Frameworks, where tests live, naming that decides which runner picks a file up, how to run one test, and fixture or mock conventions.
- **Errors, logging, configuration, feature flags.** The house way for each, cited.
- **Gotchas.** The traps a newcomer will hit, each with its evidence.

### 06-workflows.html — How work gets done

From ticket to production.

- **Dev loop.** As steps: set up → branch → code → test → lint → commit → PR → review → merge. Add a `gitGraph` diagram when the branch model is non-trivial.
- **CI/CD.** A pipeline diagram drawn from the pipeline files, showing stages, what blocks a merge and what deploys where.
- **Anatomy of a typical change.** Pick a representative recent merged change from git history. Show the files it touched, grouped by layer: "a feature usually touches these places".
- **Recipes.** 3–5 step lists for the most common tasks, such as adding a field end to end or a new endpoint. Each step is cited.
- **Conventions.** Branch names, commit and PR format, migrations, releases. Quote each from its source.

### 07-glossary.html — Glossary

The vocabulary. Every other page links here.

- **Domain terms** from the domain docs and the code's entity names. Each entry gives the definition, its name in code (class, table or type, cited) and the aliases to avoid.
- **Internal names.** Product and system names, acronyms, team jargon.
- **One `dt` per term**, with a stable `id="term-<slug>"`.
