7
The Strategic Phase
7.1 Lifecycle overview
One Epic, followed from an idea to the point where it becomes work a team can pick up: who acts, which agent produces what, which Gate applies, and what evidence it leaves behind.

It stops at commit, on purpose. Past that moment an Epic is no longer one thing. It is features, then tickets, and the story is per work item rather than per Epic — which is the shape section 5 is written in. Following it here as well would give a reader two places to look and us two places to keep in step.

The section tests itself: any step that cannot be described concretely is a step nobody has actually agreed.

7.2 Opportunity identification
There is no single front door. Work reaches the Epic Agent Suite by four routes, and they are not equally formal:

Route in	How defined it is
An approved Idea in Aha!	A defined process, and it lives in Aha! rather than in this document
A Product Manager's judgement	Not a process. A person decides something is worth doing
A leadership request	Recognised only later, inside the prioritisation score, where the directive factor carries 25 points of 100
An evidence-led theme search	A scan for a pattern worth acting on, usually starting from analytics
A consequence worth knowing before it surprises you. The governance sits at the back. Scope, validate, prioritise and commit are all gated. Entry is not. So the prioritisation formula can score a leadership request low; it cannot decline one, and there is no earlier moment at which anyone does.

7.3 Discovery and validation
What the Epic Agent Suite reads when it scopes
Whichever route the work arrived by, the scoping run reads the same four things:

PostHog analytics — the long tail outside the core signals: adoption, engagement, conversion
Product Manager input, including answers to questions the agent seeded on a previous pass
The Breeze knowledge graph — functional documentation, codebase knowledge, product context
Anything already on the record from an earlier scoping round
It comes back with an Epic carrying background, problem, source, goals, audience, strategic alignment, quantified impact, and how success will be measured. You interview it rather than face a blank page.

Validating what it drafted
Validation checks each claim in the Epic against the product's registered evidence sources, and marks what it cannot support. A claim nobody can evidence is flagged, not deleted — the point is that you see it before commit, not that the agent quietly tidies it away.

7.4 The Epic lifecycle
The Strategic phase runs as a sequence of commands, each backed by the same four-part team. Typing the command is the consent. Most commands show you the draft and wait; a few write straight to the record, which is why you start them deliberately rather than by moving a ticket. There is one strict moment in each lane — commit, the handoff out of Strategy — where the checks are enforced.

The four parts behind every command

Part	Job	Can it write?
Orchestrator	Runs the sequence, talks to you, holds write authority	Yes, the only one
Auditor	Reads the Epic, reports what is missing, vague or inconsistent	Read only
Drafter	Writes suggested text. Sees only what it is handed, so it cannot invent facts from elsewhere	Read only
Writer	Assembles the final text exactly as approved. Refuses incomplete input rather than guessing	Via the Orchestrator
The critical path

There is no menu here. For an idea heading to a developer, the order is always the seven steps below, and only three moments need your judgement. Everything else is machinery.

Step	Command	What happens	Are you needed?
1	/agent-create-epic	The thought becomes an Epic. Skeleton minted, gaps interviewed live, every suggestion labelled grounded or a guess	Interview
2	/agent-scope-epic <E> --deep	Grows it to commit-ready. Do not skip --deep — it pulls Breeze evidence, so the breakdown matches the system that exists rather than the one the Epic imagines	Interview
3	/agent-featurize <E>	Proposes how the Epic breaks down into Features, as a table in the Epic body, with the reasoning as a comment	No
—	Judgement 1	Is this breakdown right? Edit the rows in Aha!, or re-run	You
4	/agent-featurize <E> --build <size>	The fan-out. Rows at or below the size ceiling become real Features: tiny ones finished and left pending review, bigger ones seeded with the commit checklist as a worksheet. Blocked rows get dependency links. --dry-run prints the plan first	No
5	/agent-epic-commit <E>	The gate. Everything audited hard, every open question closed, then status moves to Ready for Spec Sprint	Interview
6	Finish the Features	The pending tiny ones: review, then /agent-feature-oneshot --land <E>, one gate for the lot. The seeded bigger ones: answer the worksheet in Aha!, then /agent-feature-commit <ref> --harvest each	You, at your own pace
—	Judgements 2 and 3	Are the finished Features right, and what are the answers to the worksheet questions? The harvest saves every answered question even when others are blank	You
7	/agent-feature-rank epic <E>	The build order, from dependency links and fixed tiebreaks. Ready to develop	No
Why featurize comes before commit. The Epic gate now requires a breakdown block and at least one child Feature, so steps 3 and 4 are what make step 5 pass. Decomposition is a precondition of committing the Epic, not a Spec Sprint activity. A team that plans to break the Epic down later will find the commit door refuses.

One child satisfies the gate, which is thinner than it sounds. A twelve-row breakdown with one Feature minted passes upstream. Nothing above the feature lane checks the other eleven, so the un-minted tail is a real risk and it is reported rather than blocked — /agent-scope-feature epic <ref> and /agent-feature-rank both name it.

Sizing is not in this lane. The Feasibility and Effort Estimation agent owns the T-shirt estimate, and it re-runs automatically after a successful commit. On an Epic the size is deliberately not an auditable field; on a Feature it is, because sizing feeds the build order.

Where your time goes. Steps 1, 2 and 5 want you present. Steps 3, 4 and 7 run without you. Step 6 is reading and answering at your own pace, with the questions already framed and the answers already drafted.

Compressing it. If the create-epic interview covered everything, skip step 2; /agent-epic-commit <E> --gaps tells you whether you got away with it. --build large builds every row in one run when the breakdown is sound.

Off the critical path, and real

These exist and matter. They are simply not part of the default route, so a team learning the lane should not start with them.

Command	When you reach for it
/agent-validate-epic <E>	Before investing further in an Epic, and always before committing one carrying a not yet validated source marker. It extracts the Epic's testable claims and checks each against Crux, then the context documents, then live analytics on --deep. Every claim comes back as supporting evidence, contradicting evidence, or nothing either way — so why are we doing this, and how will you prove it. It never declares a verdict. This is the one door that can tell you something you did not already know, and the silent claims are usually the most valuable
/agent-epic-prioritise <E>	To score one Epic. Four factors graded 0 to 4 against written anchors, then a fixed formula. Value 15, urgency 30, enablement 30, directive 25, giving 0 to 100. The four are defined under this table. Bands: P1 ≥ 70 do next, P2 50–69 schedule, P3 30–49 backlog, P4 ≤ 29 icebox. A script computes it, never the model, so anyone can redo it by hand. P0 is not reachable by arithmetic — it comes only from a human break-glass or from dependency inheritance
/agent-epic-rank <release>	When a release needs putting in order. Read-only by default; the table is the deliverable
/agent-update-epic <E> <the change>	To put a conclusion on the record while it is still sharp. Narrow audit of what you are touching, a reason per auditable field
/agent-refresh-handover	Only when the Tech Handover block and the body beneath it have drifted apart. You must state which side is correct; there is no default
An honest note on the score. Value cannot reach its top level without external validation, so an Epic that has never been stress-tested scores lower and should. Effort is deliberately excluded from the score. Confidence is reported as a letter and displayed rather than multiplied, so a low-confidence P1 is still a P1, with homework.

Two things to copy into every phase. The seed → answer → harvest pattern, because it is how a sign-off happens across four time zones without a meeting. And the no evidence either way question, because it is the most valuable of the three and the one no checklist will ever raise on its own.

What the four factors grade. The weights are meaningless without them, and a reader who cannot say what a score of 62 is made of cannot challenge it.

Factor	Weight	Grades
Value	15	What the epic is worth to the business if it ships
Urgency	30	How much worse the outcome gets by waiting
Enablement	30	How much other work this unblocks
Directive	25	Whether leadership or regulation asked for it
Read that weighting before you inherit it. Value is the lightest factor and directive the third heaviest, so an epic scores more for having been asked for than for being worth doing. That may be right for the product these weights were set for; it is a deliberate choice either way, and 7.4's earlier note applies — the formula can score a leadership request low, but nothing declines one, because entry to the funnel is ungated.

The weights are per product, not per company. They live in the product pack's prioritisation-policy.yaml, together with the 0-to-4 anchors that say what each grade means. A team that adopts a pack without tuning them is ranking its backlog by another product's priorities. Tuning them is a named configuration task at 13.2, and changing them is a version bump rather than an edit, so the next run is an explicit re-score.

7.5 Spec Sprint and Development
Not missing. Handed over. An Epic stops being one thing at commit, and everything after it is told per work item in section 5. Here is where each part of it is.

What you are looking for	Where it is
What each agent needs before it runs, and what it leaves	5.7, all three phases, agent by agent
How information accumulates as a work item travels	5.6
What a work item must carry to leave a phase	5.3
The gates, and the four kinds	5.4
Section 5 is the workflow. Section 7 is one Epic followed the whole way through, which is what 7.4 does. Describing the same stages twice gives a reader two places to look and us two places to keep in step — and the second one always falls behind.

