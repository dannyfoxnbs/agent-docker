---
name: ask
description: Answer one question about this codebase in a few cited lines and save it to the onboarding questions page, where repeat questions find the earlier answer.
argument-hint: "<question>"
disable-model-invocation: true
---

# Ask

Answer one question about the codebase **briefly**, then save the answer to the shared questions page, so the next person who asks finds it waiting. A brief answer traces one path through a handful of files and fits on a phone screen. Anything bigger is a deep dive.

The page kit lives in the sibling `onboard` skill: `<kit>` below is `../onboard` relative to this skill's directory. Its `PAGES.md` **Evidence** section decides what an answer may say. Read it before answering. If `<kit>` is missing, tell the user this skill needs the onboard skill installed beside it.

## 1. Look for an earlier answer

1. Run `python3 <kit>/scripts/onboarding.py init` from inside the repository. Keep the workspace path and full commit SHA it prints.
2. Read `notes/faq.md` in the workspace if it exists. An entry that answers the same question in other words is a **repeat**:
   - Run `python3 <kit>/scripts/onboarding.py faq`. If it reports the entry as `drifted`, answer afresh (step 2) and replace the entry's answer and `commit`. Otherwise keep the saved answer.
   - Either way, add 1 to its `times`, then go to step 3.
3. Grep the headings of `guide/` and `deep-dives/`. When a page already covers the question, answer from it in two or three lines, re-checked against the code, and set `see:` to that page's section.

Done when you know whether this is a new question, a repeat, or one a page covers.

## 2. Answer

Trace just enough code to answer, by reading the code: names suggest; control flow decides.

- The first sentence is the answer. Up to three short paragraphs or bullets follow, with at most one excerpt of 5–15 lines.
- Cite every claim about the code as `[SymbolName](path/from/git/root.ts:42)`. The cited lines must contain the name.
- Badge anything resting on names, comments or a single file `[inferred]`, and say what would confirm it.
- Use the canonical names in `guide/07-glossary.html` and `notes/facts.md` when they exist.
- Questions the code can't settle, such as why a decision was made or who owns something, get what the code and `git log` show plus who to ask: the most active authors of the files involved.

When the answer needs more than about six hops, or a diagram to make sense, give the short answer and offer `/deep-dive` for the rest.

## 3. Save it

Append the entry to `notes/faq.md`, or update the repeat in place. A new file starts with `# Questions`.

````md
## How does the API know who is calling?
<!-- id: api-caller-identity · asked: 2026-10-29 · times: 1 · commit: <full SHA from init> · see: guide/02-architecture.html#auth -->

[authMiddleware](apps/api/src/auth/middleware.ts:42) reads the bearer token and puts the user on the request context. Resolvers read it from there; none of them parse the token again [inferred].

```ts apps/api/src/auth/middleware.ts:40-48
verbatim lines 40–48, gaps marked with a // … line
```
````

- The comment line holds `id` (kebab-case, unique), `asked` (first asked, ISO date), `times`, `commit` (the SHA the answer was checked at) and an optional `see` (a workspace-relative page and anchor).
- The page renders paragraphs, `- ` lists, `` `code` ``, `**bold**`, `[inferred]`, citations `[Name](path:line)`, page links `[text](guide/03-code-map.html#x)`, web links, and fenced excerpts whose info string carries the citation.

Then run `python3 <kit>/scripts/onboarding.py faq`. It renders `faq/faq.html` and checks it. Fix every error in `notes/faq.md`, because the page is generated, and run it again.

Done when `faq` reports zero errors.

## 4. Reply

In chat, give the answer as saved, then the path to `faq/faq.html#<id>`. When `times` reaches 3, or the answer ran into the six-hop limit, suggest `/deep-dive <topic>` in one line.
