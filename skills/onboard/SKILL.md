---
name: onboard
description: Onboarding guide to a whole codebase — linked HTML pages on its architecture, stack, code map, patterns, workflows and glossary, every claim cited to the code. Use when someone is new to a repo and wants to get up to speed, or asks for onboarding docs or a codebase guide.
argument-hint: "[focus, audience, or pages to (re)build]"
---

# Onboard

Build the guide a newcomer reads in their first week. It covers what the system is, how it fits together, where things live, how work gets done and how code is written here. Pages follow the kit contract in [PAGES.md](PAGES.md): read it before anything else, because its **evidence** rules decide what a page may say. The pages themselves are specified in [GUIDE.md](GUIDE.md).

The kit lives in this skill's directory; `<kit>` below means that path. The deep-dive and learn-stack skills reuse it.

Tools find the structure; you explain it. Run the deterministic passes (recon, the workspace's dependency graph, git history) before forming any picture, and treat what they print as the skeleton the pages hang on.

## 1. Set up

Run `python3 <kit>/scripts/onboarding.py init` from inside the repository. Keep the workspace path, commit SHA and template path it prints.

If guide pages already exist, this is a **refresh**. Run `check`, and rebuild only the pages that have errors, stale citations or a spec the user asked to change. Then go to step 6.

Then run `recon` and read `notes/recon.md` in full.

## 2. Meet the reader

If `PROFILE.md` is missing, ask the reader in one message. If they are setting this up for someone else, ask about that person.
- their role, and the area or ticket they will start on;
- what they know well;
- what in this stack is new to them;
- whether they prefer diagrams, prose or code first.

Write their answers to `PROFILE.md` in the format PAGES.md gives. If they would rather not say, write a profile for "a developer new to this repo" and move on.

Done when `PROFILE.md` exists.

## 3. Survey

1. **Read the docs recon lists, agent instructions first.** They hold the conventions, gotchas and reasons that no config file confesses. Note where they disagree with the code as you go.
2. **Get the dependency graph from the workspace's own tooling** when it has some. Examples: `npx nx graph --file=<workspace>/notes/graph.json`, `dotnet list <proj> reference`, `go list -deps ./...`, `pnpm ls -r --depth 0`. Otherwise use the manifests, project references and import aliases in recon.
3. **Map the projects in parallel.** Split recon's projects into at most five groups, deployables first. Dispatch one Explore subagent per group to return a **project card** for each project (format in GUIDE.md). Each card must have evidence on every line and patterns sampled from at least three instances. Without subagents, write the cards yourself one group at a time.
4. **Merge the cards into `notes/facts.md`** (format in GUIDE.md). Fix the canonical names now, pick the 2–4 flows to trace, and record the direction of travel wherever old and new approaches coexist.

Done when `facts.md` holds a card for every project recon lists, and every line in it carries a citation or a command.

## 4. Plan

The guide is GUIDE.md's seven pages. Adjust emphasis to `PROFILE.md` and to any focus the user gave. Write only the pages the user asked for if they named some. Cut a page only when the repo gives it nothing, such as no CI config. Start-here then says what was cut.

## 5. Write

Dispatch one subagent per page, in parallel, each with the writer brief from GUIDE.md. When subagents are unavailable, write the pages yourself in order and re-read the page spec before each.

Done when every planned page exists, and each writer reports zero errors from `check` on its page.

## 6. Verify

1. Run `check` on the whole workspace and fix every error.
2. Fact-check with fresh eyes. Dispatch a subagent (or several, by page) that did not write the pages. It audits, against the cited code:
   - every diagram edge;
   - every count;
   - every "always", "never" or "only" claim;
   - at least ten other claims per page.

   It marks each claim **verified**, **corrected**, **unsupported** or **unverifiable**. A wrong edge or label counts as a wrong claim.
3. Act on the audit:
   - apply the corrections;
   - cut unsupported claims;
   - badge the unverifiable ones `inferred`;
   - re-run `check`.

Done when `check` reports zero errors and the audit has no open findings.

## 7. Hand over

Run `open` on the hub. In chat, give the reader:
- the hub's path;
- the three things to read first;
- the 2–3 deep dives and technologies to learn next, chosen from their profile;
- anything the guide could not verify, and who to ask about it.
