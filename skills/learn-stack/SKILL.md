---
name: learn-stack
description: Learn a technology this codebase uses — Angular, GraphQL, TypeScript, RxJS, NestJS, .NET or any other — through short lessons built from the repo's own code, with exercises, quizzes and progress kept across sessions. Use when someone wants to learn or be taught a framework or language this repo uses, or asks for their next lesson.
argument-hint: "<technology> [focus]"
---

# Learn the stack

Teach one technology the way *this* repo uses it: the subset the code actually uses, the local dialect, and the traps waiting for someone who arrives from what the learner already knows. The codebase is the textbook. The official docs are the reference.

**The learner does the thinking.** Developers who hand the work to an AI learn least. Those who predict, trace and ask why learn most. So ask before you tell. Have the learner predict before you explain. End every exercise turn at the question, with no hints and no sample answer.

The page kit lives in the sibling `onboard` skill: `<kit>` below is `../onboard` relative to this skill's directory. Read `<kit>/PAGES.md` before writing any page. Its **evidence** rules apply to lessons too. If `<kit>` is missing, tell the user this skill needs the onboard skill installed beside it. Lesson anatomy, exercise formats and the progress file format are in [LESSONS.md](LESSONS.md).

## Workspace

Everything for one technology lives in `learn/<tech>/` inside the onboarding workspace. `<tech>` is a lowercase slug such as `angular`, `graphql` or `rxjs`.

```text
learn/<tech>/
  progress.md          mission, starting point, syllabus, evidence, review queue
  0000-map.html        the syllabus as a page: concept map, self-check, lesson list
  0001-<slug>.html …   one lesson each
  reference/           cheatsheet.html and bridge.html, grown lesson by lesson
```

Every page sets `<meta name="onboarding:group" content="Learn <Tech>">`.

## Every session starts here

1. Run `python3 <kit>/scripts/onboarding.py init` from inside the repository. Keep the workspace path and commit SHA.
2. If `learn/<tech>/progress.md` exists, read it. Then ask the review questions that are due, one per turn, and grade them. Then go to **Next lesson**, or to **Debrief** if the learner arrived with answers.
3. If it does not exist, continue with **First session**.

## First session

1. **Calibrate.** Read `PROFILE.md` if it exists, then ask only what it doesn't answer:
   - what they know well, especially any adjacent technology;
   - how much of `<tech>` they have used: never, some, or rusty;
   - what they will build first.

   Then give two "what's your first step?" probes on real code from the repo, and record the answers under Starting point. Expertise is measured in `<tech>` itself: a senior React developer is still a novice in Angular. Learners the probes show to be fluent get shortened worked examples.
2. **Inventory what the repo uses.** For each feature of `<tech>`, count its uses with a command and note an exemplar file. Take the version from the manifest. Find the local dialect:
   - wrappers, base classes and helpers;
   - conventions in the agent docs and lint config;
   - older patterns still present, compared with what new code does (the direction of travel).

   Features the repo never uses stay out of the syllabus. Name them once so the learner knows what they can skip. Record the counts and their commands under Inventory in `progress.md`, and show them on the map.
3. **Plan the syllabus.** 6–12 lessons. Order them by prerequisite first, then by how often the repo uses the feature times its relevance to the learner's goal. Each lesson is one concrete win the learner can state.
4. **Write `progress.md`** in the format from LESSONS.md.
5. **Write `0000-map.html`.** It holds:
   - a concept map diagram of the syllabus;
   - a `selfcheck` list of every concept, so the learner can mark what they already know and paste the result back;
   - the lesson table.
6. **Write `reference/bridge.html`**, the table from the technology they know to `<tech>` to the file in this repo (format in LESSONS.md).
7. Run `check` until it reports zero errors, then `open` the map. In chat, ask the learner to mark the self-check. Stop there.

Done when `progress.md` holds the mission, starting point and syllabus, and the map and bridge pages pass `check`.

## Next lesson

1. Pick the next lesson. Use the syllabus order, adjusted by the evidence log and the latest self-check. Reteach anything the review queue shows is shaky.
2. Write `NNNN-<slug>.html` following the anatomy in LESSONS.md. It should take 10–15 minutes and give one win.
3. Add the lesson's distilled syntax and patterns to `reference/cheatsheet.html`. Add any new bridge rows to `reference/bridge.html`. Link the lesson from the map's lesson table.
4. Run `check` until it reports zero errors, then `open` the lesson.
5. In chat, write one line on what this lesson unlocks, then ask the first exercise question and stop.

## Debrief

When the learner answers, or pastes quiz or self-check results (this happens within the same session; there's no need to re-run `init`):
- give specific feedback;
- correct any misconception with a citation to the repo or the docs;
- ask one follow-up question when the answer was shaky.

Then update `progress.md`:
- **Evidence:** what they showed they can do, and any misconception that got corrected. Record only demonstrated learning. Covering a topic is not learning it.
- **Review queue:** add 2–3 questions from this lesson and move answered ones between boxes.
- **Syllabus:** set the lesson's status, and reorder what's ahead if the evidence says so.

Done when `progress.md` reflects this session and the next lesson is clear. If the learner pasted the map's self-check, continue straight into **Next lesson**.
