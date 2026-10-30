---
name: how-we-change-things
description: Worked examples of how changes are made in a codebase — real merged PRs taken apart layer by layer, in order, with their tests and review feedback, as visual HTML pages plus the usual path a change takes. Use when someone new asks how a typical change or feature gets built here, or wants to learn from past PRs.
argument-hint: "[PR ids, ticket ids or an area]"
---

# How we change things

Teach how work moves through this codebase by taking real merged changes apart as **worked examples**. For each change, show which layers it touched, in what order, which tests came with it and what review pushed back on. Then distil the **usual path** they share. Architecture pages show how the parts fit together. A worked change shows the route a feature takes through them.

The page kit lives in the sibling `onboard` skill: `<kit>` below is `../onboard` relative to this skill's directory. Read `<kit>/PAGES.md` before writing. Its **evidence** rules decide what a page may say. If `<kit>` is missing, tell the user this skill needs the onboard skill installed beside it.

## 1. Set up

Run `python3 <kit>/scripts/onboarding.py init` from inside the repository. Keep the workspace path and commit SHA it prints. Read `PROFILE.md` when it exists: the reader's first area decides which layers matter most.

List `changes/`. Changes that already have a page stay as they are. New ones join the set, and the overview gets updated.

## 2. Pick the changes

When the user named PRs, tickets or an area, find those changes with `git log --first-parent --grep '<id>' <default branch>`. Otherwise run `python3 <kit>/scripts/onboarding.py changes`. It lists merged changes that touched two or more areas, with their files, tests, areas and authors. Use `--days`, `--min-areas` and `--ref` to widen or narrow the list.

Pick 3–5 that each teach something different, such as a field added end to end, a feature behind a flag, a bug fix with its regression test, or a schema change with a migration. Prefer changes that:
- cross the layers the reader will work in;
- are small enough to read, under about 30 files;
- are recent, so the code still looks like this;
- came with tests.

Pass over dependency bumps, mass renames, generated code and reverts.

Show the shortlist in chat, one line each: the change, its PR or ticket, and what it teaches. Ask the user to confirm or swap, and stop until they answer.

Done when each chosen change has its full commit SHA and its first parent's full SHA.

## 3. Read each change

`M` is the change's commit on the default branch: the merge commit, or the squashed commit. `P` is its first parent.

1. `git diff --stat P M`, then the whole diff with `git diff P M`. For a merge, `git log --reverse --format='%h %ad %an %s' P..M^2` gives the order the author worked in. Read `git log -1 --format=%B M` too: hosts such as Azure DevOps put the PR description in the merge commit's message.
2. Give each changed file its layer (the area from `changes`) and its role: schema or migration, model, API contract, service or resolver, client query, UI, tests, config or feature flag, docs.
3. Work out the **dependency order**: which layer's change the next one relies on. That is the order to teach in. Note where the commit order differs.
4. For each test added or changed, note what behaviour it pins.
5. Read the review when a tool can reach it: `gh pr view <n> --comments`, an Azure DevOps or GitLab CLI, or a skill that reads PR threads. Resolved threads matter most. Keep substantive feedback (design, naming, missing tests, conventions) and drop approvals and bot noise. When no tool can reach the review, say so on the page.
6. Run `git diff M HEAD --stat -- <files>` to see what has changed in those files since, so the reader knows whether today's code still looks like this.

**Cite the code as the change left it.** Put `data-commit="<full SHA of M>"` on every citation and excerpt of the change. `check` then reads those lines from that commit. Cite the before state with `P`'s full SHA. A citation without `data-commit` means today's code.

Done when every changed file except lockfiles and generated files has a layer, a role and a place in the order.

## 4. Write a page per change

`changes/NN-<slug>.html`, numbered from `01`, from the template.

1. **The change.** The lede says what it did and what it teaches. Add stat tiles (files, layers, test files, days from first commit to merge) and a link to the PR or ticket when the web host has one.
2. **The path through the layers.** A `flowchart LR` of the layers in dependency order, with each arrow labelled with what the next layer relies on ("exposes field", "queries"). Use at most 8 nodes.
3. **Step by step.** An `ol.tour` with one stop per layer, in dependency order. Each stop covers:
   - what changed in this layer, and why the change needed it;
   - a pinned excerpt of the result, with `data-hl` on the added lines, or a `.compare` of before and after when the change rewrote existing code;
   - the convention it follows, linked to the guide page or glossary entry that names it.
4. **The tests that came with it**, and what each one pins.
5. **What review caught.** Leave this section out when no review was available.
6. **Doing this today.** The files to touch, in order, for a similar change, and what has changed in them since.
7. **Check yourself.** 2–3 quiz questions like "you need to add a similar field to X: which file changes first?"
8. **Confidence and gaps.**

## 5. Write the usual path

`changes/00-the-usual-path.html` compares the worked changes. Rewrite it whenever the set grows.

- A table with one row per change and the layers it touched, in order.
- The common path as `ol.steps`. Each step names the changes that show it, with a count ("4 of 5 changes add the GraphQL field before the client query").
- A `flowchart LR` of that path.
- The variations: what made a change skip a layer or add one.
- A link to each change's page.

Generalise only from what the changes share. A step shown by one change is a variation, not part of the path.

## 6. Verify and hand over

1. Run `check` on the pages and fix every error.
2. Give the pages to a fresh subagent that did not write them. It re-opens every claim about order, every count on the usual-path page, and every "always", "never" or "only". Correct, cut or badge `inferred` whatever fails, then re-run `check`.
3. Run `open` on the usual-path page. In chat, give the usual path in three lines and the paths of the pages.

Done when `check` reports zero errors and every claim about order and every count has been confirmed.
