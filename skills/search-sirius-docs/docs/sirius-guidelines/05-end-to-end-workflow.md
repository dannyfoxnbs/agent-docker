5
End-to-End Sirius Workflow
5.1 Workflow overview
WS1 · Lead Manager — agents and human gates, end to end
Seventeen workflow agents on the board. Fourteen Human Gates decide whether work moves on; each is held by a person, and each team decides which person. Three further agents support the
pipeline without sitting in it: Main Orchestrator, Agent Run Logger, Design Capture.
Agent generates
Human governs
Agents never move work past a Human Gate on their own.
Stage 1 · Strategy
What to build, and whether it is worth building
1a. Epic Suite Agent — Discovery, Create, Scope, Validate *
Synthesises inputs; creates, updates, scopes and validates the Epic
in Aha!
Human Gate — Epic scope and evidence confirmed
2. Feasibility & Effort Estimation Agent
Feasibility report and T-shirt size per Epic
Human Gate — Approach confirmed, or revision requested
1b. Epic Suite Agent — Prioritise and Commit *
Value-versus-effort scoring and ranked backlog; commits the Epic
Human Gate — Backlog approved; Spec Sprint starts
Stage 2 · Spec Sprint
Turn the committed Epic into buildable specifications
3. Spec Refiner Agent
Refines requirement clarity; tags New versus Update specs
Human Gate — Refined specs and tags reviewed
4. Impact Analysis Agent
Cross-dimensional analysis across the ontology graphs
Skip to step 7 where the work needs no design
5. Design Context Agent
Design brief and scope, linked to the Jira Story
Human Gate — Design brief confirmed
6. Design Creation Agent
Hi-fi design spec in Figma
Human Gate — Design breakdown reviewed
7. Task Context Agent
Task tree and breakdown, with context
Human Gate — Task breakdown reviewed
8. Task Creation Agent
Refined, executable sub-tasks per layer
9. Acceptance Test Agent
Test cases and test plan in Qase.io
Human Gate — Test plan reviewed and committed
OPTIONAL
Stage 3 · Implementation
Turn specifications into reviewed, tested, merged code
10. Sprint Planning Agent
Sprint scope, capacity and sequencing
Human Gate — Sprint plan approved
11. Architecture Implementation Agent
ADR, contracts and IaC
Human Gate — Architecture PR reviewed
12. Backend Implementation Agent
Service, controller and handler code; DB migrations, rollback, ORM
models
13. Frontend Implementation Agent
Components, tests, i18n
Human Gate — Implementation PRs reviewed
14. Code Reviewer Agent
Absorbs Merge Validation; reviews the diff
15. PR Validation Agent
Verifies the PR implements what impact analysis specified
Human Gate — Peer review approved; validation verdict
recorded
16. Pre-Merge Agent
Merges the PR and reindexes the code ontology in Breeze
Human Gate — Merge and ontology reindex confirmed
17. QA Agent
Playwright tests and execution results
Human Gate — Final QA sign-off
PARALLEL
PARALLEL
Where this stage does not apply
ETL and Harvester have no Product Manager, so Strategy did not run for them. A
tribe shaped that way enters at Spec Sprint with the Epic authored elsewhere,
and the named author takes the PM's accountabilities.
Beyond the agents — no agent coverage
Deploy to Demo
Regression Test
Deploy to Production
Measure
Human and CI/CD work today. GitHub Actions replaced the Deployment agent.
* 1a and 1b are the same Epic Suite Agent, split by the Feasibility dependency. · Dashed cards are provisioned but not yet in use. · Read each stage top to bottom; stages run left to right.
Read it as two kinds of thing. Coloured cards are agents, and they generate. Dark cards are Gates, and a person decides. The colour tells you which stage you are in; the shape tells you whether a machine or a person is acting. Nothing crosses a dark card without a person saying so.

The diagram does not name a role at any gate, and that is deliberate. A gate says a person decides here. Which person is your team's decision. Lead Manager happens to have a Product Manager, a UI/UX Designer, an SDET and a QA Manual tester, so its gates spread across many people. A team of four spreads the same gates across four. The gate does not multiply with the size of the team; it is the same decision either way.

How many agents there are, and why the number keeps moving
Four sources give four different totals. They are counting different things:

Count	What is in it
Workflow agents, Sirius overall	18	The pipeline steps. Catalogue rows 1 to 18
Workflow agents, Lead Manager	17	The 18, minus Harvester Spawner, which only Harvester runs
Platform and supporting agents	3	Main Orchestrator, Agent Run Logger, Design Capture
Total	21	Matches the 21 rows in 13, the Agent Catalogue
Design Capture is a supporting agent, not a pipeline step. That is why it is absent from all three boards and why 13 lists it alongside the Orchestrator and the Agent Run Logger rather than among the numbered steps. Any count that puts it in Spec Sprint is counting a support tool as a workflow stage.

Harvester Spawner is the only agent unique to one team. Lead Manager and ETL both run Backend Implementation at that position; Harvester runs the Spawner instead. So Sirius overall carries one more workflow agent than any single team does.

One Orchestrator sequences the agents and manages handoffs across the pipeline. It coordinates the work; it does not approve the work. Approval is always human. The former phase orchestrators were folded into it and now run as ordinary agents.

The phase names are ours. No Jira board carries them, and boards differ from each other. The LeadManager board runs sixteen statuses, from Incoming through to Done; another runs eight, another four. ETL runs through ClickUp rather than Jira at all.

Use the phase names to talk about the shape of the work. Learn your own board's statuses to do the work. A tribe told the names match will go looking for a column that does not exist.

The process steps, in order
Eighteen process steps across the three phases. Four of them are parallel tracks rather than single steps, and the loop at the end is what makes this a cycle rather than a line.

Phase	Steps, in sequence
Strategic	Usage / Market Analysis → Idea Generation and Problem Statement → Hypothesis → Prioritisation. The first three form a loop, not a line: a hypothesis sends you back to analysis until it holds.
Design / Spec Sprint	Requirement Refinement → four impact analyses in parallel — Architectural, Functional, Design, Code → Mock-up Context Generation and Creation → Dev Task Content Generation and Creation → Test Case Generation
Implementation	Sprint Planning → four implementation tracks in parallel — Architecture, Backend, Frontend, and Database (retired — folded into Backend) → Code Review → Testing → Deploy to Demo → Regression Test → Deploy to Production → Measure. Three of those steps loop back to implementation on a fail, not one: Code Review, Testing, and Regression Test. The third crosses a deploy, so a regression failure sends work back across a boundary it had already left Measure → back to Usage / Market Analysis
Agent coverage stops at Testing. Deploy to Demo, Regression Test, Deploy to Production and Measure carry no agents at all on the board. Those four steps are human and CI/CD work today, and GitHub Actions replaced the former Deployment agent.

The phrase “an agentic SDLC” invites the assumption that it runs to production. It does not. The agents help you get to a tested pull request. Everything after that is the same job it was before.

Who holds each phase
Eight roles appear across the board. No role appears in all three phases, which is the point: accountability moves as the work does.

Phase	Roles named on the board
Strategic	Product Manager, Solution Architect
Design / Spec Sprint	Delivery Manager, Product Manager, Solution Architect, UI/UX Designer, Software Engineer, QA
Implementation	Delivery Manager, Software Engineer, Tech Lead / DevOps, QA Manual, SDET
The board uses more QA names than the role catalogue does. It has QA Tester, QA Manual and SDET across different lanes for what may be two roles or three. Where they differ, 2.4 governs. Neither difference changes the workflow.

The three phases are a cycle, not a line. What ships is measured, the measurement feeds Crux, and Crux is the evidence the next Epic is argued from. Drawn as a straight line the workflow looks like a factory; the return path is what makes it a product process.

The return path is the one edge with no gate on it, because nothing is being handed over — a release generating usage data is not a decision anyone signs.

It is also entirely manual. On the workflow diagram, Deploy to Production and Measure sit inside a box marked Manual, and the line back to Crux starts from there. 5.2 says the same thing from the other end: agent coverage stops at Testing. So the loop closes because a person closes it, and a team can run every phase and every gate correctly, ship, and simply never do it. The workflow still works. It stops learning, and the next Strategic phase runs on opinion rather than evidence. 13.2 lists product analytics access as a prerequisite for exactly this reason.

5.2 Phase definitions
The three phases side by side, so the same field can be compared across them rather than looked up in three places.

Strategic	Spec Sprint	Implementation
Purpose	Turn a raw idea into a committed, well-formed Epic	Turn the Epic into buildable specifications	Turn specifications into reviewed, tested, deploy-ready code
Workflow agents · 17 for Lead Manager	2. Epic Agent Suite, Feasibility & Effort	7. Spec Refiner, Impact Analysis, Design Context, Design Creation, Task Context, Task Creation, Acceptance Test	8. Sprint Planning, Architecture Implementation, Backend Implementation, Frontend Implementation, Code Review, PR Validation, Pre-merge, QA
Human In The Loop (HITL)	PM or Product Owner, with the Solution Architect on feasibility	Delivery Manager, Designer, QA Lead	Engineers per track, Solution Architect, QA Engineer
Input	An approved Aha! Idea, PM judgement, a leadership request, or an evidence-led theme	A committed Epic with problem, goal and priority agreed	Approved design, acceptance tests, task breakdown
Output	Committed Epic at Ready for Spec Sprint, with a Delivery Information block	Approved design, acceptance criteria, developer tasks	Merged, tested, deployed code
Exit gate	Hard. A human commits the Epic	Hard. Role owners approve before code begins	Hard. Code Review is a permanent human gate
Known challenge	Needs someone holding the PM's gates. Two of three pilot teams had no PM	Design agents not applicable where there is no UI	Harvester code review still manual
The same pipeline on two differently shaped teams
The clearest argument that team shape changes the agent set is to see it. Both WS2 teams are backend-only: no UI, no Product Manager, no separate acceptance-test agent. Thirteen workflow agents each rather than seventeen, and three of those thirteen are provisioned but not yet running.

WS2 · ETL — agents and human gates, end to end
Thirteen workflow agents on the board: ten in use, three provisioned for later. Thirteen Human Gates. No UI, so no design agents, and acceptance criteria cover what the Acceptance Test
agent does for Lead Manager. Each gate is held by a person, and each team decides which person.
Agent generates
Human governs
Agents never move work past a Human Gate on their own.
Stage 1 · Strategy
What to build, and whether it is worth building
1a. Epic Suite Agent — Discovery, Create, Scope, Validate *
Synthesises inputs; creates, updates, scopes and validates the Epic
in Aha!
Human Gate — Epic scope and evidence confirmed
2. Feasibility & Effort Estimation Agent
Feasibility report and T-shirt size per Epic
Human Gate — Approach confirmed, or revision requested
1b. Epic Suite Agent — Prioritise and Commit *
Value-versus-effort scoring and ranked backlog; commits the Epic
Human Gate — Backlog approved; Spec Sprint starts
Stage 2 · Spec Sprint
Turn the committed Epic into buildable specifications
3. Spec Refiner Agent
Refines requirement clarity; tags New versus Update specs
NOT YET IN USE
Human Gate — Refined specs and tags reviewed
4. Impact Analysis Agent
Cross-dimensional analysis across the ontology graphs
Human Gate — Impact reviewed before design
5. Task Context Agent
Task tree and breakdown, with context
Human Gate — Task breakdown reviewed
6. Task Creation Agent
Refined, executable sub-tasks per layer
Human Gate — Task breakdown committed for the sprint
Stage 3 · Implementation
Turn specifications into reviewed, tested, merged code
7. Sprint Planning Agent
Sprint scope, capacity and sequencing
Human Gate — Sprint plan approved
8. Architecture Implementation Agent
ADR, contracts and IaC
NOT YET IN USE
Human Gate — Architecture PR reviewed
9. Backend Implementation Agent
Service, controller and handler code; DB migrations, rollback, ORM
models
Human Gate — Implementation PR reviewed
10. Code Reviewer Agent
Absorbs Merge Validation; reviews the diff
11. PR Validation Agent
Verifies the PR implements what impact analysis specified
Human Gate — Peer review approved; validation verdict
recorded
12. Pre-Merge Agent
Merges the PR and reindexes the code ontology in Breeze
Human Gate — Merge and ontology reindex confirmed
13. QA Agent
Playwright tests and execution results
NOT YET IN USE
Human Gate — Final QA sign-off
PARALLEL
The board draws this stage; the pilot did not run it
Sections 5.2 and 5.5 record that this team had no Product Manager, so Strategy
was absent in practice. The board shows the target shape, not what happened.
Beyond the agents — no agent coverage
Deploy to Demo
Regression Test
Deploy to Production
Measure
Human and CI/CD work today. GitHub Actions replaced the Deployment agent.
* 1a and 1b are the same Epic Suite Agent, split by the Feasibility dependency. · Dashed cards are provisioned but not yet in use. · Read each stage top to bottom; stages run left to right.
WS2 · Harvester — agents and human gates, end to end
The same shape as ETL, with the one agent no other team runs: the Harvester Spawner at step 9, in place of Backend Implementation. Ten of thirteen board agents in use; three provisioned
for later. Thirteen Human Gates, each held by a person the team names.
Agent generates
Human governs
Agents never move work past a Human Gate on their own.
Stage 1 · Strategy
What to build, and whether it is worth building
1a. Epic Suite Agent — Discovery, Create, Scope, Validate *
Synthesises inputs; creates, updates, scopes and validates the Epic
in Aha!
Human Gate — Epic scope and evidence confirmed
2. Feasibility & Effort Estimation Agent
Feasibility report and T-shirt size per Epic
Human Gate — Approach confirmed, or revision requested
1b. Epic Suite Agent — Prioritise and Commit *
Value-versus-effort scoring and ranked backlog; commits the Epic
Human Gate — Backlog approved; Spec Sprint starts
Stage 2 · Spec Sprint
Turn the committed Epic into buildable specifications
3. Spec Refiner Agent
Refines requirement clarity; tags New versus Update specs
NOT YET IN USE
Human Gate — Refined specs and tags reviewed
4. Impact Analysis Agent
Cross-dimensional analysis across the ontology graphs
Human Gate — Impact reviewed before design
5. Task Context Agent
Task tree and breakdown, with context
Human Gate — Task breakdown reviewed
6. Task Creation Agent
Refined, executable sub-tasks per layer
Human Gate — Task breakdown committed for the sprint
Stage 3 · Implementation
Turn specifications into reviewed, tested, merged code
7. Sprint Planning Agent
Sprint scope, capacity and sequencing
Human Gate — Sprint plan approved
8. Architecture Implementation Agent
ADR, contracts and IaC
NOT YET IN USE
Human Gate — Architecture PR reviewed
9. Harvester Spawner Agent
Spawns and manages scraper instances; handles retries and rate
limits
Human Gate — Implementation PR reviewed
10. Code Reviewer Agent
Absorbs Merge Validation; reviews the diff
11. PR Validation Agent
Verifies the PR implements what impact analysis specified
Human Gate — Peer review approved; validation verdict
recorded
12. Pre-Merge Agent
Merges the PR and reindexes the code ontology in Breeze
Human Gate — Merge and ontology reindex confirmed
13. QA Agent
Playwright tests and execution results
NOT YET IN USE
Human Gate — Final QA sign-off
PARALLEL
The board draws this stage; the pilot did not run it
Sections 5.2 and 5.5 record that this team had no Product Manager, so Strategy
was absent in practice. The board shows the target shape, not what happened.
Beyond the agents — no agent coverage
Deploy to Demo
Regression Test
Deploy to Production
Measure
Human and CI/CD work today. GitHub Actions replaced the Deployment agent.
* 1a and 1b are the same Epic Suite Agent, split by the Feasibility dependency. · Dashed cards are provisioned but not yet in use. · Read each stage top to bottom; stages run left to right.
ETL and Harvester differ from one another in exactly one card, at step 9. Everything else is identical. A tribe adopting Sirius should expect to look like one of these three, not to reproduce all seventeen steps.

You do not need a complete team to run this. The three pilot teams were not the same size or shape, and the one with the fullest roster is the one drawn first, which makes it the easiest to mistake for a requirement. It is not. ETL and Harvester ran without a Product Manager, without a designer, without frontend or database work, and the agents that depended on those simply did not apply. Neither team assembled a Lead Manager-shaped team first. They entered at the phase that fitted them and ran the agents that had inputs.

What a smaller team actually changes. Fewer roles means fewer people holding gates, not fewer gates. One person may hold three gates that Lead Manager spreads across three people, and that is a normal shape rather than a compromise. What it does change is throughput: the same person reviewing more output is the real constraint, which is why review capacity is a prerequisite at 13.2A and team size is not. A team that is honest about its review capacity and switches agents on gradually is in better shape than a larger team that switches everything on at once.

The steps above follow the SIRIUS workflow diagram, which is maintained separately and has its own owner. Where the two disagree, the diagram is the source for what the steps are and this section is the source for what each one means. A difference between them is worth raising rather than resolving alone.

Every phase runs. Not every agent has work to do. These are different things, and the pilot blurred them. ETL and Harvester have no UI and no database work, so Design Context, Design Creation, Frontend and Database Implementation had nothing to act on — an agent with no inputs does not run, and that is not a decision anyone makes. But they also had no Product Manager, and Strategy was simply absent as a result. That is the part that does not carry forward: the phase is adopted, and where a role is missing the tribe names who holds its gate before the phase runs. 13.2 is where that is established.

5.3 Entry and exit criteria
A phase boundary is a completeness check, not a status change. What a work item must carry to leave one phase is exactly what the next phase depends on — so an exit criterion and the next phase's entry criterion are the same thing, written once.

The person at the gate checks the list. Where an item is genuinely not needed, it is waived with a reason recorded on the work item, not left blank. A blank and a waiver look the same in a month; only one of them tells you a person decided.

Leaving Strategic
Must carry	Why the next phase needs it
A problem statement and a goal	Spec Sprint refines a stated problem. It cannot infer one
Priority agreed	Determines whether Spec Sprint starts at all
Featurize readiness — a breakdown block and at least one child Feature	The commit door will not pass without it, and Task Context has nothing to break down otherwise
A Delivery Information block	Carries the context the Spec Sprint agents read
Status at Ready for Spec Sprint	The trigger the downstream agents watch
The gate: a person commits the Epic. Hard — work stops until they do.

Leaving Spec Sprint
Must carry	Why the next phase needs it
Impact analysis across the graphs	PR Validation checks the build against it. Without it that agent has nothing to validate — which is why it was disabled during the pilot
A task breakdown, reviewed	Implementation agents work per task, not per Epic
Acceptance criteria and a test plan	QA and Acceptance Test run from these. Written after the code, they describe what was built rather than what was asked for
Design artefacts, where the team does design work	Frontend Implementation reads them. Not applicable is a valid answer, recorded as one
The gate: role owners approve before any code is written. Hard.

Leaving Implementation
Must carry	Why it matters
Merged code with tests	The unit of delivery
Peer review approved, and the validation verdict recorded	The verdict is evidence, not paperwork: it is what promotion decisions are computed from
The ontology reindexed after merge	The next ticket's impact analysis reads the graph. A stale graph makes the next analysis confidently wrong
QA sign-off	Last human check before the work leaves the agents' reach
The gate: code review is a permanent human gate, and QA signs off deploy readiness. Hard.

Agent coverage stops here. Deploy to Demo, Regression Test, Deploy to Production and Measure carry no agents. What leaves Implementation is a tested, merged pull request — the rest is the job it always was.

5.4 Human decision gates
A Gate is a required human sign-off point. Agents never bypass a gate. Gates are sorted by how the person steps in.

Type	In plain words	What the person does
Hard	Must approve	Work stops until a named person says yes. Nobody can skip it
Iterative	Send it back	The reviewer returns it to the agent for another pass
Selective	Pick one	The agent offers options, the person chooses
Conditional	Only sometimes	Applies when stated conditions are met, not on every run
An automated check is not a Gate. A branch policy, a passing build, a rules-based validation: all useful, none of them a person. The risk is specific: someone points at a green tick as evidence a human reviewed something when nobody did. Where an automated check sits in front of a Gate, name it as a check and keep the Gate behind it.

Whether an agent is trusted enough to run is a different question, and not a Gate. Maturity graduation, promotion and leaving hypercare decide whether an agent may progress, not whether a piece of work may. They live in 9.3.

The five safety rules, promoted from the Epic Recipes pipeline. These are the clearest statement of the model produced anywhere in Sirius and they apply to every agent, not just the Aha! ones.

Rule	What it means
Nothing is saved without a person starting it	No agent writes to a System of Record on its own. A person starts every run, and only one component in a pipeline holds write authority
Important changes always leave a trail	Field-level changes recorded as old value, new value, reason, on the work item
Recipes only start when you type the command	No agent self-starts from ambient conversation. Every run begins with a human act
Work is never lost between sessions	Progress lives on the work item, not in a chat session. Anyone can pick up where someone stopped
Suggestions are labelled honestly	Where an agent infers rather than knows, the output is marked as a guess needing confirmation
5.5 Exception paths
The workflow is not one of the things a tribe varies. The three phases and the gates are adopted as they stand, and refinements are proposed after a tribe has run the whole thing. What follows is a variance path for the circumstances around it: who a tribe asks, and on what grounds. A rule with no exception route becomes either bureaucracy or shelfware, but a rule everyone can opt out of on day one is not a standard.

Situation	Ask	Grounds
A tribe has no PM	GDH Delivery Lead	The Strategy phase still runs. The tribe names who holds the PM's gates and records it before activation. Sirius let ETL and Harvester skip the phase instead, and that is not repeated
A tribe does not use Aha!	GDH Delivery Lead with Product Management	Granted on evidence that the equivalent stages and the commit Gate exist in the tool the tribe does use. The Gate is the requirement; Aha! is not
A tribe wants to change the workflow or the agent set	AI Governance Team	Adopt it whole first, then propose the change on the evidence of having run it. See 9.3
A tribe cannot get an answer within a week	Proceed on judgement and record what was done	Waiting on this document is worse than deviating from it
5.6 Information maturity
A work item gets richer as it travels, and every agent reads what the one before it left. That is the whole mechanism. The Epic Agent Suite writes an Epic; Spec Refiner appends to it; Impact Analysis reads that and writes a report into the Breeze Scope Manifest; Task Context reads the manifest. Nothing is passed by hand and nothing is re-derived — each step finds what it needs already on the record.

Two consequences follow, and both bite in practice.

A missing input does not stop the pipeline; it degrades the output quietly. An agent with a thin input still runs and still reports success. The Sirius pilot disabled PR Validation for exactly this reason: it needed impact analysis that was not reliably present, and without it the verdict was worthless rather than absent. If an analysis looks thin, check what fed it before you judge the agent.

Where the information lives is part of the design. State sits on the work item — the Jira field, the Aha! record, the Confluence page — not in a chat session. That is what lets a different person pick up the next step, and what makes a re-run possible weeks later.

5.7 Information requirements by stage
What each agent needs in hand before it runs, and what it leaves for the next one. Transcribed from the Information Progression frame of the SDLC Agentic AI · Redesign board.

Strategic
Agent	Needs	Leaves
Epic Agent Suite (scope)	PostHog long-tail analytics; PM input and answers to seeded questions; the Breeze knowledge graph for functional, code and product context	An Epic in Aha! carrying background, problem, source, goals, audience, strategic alignment, quantified impact and how success is measured
Feasibility & Effort	The Aha! epic or Jira ticket; any prior assessment and Q&A; a live Breeze scan across functional, design, code and architecture	A written assessment as a comment, and Aha!'s Delivery T-shirt estimate field set — Extra-Small, Small, Medium, Large or Extra-Large
Epic Agent Suite (featurize)	The scoped Epic's problem and solution prose; the Breeze graph on --deep	A breakdown table in the Epic body, one row per functional unit, each row proposed for a person to edit, rename or delete before anything is created
Epic Agent Suite (prioritise and commit)	The scoped Epic; the feasibility output; blast-radius impact; the dependency graph; strategic weighting	A ranked backlog with sequencing rationale, and the item committed at Ready for Spec Sprint
Spec Sprint
Agent	Needs	Leaves
Spec Refiner	The committed Epic; on a re-run, the points agreed with Product last round and the open gaps	A Spec Refiner block appended to the same Epic, each row tagged New or Update, an update naming exactly what it replaces
Impact Analysis	The ticket including the Spec Refiner block; up to five parent tickets for business context; attachments; a deep Breeze scan across all four graphs	A report on Confluence, its link prepended to the ticket's Breeze Scope Manifest, and the analysis saved back into Breeze as the ticket's impacted ontology
Design Capture	The production URL and a login	Repository reference, state manifest, sitemap, and the master design file as HTML
Design Context	The Jira Epic or Story; the impact analysis output	A UIX task linked to the Epic, carrying design context, scope, and the interaction states to cover
Design Creation	The design brief; product references; the master design file	HTML prototype, design manifest and repository link, inside the ticket
Task Context	The Epic and attachments; the Breeze Scope Manifest; the previous task context manifest on a rework; the design hand-off if one exists	A Task Context Manifest in a Jira field: task classification, architecture decision record, and the implementation task list
Task Creation	The Epic description; the Breeze Scope Manifest; the Task Context Manifest; design outputs where design applies	One Jira child task per implementation row, split by discipline, each with a spec, a story-point estimate and dependency links
Acceptance Test	The ticket from Task Creation; the existing Qase.io repository; the prototype	Test cases in Qase.io covering happy path, negative and edge cases, and a test plan
Implementation
Agent	Needs	Leaves
Sprint Planning	Prioritised work items; tickets at Ready for Dev; the priority hierarchy; capacity and availability	Sprint dates, effective capacity net of leave and buffer, and a recommended backlog with assignments
Architecture Implementation	The DevOps ticket; the Terraform repository and its conventions; live AWS state	A draft PR with proposal, design, task list and acceptance criteria. Once approved, Terraform changes are pushed to the same PR, which stays draft — a person runs plan and apply
Backend Implementation	The Breeze Scope Manifest on the Epic; the backend and database sub-tasks; the repository and its CLAUDE.md	An open implementation PR
Frontend Implementation	The frontend sub-task; hi-fi mockup and interaction states; the API contract; the repository	A PR with components, unit and component tests, internationalisation keys and accessibility annotations
Code Reviewer	The commit and the open PR	Inline review comments graded must fix / should fix / nit / praise, with suggested patches. A person still decides
PR Validation	The PR and the Jira key from its title; the Breeze project and the ticket's saved impact-analysis ontology; the diff	A verdict on whether the diff implements what the impact analysis said it would. On an approving comment, the merge gate unblocks
Pre-Merge	The merged PR and its key; the Breeze project and the ticket's ontology	A merge report, duplicate ontology nodes remapped onto existing ones, and the repository's code ontology re-indexed
QA	The Qase.io test plan; the ticket	Playwright specs, a page object model, execution results published to Qase.io and posted to Jira, and defects logged
Read the Leaves column as the next agent's Needs. Where a team does not run an agent, whatever it would have left is missing downstream — and the agent after it will run anyway.

5.8 End-to-end traceability
Can you get from a line of shipped code back to the reason it was written? Yes, but by walking a chain of links rather than opening a report. Nothing assembles the whole path into one view today, so it is worth knowing what each link is and which agent leaves it.

From → to	What joins them	Left by
Idea → Epic	The Epic record in Aha!	Epic Agent Suite, epic lane
Epic → Features	The breakdown block in the Epic body, each row rewritten to name the feature it became	Epic Agent Suite, epic lane
Feature → Story	One to one. The commit door verifies the Story link exists before it will pass	Epic Agent Suite, feature lane
Story → impact	The Breeze Scope Manifest field on the ticket, carrying the impact report and the ontology record	Impact Analysis
Impact → plan	The same field, read by Task Context, Design Context and Task Creation as their scope source	Those three
Ticket → branch	The branch name and strategy recorded on the run, inherited by every later phase	The implementation agent
Branch → what shipped	The diff checked against the ontology record, then reconciled into the graph after merge	PR Validation, then Pre-merge
Run → judgement	The verdict and the audit comment on the record	The reviewer, per 8.1
One field carries most of the weight. The Breeze Scope Manifest is where the chain joins: Impact Analysis writes it and four agents read it. 6.2 makes the same point from the other direction — it is the longest-lived shared object in the pipeline, so a thin impact analysis is not a poor document, it is a weak link that three later agents build on.

Three places the chain breaks
Impact Analysis did not run. The manifest field is empty, and everything downstream has no way back to the Epic. The work still happens; the trace does not exist.

A local agent was not connected to the Run Logger. Cloud runs are recorded by the platform without anyone doing anything. Every local agent must be connected to the Agent Run Logger, which is the run-logger plugin in the marketplace: it records the run and posts it to the team's Confluence page or wiki. An agent that is not connected does the work and leaves no trace of it. 13.2 carries the install.

Nobody tagged the run. The link survives, the judgement does not. A trace that shows what happened and not whether it was any good answers an audit question but not a quality one.

Traceability is a by-product here, not a feature. No agent sets out to build it; it exists because each agent writes its output where the next one reads. That is why it breaks quietly: the first agent to skip its write costs you the rest of the chain, and nothing announces it.

