---
name: deep-dive
description: Deep dive into one part of a codebase — trace a feature, flow or module end to end and explain it as a visual HTML page with sequence diagrams, a code tour, gotchas and how to change it safely, every claim cited to the code. Use when someone asks for a deep dive, or for a visual walkthrough of how a feature or flow works before they change it.
argument-hint: "<feature, flow, module or question>"
---

# Deep dive

Answer one question about the codebase, "how does X work?", by **tracing** the code end to end. Publish the answer as one page in the onboarding workspace.

The page kit lives in the sibling `onboard` skill: `<kit>` below is `../onboard` relative to this skill's directory. Read `<kit>/PAGES.md` before writing. Its **evidence** rules decide what the page may say. If `<kit>` is missing, tell the user the deep-dive skill needs the onboard skill installed beside it.

## 1. Set up

Run `python3 <kit>/scripts/onboarding.py init` from inside the repository. Keep the workspace path and commit SHA it prints. Read `PROFILE.md` when it exists and tailor depth and analogies to it.

List `deep-dives/`. If a page already covers this question, run `check` on it and refresh it instead of writing a second one.

## 2. Pin the question

Turn the request into one question with a **trigger** and an **outcome**. Example: "from clicking Share on a project to the invitation email being sent". The trigger is a user action, request, scheduled job or event. The outcome is a state change, a response or a side effect. Name whose experience it is. When the request names no actor, or names one the code doesn't support, pick the most likely actor and state that choice in the lede.

When several features match the request, ask one question listing the candidates you found, with where each lives.

Done when the question names its trigger and outcome.

## 3. Find the way in

Search before reading deeply:
- the text a user sees, grepped for its visible label;
- routes and URLs;
- API operations;
- domain terms, using the glossary in `guide/` when it exists;
- tests and feature files, which state intended behaviour in plain words;
- history: `git log --oneline -S '<symbol>'` and `git log --grep '<term>'`.

List the candidate entry points with file:line before following any of them.

## 4. Trace

Follow the flow hop by hop by reading the code. Names suggest; control flow decides. At each hop, record a **stop**:
- file:line;
- what happens there;
- the data that goes in and out;
- the branches and failure paths.

Edges hide in DI registration, routing tables, decorators, config, event and queue subscriptions, and generated clients: look there when a call seems to go nowhere. Read the tests that pin this behaviour.

Then read the history of the key files with `git log --format='%h %ad %an %s' --date=short -- <path>`. It tells you why the code is shaped this way, what changed recently and who knows it.

For a flow longer than about 12 stops, split it. Trace the main path here, and list the side branches as candidates for their own deep dives.

Done when every hop from trigger to outcome has a stop with a citation, and every branch you skipped is listed as skipped.

## 5. Write the page

`deep-dives/<slug>.html`, from the template.

Canonical names come from `guide/07-glossary.html` and `notes/facts.md` when they exist. Otherwise define terms on the page. For "who to ask", read `notes/recon.md`, and run `recon` first if it's missing.

Sections 1–3, 7 and 9 are always present. Include 4–6 only when they add something the tour doesn't already say. Section headings may keep the names below; the headings inside them should state claims.

1. **The answer.** The lede, three TL;DR bullets and one sequence diagram of the main path with at most 8 participants.
2. **The cast.** A table of every file and module involved: role, file, layer.
3. **Code tour.** 5–12 stops as an `ol.tour`. Each stop covers:
   - the situation;
   - the mechanism, as a verbatim excerpt;
   - the implication;
   - any gotcha.

   A focused ten-stop tour beats a scattered twenty-five.
4. **Data and state.** The shapes that flow through, and any lifecycle as a `stateDiagram-v2`. Include this only when shape or state drives the behaviour.
5. **Edge cases and failure paths.** What happens on bad input, missing permissions, timeouts or retries, each cited. Fold these into the tour's gotchas when there are only a few.
6. **Why it is like this.** Decisions and history with their evidence level.
7. **Changing it safely.**
   - where to make the common changes;
   - which tests cover the area and the command that runs them (cite the command; run it only if the user wants you to);
   - flags and config involved;
   - what else breaks if this changes.
8. **Check yourself.** 3–5 quiz questions that test application, such as "you need to add X: which files change?"
9. **Confidence and gaps.**

## 6. Verify and hand over

1. Run `check` on the page and fix every error.
2. Re-open each diagram edge's code and each "always", "never" or "only" claim, and confirm it. For a page over about eight stops, give this to a fresh subagent that did not write the page. Correct, cut or badge `inferred` whatever fails, then re-run `check`.
3. Run `open` on the page. In chat, give the answer in three lines, the page's path and one deep dive worth doing next.

Done when `check` reports zero errors and every diagram edge has been confirmed.
