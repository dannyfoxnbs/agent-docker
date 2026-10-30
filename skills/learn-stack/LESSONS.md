# Lessons

What a lesson contains, the exercises that make it stick, and the progress file that carries the learner between sessions. Pages follow `../onboard/PAGES.md`.

## Lesson anatomy

In this order. The page should take 10–15 minutes and give one win the learner could state aloud.

1. **Head.**
   - eyebrow: "Lesson N · Tech";
   - title: the win, e.g. "Inject a service the way this repo does";
   - lede: the goal, and why it matters for the learner's first task;
   - meta: `onboarding:group` set to "Learn Tech".
2. **Warm-up.** 2–3 quiz questions from earlier lessons that are due for review. Skip this in lesson one.
3. **Predict.** A real excerpt, verbatim and cited, with a "what happens when…?" question. The answer sits behind a `details` element. The learner commits to an answer before the explanation.
4. **The idea.** At most three short paragraphs and one **runtime diagram**: what actually happens when the code runs. Examples: change detection, subscription lifetime, resolver execution order, DI scopes. Link the official docs page that is the reference for it.
5. **Bridge.** A `compare` block or table mapping the idea from the technology the learner knows. Include at least one **false friend**: something that looks the same but behaves differently. Every row links to code in this repo, because learners distrust analogies they can't run.
6. **Worked example.** One or two real excerpts walked through as labelled steps (`ol.steps` or `ol.tour`). Each step names its sub-goal ("1. Declare the dependency", "2. Provide it", …). For a learner the calibration showed to be expert, shorten this to the excerpt plus one line per step.
7. **Tutorials vs here.** A `callout ours` covering what the docs and tutorials do, what this repo does, and why (cite it, or badge it `inferred`).
8. **Practice.** Three exercises, each less guided than the last:
   - first, a guided find or trace with a hint;
   - second, a predict or modify;
   - third, something open: complete a `TODO(human)`, or explain a file in one sentence.

   Each ends with a `.prompt` the learner can paste to Claude for feedback.
9. **Quiz.** 3–5 questions testing application. Mix in a question on an easily confused concept from an earlier lesson.
10. **Recap.**
    - three bullets;
    - one primary source to read next, the best one you found;
    - a link to the next lesson, or to its row in the map (`0000-map.html#lessons`) until that lesson exists;
    - a reminder that Claude can answer follow-up questions.

    A short **Confidence and gaps** section follows the recap, as on every page.

## Exercise formats

Most useful first:

1. **Predict, then run.** The learner predicts output, emission order, rendered state or a resolver's result, then checks with a test or the running app.
2. **Trace.** The learner follows a real request or event hop by hop and names each file it passes through.
3. **Complete.** On a scratch branch, Claude builds something similar to existing code and leaves the framework-specific core as `TODO(human)` for the learner.
4. **Find the equivalent.** "Where does this repo do what `useEffect` did for you?"
5. **Spot the bug.** A plausible mistake in a real excerpt: a leaked subscription, the wrong flattening operator, an N+1 resolver, a short-lived dependency captured by a long-lived one.
6. **Modify and run.** The learner states a prediction first, then lets the tests give the feedback.
7. **Parsons.** The learner reorders shuffled lines of a real snippet. Mix in one or two wrong lines built from common misconceptions.
8. **Teach it back.** The learner explains a file or concept in one sentence.
9. **Make.** A small real ticket, followed by a debrief.

Every format except Complete, Modify and Make works without touching the repo; prefer those when the learner can't or won't change code. Exercises that change code happen on a scratch branch (`git switch -c learn/<tech>-<n>`) and are reverted afterwards. The learner's working tree stays as they left it.

When you run an exercise in chat, ask the question and stop. Wait for the answer before giving any hint. When the learner gets stuck, give hints in steps: first a pointer to the file, then the line, then the concept.

## Quiz rules

- Ask about using the idea, not about trivia.
- Make every option the same length and form, and vary where the correct one sits.
- Build distractors from real misconceptions: the false friends and the learner's evidence log.
- In `.explain`, say why each option is right or wrong.

## Bridge page

`reference/bridge.html` grows lesson by lesson. Its sections follow the shape of good "X for Y developers" guides:
1. what carries over unchanged;
2. side-by-side equivalents, as a table of Known tech | Tech | In this repo, where the last column is a cited file;
3. new ideas with no equivalent;
4. false friends;
5. what's missing, and how this repo copes.

## progress.md

```md
# Learning <Tech> in <repo>

## Mission
<the concrete goal, e.g. "ship tickets in the specification editor without pairing">

## Starting point
- Knows well: …
- <Tech> before this: never | some | rusty — calibration notes
- Prefers: …

## Syllabus
| # | Lesson | Win | Status |
|---|---|---|---|
| 1 | Services and DI | inject a service like this repo does | done 2026-10-27 |
| 2 | … | … | next |

## Self-check
- 2026-10-27 map: know — component composition; fuzzy — TypeScript basics; new — everything else (self-reported, steers the order, not evidence)

## Inventory
| Feature | Count | Command | Exemplar |
|---|---|---|---|
| `inject()` | 216 files | `git grep -l 'inject(' -- '*.ts' \| wc -l` | path/to/file.ts |

## Evidence
- 2026-10-27 L1: traced a provider from component to module unaided. Misconception: providers are always app-wide → corrected with an example of a component-level provider (cited)

## Review queue
| due | box | question | answer at |
|---|---|---|---|
| 2026-10-28 | 1 | Where does a component-level provider get its instance? | 0001-services-and-di.html#scopes |
```

The review queue uses Leitner boxes, which come due after 1, 3, 7 and 21 days. A correct answer moves a question up one box, a partly right one keeps it in the same box (and is due again at that box's interval), and a wrong one sends it back to box 1. Ask the due questions at the start of each session.
