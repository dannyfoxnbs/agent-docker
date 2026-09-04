Hubexo · Project Sirius
Sirius Guidelines
The detail behind the Playbook, for the team doing the adopting: the workflow agent by agent, the gates, the catalogues, the readiness assessment, the evidence, and what is known not to work yet. Read the Playbook first for the shape; come here for the specifics. Section 1.2 says which sections your role needs.

Version
1.0 · Enablement release
Audience
All Hubexo Tech Delivery tribes
Last updated
29 August 2026
Maintained by
GDH Delivery Lead

Fiesta Rasyid
Direct email
Questions
Sirius Service Desk
Raise a request
Any question, however small
Contents and how to read this
The detail behind the Sirius Playbook. The Playbook gives you the shape in seven pages. This gives you the standard, the decisions, and the evidence behind them.

Where a section has a known gap, it says so in its own words. Nothing is padded to look finished, and nothing is labelled finished that is not.

Contents
Sections 1 to 6 · Preparation
1
Document Overview
What this is, who it is for, and which parts your role actually needs
2
Introduction to Project Sirius
What Sirius is, what it changes about how work moves, and who is accountable for what
3
Glossary and Terms Library
Every term in plain words. Worth reading before anyone argues about one
4
The Four Building Blocks
People, workflow, agents and tools — and why that order is the order
5
End-to-End Sirius Workflow
The three phases agent by agent: what each one needs, what it leaves, and where a person decides
6
Sirius Knowledge Foundation
What the agents actually read, and how that fails without saying so
Sections 7 to 12 · Execution detail
7
Sirius Delivery Lifecycle
How work gets in, and the shortest honest route from an idea to something a developer can pick up
8
Recording Feedback on Agent Performance
How a verdict is recorded, and why thirty seconds at review decides everything downstream
9
Sirius Governance
Who decides what, how an agent earns promotion, and what happens when one goes wrong
10
Agent Catalogue
All 21 components with their owners, and what the evidence says as against what the bands claim
11
Tools Catalogue
Every tool in the workflow, who uses it, and which ones are still aspiration
12
Metrics Catalogue
What is measured, how each number is worked out, and the floors an agent has to clear
Sections 13 to 15 · Adoption and support
13
Adoption Path
Prerequisites, readiness, enablement week and hypercare. Start here if you are adopting
14
Frequently Asked Questions
The questions that keep coming up, answered once
15
Troubleshooting Guide
When something breaks, and something will
1
Document Overview
1.1 Purpose
This document is the single reference for how Hubexo delivers software with AI agents. It states what has been agreed, who governs each part, and what a tribe must do to adopt it. It is not a tool manual and not a project report.

After reading it, a tribe should be able to say what changes for each role, which agents apply to them, where a person must sign off, and what they need in place before they start.

1.2 Intended audience
Reader	Read this
Tribe lead adopting Sirius	1, 2, 13, then 9 for what you are agreeing to
Engineer, QA, designer	4, 5, your role in 2.5, then 10 for the agents you will use and 8 for how to record a verdict
Product Manager	7, the whole phase, and 7.4 for the doors themselves
Delivery Manager	5, 8, 9, 12, 13
Leadership	2.1, 2.2, 12
Anyone, once something is running	14 for the questions people actually ask, 15 when a run goes wrong
Then read the runbook for the agent in front of you, in the companion Runbooks document. The sections above explain the system; a runbook explains one component, including what it is known not to do yet.

Written for the people doing the work, not only for the people approving it. If a section cannot be understood by someone new to AI tools, that is a defect in the section.

1.3 How to use this documentation
Sections 1 to 6 are preparation: what this is, who does what, the words we use, how work moves. Sections 7 to 15 are execution detail. Section 13 is the adoption path once you understand the rest.

Where a section needs technical depth, it links into the Operations Reference rather than growing. Follow the link when you need it and ignore it when you do not.

1.4 Document ownership and governance
This layer	GDH Delivery Lead (Fiesta Rasyid)
Operations Reference	Solution Architect, Forever Promise (Andri Ferinata)
Source of truth	Markdown in hubexo/hd-ai-sdlc. Confluence publishes for readers. The assembled HTML is generated output, never edited by hand
Change control	One pull request per section. A merge is an approval. Every decision recorded in decisions/ with what was rejected and why
Vocabulary	Fixed to the Glossarium. A new term needs a decision, not a paragraph
Every section must carry an owner, a sources-verified date, what a tribe should be able to do after reading it, and a variance path saying who to ask for an exception and on what grounds. A rule with no exception path becomes either bureaucracy or shelfware.

Who to check each section with, and when it was last checked
The GDH Delivery Lead owns the whole set. That is not the same as knowing whether it is still true. Most sections describe something somebody else builds and changes, so freshness is a conversation with that person rather than a proofread. This register says who that person is.

Roles, not names. The two roles are held by the people named in the table above, and a role outlasts whoever holds it. Sources verified is the day someone last compared the section against the thing it describes — not the day it was last edited. A section can be edited into better prose and become less true on the same afternoon.

Section	Check with	Because they own	Sources verified
1 Document Overview	GDH Delivery Lead	This set	29 Aug 2026
2 Introduction	GDH Delivery Lead	The programme narrative	not recorded
3 Glossary	GDH Delivery Lead	The Glossarium, and the vocabulary here that tracks it. Drift is machine-checked on every build	29 Aug 2026
4 Four Building Blocks	GDH Delivery Lead	The model	not recorded
5 Workflow	GDH Delivery Lead, with the workflow diagram owner	The end-to-end shape. The phase steps at 5.2 follow the workflow diagram, which has its own owner and moves independently of this document	not recorded
6 Knowledge Foundation	Solution Architect, Forever Promise	Breeze, and what agents read	29 Aug 2026
7 Strategic	Epic Agent Suite owner	The Epic Agent Suite, which is the machinery of this whole phase	29 Aug 2026
8 Recording Feedback	Solution Architect, Forever Promise	The Run Logger and the verdict grammar	29 Aug 2026
9 Governance	AI Governance Team	The gates and the promotion criteria	29 Aug 2026
10 Agent Catalogue	Each agent's owner, per 10.1	Their own agent. The roster itself is the GDH Delivery Lead's	29 Aug 2026
11 Tools Catalogue	Solution Architect, Forever Promise	The platform and its integrations	29 Aug 2026
12 Metrics	GDH Delivery Lead	The measures and the floors	29 Aug 2026
13 Adoption Path	GDH Delivery Lead	Readiness, enablement and hypercare	29 Aug 2026
14 FAQ	GDH Delivery Lead	Questions actually asked. Fed by the service desk queue	29 Aug 2026
15 Troubleshooting	Solution Architect, Forever Promise	The operations troubleshooting record this section carries	29 Aug 2026
Runbooks	The named owner of that agent, per 10.1	Their agent's behaviour, failures and gaps	Per runbook, in its Source row
Playbook	GDH Delivery Lead	The seven-page introduction	29 Aug 2026
Three entries above have never been checked against a source. Two, four and five describe the model rather than the platform, which is why they have drifted least and been checked least. That is a reason to look, not a reason to relax.

A runbook carries its own date in its Source row, because runbooks go stale faster than sections and each one has a different owner. 10.3 says the same thing: a runbook is accurate on its stated date, not today.

How this stays honest. tools/check-owners.py runs with the other checkers. It fails if a section has no entry here, if a runbook's owner disagrees with the catalogue, or if a verified date is missing or older than ninety days. A stale date is meant to be visible rather than tidy.

2
Introduction to Project Sirius
2.1 Executive summary
Hubexo is moving from traditional Agile Scrum to a lifecycle where AI agents accelerate the work and people govern it. Project Sirius ran the model for 14 weeks on three teams inside the Forever Promise Tribe: LeadManager (WS1), ETL and Harvester (WS2). It closed on 31 July 2026.

Three teams matters more than it sounds, because they are not alike. LeadManager has UI work, database work and a Product Manager. ETL and Harvester have none of those. So the pilot did not prove the model once. It showed which parts travel and which depend on the shape of the team. That distinction is the useful output.

Those three teams are some of the teams in Forever Promise, which is the largest tribe at Hubexo. Sirius was a deep pilot, not a tribe-wide rollout. The pilot ran; describing it as proven would overstate what the evidence supports.

2.2 Sirius in one page
The motto. Agents Accelerate. Humans Govern.

What agents do. Draft the work. Epics, impact analysis, design context, task breakdown, code, tests, reviews.

What people do. Decide whether the draft is good enough to move on. Every time. At a Gate no agent may bypass.

Three phases. Strategic, what and why. Spec Sprint, design and specification. Implementation, build, review, test, deploy.

The dividend. Throughput rises, and that is the point. It is not a headcount exercise. But agents produce drafts, and a draft nobody can judge is not output — so a share of the time returned goes back into the person: system design, critical thinking, mentoring, and the room to do them. The skill of the reviewer is what turns more drafts into more delivered work.

How trust is earned. By evidence from logged runs, never by a date in a plan.

2.3 Core principles
Human-Driven. Technology amplifies human capability; it does not replace human judgment. Every agent has a named human accountable for it, and a named human who approves its output before anything enters a System of Record. Those are two different roles, see 2.5.

More output, and the people to match it. Higher throughput is expected and intended. What makes it hold is that the team can review what the agents produce. Spend the whole dividend on volume and you get a team that is faster this quarter and weaker next year, reviewing more output with the same skill it had before — and the review becomes a rubber stamp, which is worse than no review because it looks like control. So part of the dividend goes to the people doing the reviewing. That is not a brake on output. It is what output runs on.

What Sirius Agentic SDLC is, and is not

It is	It is not
A human-governed pipeline where agents draft and people review	Autonomous delivery that removes people from the loop
A way to lift throughput and build the skill to review what comes back	A way to cut headcount
Evidence-based progression, where agents earn trust by meeting floors	A calendar-driven rollout where agents graduate on a date
A gradual transition run alongside live delivery	A big-bang cutover
2.4 Role catalogue
Two kinds of role matter here. The first three are new or changed by Sirius. The rest already exist and keep their names; what changes is how they spend their time, which is section 13.

Roles Sirius creates or changes
Role	Owns	Who holds it
Agent Owner	The agent itself: its purpose, prompt, behaviour, runbook and fixes. Approves changes to it.	One named person per agent, globally. All 21 named in section 10.
Human In The Loop (HITL)	The decision the output feeds. Accepts or reworks, and tags the outcome at the point of review.	Whoever is using the agent. Not an appointment.
AI Governance Team	The standard, the promotion gate, the audit cadence. Not daily operation.	The Hub and Twin Ambassadors.
Hub Ambassador	Holds the standard across tribes and keeps it coherent. First stop when something is unclear, and the person who makes it safe to say an agent got it wrong.	The Tribe Solution Architect and the GDH Delivery Lead.
Twin Ambassador	Role-specific mastery. Knows the agents their discipline uses well enough to teach them and to speak for them at the gate.	The Agent Owners, one per discipline: backend, frontend, UI/UX, QA, architecture, product.
Sirius Platform Engineering	The Sirius Agent Platform itself: the runtime agents execute on, credentials, queues and the Agent Run Logger. Sits within the AI Governance Team, so the standard is set alongside the people who have to make it run.	The team that builds and operates the platform.
The Agent Owner and the HITL are deliberately different people most of the time. Nobody can review Sprint Planning output for twelve tribes and nobody should try, but somebody has to own the agent or its prompt rots and every tribe forks its own copy. Ownership is central; review is local.

Delivery roles, unchanged in name
Role	Where they hold a gate
Product Manager	Strategic. The Epic is committed only when a person agrees the problem, goal and priority.
Solution Architect	Feasibility, impact and architecture. Advisory output, human judgement.
Delivery Manager	Spec Sprint exit and sprint scope. Sprint Planning recommends; the DM decides.
Designer	Design context and design creation. Both agents stop for a human keyword.
Engineer, backend and frontend	Implementation. Approval before code is written, and review of what comes back.
QA Engineer	Acceptance tests and the QA pipeline. Output is human-reviewed before merge.
Delivery Coach	No single gate. Accountable for the continuous improvement of the delivery process and for enabling teams to work effectively within it. In Sirius terms, that includes the reinvestment side of 2.3: whether the time agents return is put back into capability, or absorbed into throughput without a deliberate choice.
Three delivery roles, and they are not interchangeable. The Delivery Manager sits with a team and decides sprint scope. The Delivery Coach works across teams on how delivery is done and holds no gate. The GDH Delivery Lead is accountable for Sirius delivery across WS1, WS2 and WS4. A team adopting Sirius will meet all three, usually in that order.

If your team lacks a role, the gate does not disappear. ETL and Harvester ran the pilot without a Product Manager, and the effect was not that Strategy ran itself — it was that the Strategy phase was absent. A tribe missing a role must say who holds that gate instead, before adopting the agents that feed it. Section 13 carries this as an entry condition.

2.5 Roles and responsibilities
Three accountabilities are easy to confuse, so they are stated plainly.

Is accountable for	Is not
Agent Owner	The agent working as intended. Prompt quality, the runbook, responding when it misbehaves, deciding whether a proposed change is merged.	Reviewing every output the agent produces, in every tribe. That does not scale and is not asked of them.
Human In The Loop (HITL)	The decision in front of them. Whether this output is good enough to proceed, and recording accept or rework so the evidence is real.	Fixing the agent. If it is wrong repeatedly, that is feedback to the Agent Owner, not a repair job.
AI Governance Team	The bar itself. What Core means, who clears it, when it is audited, and demoting an agent that regresses.	Running agents day to day. If Governance becomes the queue everything waits in, tribes route around it.
Being the Human In The Loop is not a role you are appointed to. It is what using an agent means. You ran it, so you review it, and you tag accept or rework at the point of review rather than later. Two reasons this is the right default: the judgement is made by the person who actually needed the output, and the reviewing population grows with adoption instead of becoming a bottleneck.

One deliberate exception. On the two gates that can stop work, Code Review and PR Validation, the release syntax can only be run by Agent Owners. Releasing a merge is not the same act as reviewing a draft.

2.6 Master RACI
Extends the four rows agreed in the Agent Governance Operating Model to the activities this document depends on.

A accountable, one only · R does the work · C consulted · I informed

Activity	Agent Owner	HITL	AI Governance Team	Sirius Platform Engineering
Agent quality, prompt changes, runbook	A/R	C	C	C
Reviewing an output and tagging accept or rework	I	A/R	I	—
Promotion or demotion of an agent	R (requests)	C	A	I
The standard, gate criteria, audit cadence	C	I	A/R	C
Platform, credentials, logging infrastructure	C	I	C	A/R
Pausing an agent in an incident	R	R (raises)	C	A
These Guidelines and the adoption path	C	I	A/R	C
Declaring a tribe ready to adopt	I	I	A/R	I
Assigning an Agent Owner and a backup	I	I	A/R	I
Sirius Platform Engineering is the team that builds and operates the Sirius Agent Platform: the runtime agents execute on, the credentials they use, the queues, and the Agent Run Logger. It is shown as its own column because the accountability is for infrastructure rather than for a decision, but it sits within the AI Governance Team rather than alongside it. The standard is therefore set by the same body that has to operate it, which is deliberate: a gate designed without the people who run the platform tends to describe things the platform cannot do.

3
Glossary and Terms Library
Fixed vocabulary. These are the only terms we use. A genuinely new term is added here first, by decision, not coined in passing.

Ordered the way a question arrives for someone new, not by when the words were invented. Read it once, top to bottom, and you can follow a standup.

3.1 What you work on
Term	Plain meaning
Epic	One product improvement, in Aha!. The why and the what: problem, evidence, outcome, boundary
Feature	A smaller item under an Epic, in Aha!. The how: the delivery detail, acceptance criteria included. It becomes Jira work after the handoff out of Strategy
Epic lane / Feature lane	The two halves of the planning work: getting an Epic defensible, then breaking it into Features
Featurize	Breaking an Epic into the Features it contains
Featurize readiness	A breakdown block plus at least one child Feature. A precondition of committing the Epic
Ready for Spec Sprint	The Aha! status marking the Strategic to Spec Sprint boundary
Phase	Strategic → Spec Sprint → Implementation. The Glossarium calls the first one Strategy; ours names it in full because strategy also names a branching strategy and a release strategy
Phase names are for conversation, not for finding a column. No Jira board carries them. The LeadManager board runs sixteen statuses, and teams run different boards. Learn your board; use the phase names to talk. See 5.1.

The Glossarium is the Confluence page that governs Sirius vocabulary across the programme. This section is the working subset: the words you need to follow a conversation, in the order you meet them. Where the two differ, guidelines/assets/glossarium-accepted.md records why.

Sirius is the programme. Sirius Agentic SDLC is the way of working it produced: agents draft, people review, and no agent moves work past a Human Gate. You will see both, and adopting one means adopting the other.

3.2 What does the work
Term	Plain meaning
Skill	Written instructions plus the tools for one kind of task. Used by an agent, never on its own
Sub-Agent	A helper an agent calls for one narrow part of a job, in a temporary workspace. Sub-agents cannot write
Agent	A worker that owns one whole job: reads inputs, reasons, uses skills, produces output. One named Agent Owner
Orchestrator	Sequences agents and manages handoffs. It never approves work and never bypasses a Gate
Plugin	How a Local agent is packaged for Claude so anyone can install and run it. Every Local agent is expected to ship as one
These four are referred to by name, not by a collective label. The four building blocks means People, Workflow, Agents and Tools, in section 4. Where all four agent terms are meant together, list them.

Every agent run begins with a human act: a status change, a comment, a push. One job is the exception, the weekly Crux cycle, which runs from Task Scheduler.

Three separate questions, often confused. Reading one for another is how an agent gets described as further along than it is.

Question	Values
Where does it run?	Cloud deployed and connected · Local on a person's machine · In-transition a move to Cloud is in review. Neither means unattended
Can I install it?	Plugin available, or not yet. A Local agent with a plugin is shared, not deployed
Is it supported?	Core Agents the governed set, 18 today · Platform and Supporting the Main Orchestrator, the Agent Run Logger and Design Capture
3.3 How something starts
Term	Plain meaning
Run	One execution of one agent against one work item. The unit everything is counted in
Trigger status	The board status whose entry starts an agent. Moving back into it does not start a second run
Door	A command you type that starts one guided run. Used in the planning agents
Fire-and-forget	A run that asks nothing: start it and the result arrives on the record
Chaining	One agent's approved output starting the next. The approval is still human
Nothing starts itself. Every run begins with a person doing something.

3.4 Where you say yes or no
Term	Plain meaning
Human Gate (Gate, for short)	A required human sign-off point. Agents never bypass one. Four kinds: Hard must approve · Iterative send it back · Selective pick one · Conditional only sometimes
Check	An automated test a record must pass inside a command — is there a problem statement? The Epic Agent Suite calls these gates too. They are not sign-offs and they do not replace one
Human In The Loop (HITL)	The person who reviews an agent's output and decides whether it proceeds
Accept	Usable as it stands. ;accept;<hours> — the hours are required, and record the manual effort displaced
Refine	Not usable as it stood, so a human added context and re-ran. The gap was in the inputs, not the agent
Rework	Not acceptable. ;rework;<hallucinated yes/no>;<kg|ag|hg>;<feedback>
KG / AG / HG	Where the fault lay: knowledge graph · agent · human gate
Improvement Point	What must change: Agent · Context · Human · Tooling
Worksheet	The agent's questions written into the record, each with a draft answer, for someone to answer later
Seed / harvest	Seed writes the questions in; harvest collects the answers. Every answered question is saved, even if others are blank
An automated check is not a Gate. A passing build or a lint rule is useful and it is not a person.

There is no letter for Tooling. A run that failed because an integration was down should be recorded ag with the Improvement Point set to Tooling. The run log is the record that counts. Reconcile the two schemes before either is published more widely.

Rework is a verdict and a movement. Mark it with a reason someone can act on; move the ticket to the board status that owns the fix, not the one it is in; send upstream faults upstream whether an agent or a person caused them; leave the reason on the record.

3.5 Knowing where things are
Term	Plain meaning
Board Status	Where the work is. The ordinary Jira status. Only a person moves it
Agent Status	Where the agent run is: In Progress, Ready for Review, Failed. It moves on its own
Marking rework moves the Agent Status. If the ticket is not also moved, the two drift: the board shows progress while the defect sits upstream with nobody holding it.

3.6 Where the truth lives
Term	Plain meaning
System of Record	The official home of a piece of work: Aha!, Jira, Breeze, Qase, GitHub
Breeze	The fact library of the system as it is: Functional, Design, Architecture, Code graphs. Used from the Epic onward
Crux	The fact library of product evidence, human-approved before an agent may cite it. Used before the Epic
Code ontology	The indexed version of a repository inside Breeze. Re-indexed when code moves
Blast radius	What a change touches across all four graphs. The output of impact analysis
Breeze Scope Manifest	The Jira field holding the Impact Analysis Reports. For downstream agents this field is the impact analysis
Product pack	Per-team configuration agents read instead of hard-coded values: statuses, ID patterns, fields
MCP	The standard wiring that lets an agent connect to a tool. On the Sirius platform, Cloud agents call provider APIs through shared service code instead; MCP is real for agents you run locally
3.7 What a run leaves behind
Term	Plain meaning
Agent Run Logger	Records every run and captures the reviewer's verdict. Cloud runs reach it through the platform; every local agent must be connected to it through the marketplace plugin, which publishes to Confluence or the team's wiki. An agent with no logged runs cannot be graduated
Run log	What it produces: one row per run — agent, item, duration, manual effort, tokens, verdict, hallucination, improvement point
Audit comment	The comment saying what changed, from what, to what, and why
Receipt	A file kept per run quoting the real responses. The log records the verdict; the receipt records what was sent
Impact Analysis Report	The page produced per impact-analysis run
Task Context Manifest	The Task Context agent's output: classification, architecture decisions, tasks
Child task prefixes	[00-MAIN] · [FE-] [BE-] [DB-] [UIX-] · [TM-] manual test · [TA-] test automation. The prefix is how an agent knows where to post
3.8 How an agent earns trust
Term	Plain meaning
Maturity status	Not-started → Manual → Testing → Establishing → Optimising. Earned by logged evidence, never by date
At-risk	A flag, not a status. Behind, with no logged evidence
Tagged run	A run carrying a verdict: Accept, Refine or Rework
Verdict coverage	Tagged runs ÷ total runs
NG · THIN · NR	NG not gateable, coverage under 50% · THIN too few runs for the band · NR nothing logged
Agent Acceptance Rate	First-time accepted agent output ÷ total work items. First time right: output accepted on the second or third attempt does not count. The Glossarium calls the same thing first-pass acceptance
Rework rate	Runs sent back ÷ total runs. Not measured on a blocking validation agent — see below
Gate pass rate	Share of runs clearing their gate first time
Manual Effort · Net Time Displaced	The human hours a run displaced; Σ ME(Accept) − Σ Duration(Accept), excluding review time, so an upper bound
Development Cycle Time	Ticket created to reaching the done-enough status, queue time included. Taken from the tracker's change history, reported as a median. Not lead time, which is reserved for the DORA measure of commit to deployed. See 12.5
Graduation period	The measurement window: 26th of one month to the 25th of the next
A rate is only read once there is enough to read. Two conditions before any status is claimed.

Enough runs in the window: ≥ 5 at Testing, ≥ 10 at Establishing, ≥ 20 at Optimising. Raised on the Glossarium on 29 August 2026, and the Graduation Log agrees at 20. The Glossarium notes these are subjective to backlog and agent role — an agent whose step comes up twice a sprint is not failing by running twice. That is a conversation with the owner, not a number to argue with.
Verdict coverage ≥ 50%. If fewer than half the runs carry a verdict, no rate is computed. An agent whose runs are not tagged does not graduate, however good the output looks.
What each band actually requires. The maturity labels used throughout section 10 are earned thresholds, not descriptions of how a team feels about an agent. All three conditions have to hold over the run minimum above.

Gate metric	Testing	Establishing	Optimising
Agent Acceptance Rate	≥ 50%	≥ 75%	≥ 85%
Hallucination rate	≤ 20%	≤ 10%	≤ 5%
Agent-attributed rework	not applied	≤ 25%	≤ 15%
Below Testing sit two states that are not really bands. Manual means the work is still done by hand and the baseline is being captured, over at least three work items. Not started means nothing has run.

Two agents are measured differently, because rework would measure the wrong thing. Code Review and PR Validation judge someone else's work and block it. Their output is a verdict, not an artifact, so sent back for rework would record the submitter's reaction to being rejected rather than any fault in the agent — and a stricter gate would score worse for being stricter. Nothing replaces it yet. Agent Acceptance Rate and the coverage conditions apply to them as normal, but the place rework occupies for every other agent is empty here. That is a hole in the floor, not a pass: neither agent graduates on it as it stands.

Gate pass rate does not apply to those two either. Share of runs clearing their gate first time is close to meaningless for an agent that is itself the gate.

This exemption follows the behaviour, not the label. Pre-merge and the QA Agent are also called validation agents and neither blocks anyone's work: Pre-merge reconciles the knowledge graph after a merge, and the QA Agent writes test code. Both produce an artifact a reviewer accepts or sends back in the ordinary way, so both stay on the standard three.

Floor	Criteria
Optimising graduation	Agent Acceptance Rate ≥ 85% · Rework \< 15% · Gate pass ≥ 75% · zero critical failures · both conditions above
Optimising, blocking validation agent	Agent Acceptance Rate ≥ 85% · zero critical failures · both conditions above. Rework and gate pass do not apply, and nothing replaces rework, so this floor is incomplete
BAU-ready	The same Agent Acceptance Rate ≥ 85% and rework \< 15%, plus a published runbook and named owner. BAU adds operating requirements, not a higher bar
BAU	Business as usual. An agent running as part of normal work, with a published runbook and a named owner, rather than as something being trialled
Hypercare	A period of closer support after activation: the ambassadors stay near the team, and problems get attention faster than they would later
Descoped	An agent taken out of scope rather than progressed. Not a failure verdict on the team
BAU-ready / Hypercare / Descoped	The three per-agent verdicts at pilot exit
Runbook	The operating note every Core Agent needs before BAU. Eleven fields, listed in 10.2
3.9 Who is accountable
Term	Plain meaning
Agent Owner	The named person accountable for an agent: purpose, prompt, runbook, fixes. One per agent, globally
Human Owner	The Glossarium's name for the same role. Our documents say Agent Owner. One of the two should go
Hub Ambassador / Twin Ambassador	The two WS4 roles carrying the rollout. The Hub Ambassador watches the human side; the Twin Ambassador proves the everyday value
GDH Delivery Lead	Global Development Hub Delivery Lead. Accountable for Sirius delivery across WS1, WS2 and WS4. Not the Delivery Coach and not the Delivery Manager
Delivery Coach	Continuous improvement of the delivery process, and enabling teams to work well inside it. Holds no gate. Not the same role as Delivery Manager
Delivery Manager	Decides sprint scope and holds the Spec Sprint exit gate. Sprint Planning recommends; the Delivery Manager decides
Break glass / P0	Declaring an emergency so work jumps the queue. A person only, never a formula, and it expires
Workstream (WS1–WS4)	WS1 LeadManager · WS2 ETL and Harvester · WS4 the rollout to other tribes
DORA metrics	Deployment frequency, lead time, recovery time, change failure rate, rework rate, reliability
3.10 Terms that live elsewhere
Each agent's own vocabulary stays in that agent's runbook: the design terms (island, Manifest 3.1, REUSE / EXTENSION / NET-NEW, tier lock), the QA terms (healing budget, verified-green, Graphify), the Harvester CLI (mandor), the Ops Bridger terms (G-code gap, blend), and the platform internals (hydration, in-flight dedup, config_snapshot, token bucket).

Linking to them is right; copying them in is not. Each moves at the pace of its own codebase, and a central copy goes stale silently. Follow the link on the agent's catalogue row.

4
The Four Building Blocks
Four things have to be right together, and a weakness in any one of them shows up as a failure in another. A tribe with good agents and no named owners produces work nobody will approve. A tribe with clear accountability and an unstable Jira board cannot trigger anything. This section says what each block has to carry.

4.1 People and human accountability
Two jobs, and they must stay separate.

Role	Owns	Scope
Agent Owner	The agent itself: its prompt, its behaviour, its runbook, its fixes	One agent, everywhere it runs
Human In The Loop (HITL)	The decision the agent's output feeds. Reviews it, accepts or reworks it, signs off	Whoever is using the agent. Not a designated person: the reviewer is whoever ran it and tags the outcome
AI Governance Team	The standard, the promotion gate, the audit cadence. Not daily operation	The Twin and Hub Ambassadors, across all Core Agents
Why the split matters. Nobody can review Sprint Planning output for twelve tribes and nobody should try. But somebody has to own the agent, or its prompt rots and every tribe forks its own copy. Separating the two keeps one person responsible for the agent’s health while the decisions stay where the work is.

For a Core Agent the Agent Owner is central and named in the catalogue, and the HITL is whoever holds that role in the adopting team. For a team’s own agent both jobs sit locally.

4.2 Workflow and information progression
Work moves through three phases, and information matures as it travels. What a work item must carry to leave one phase is exactly what the next phase depends on. That is the whole idea: a phase boundary is not a status change, it is a completeness check.

Strategic Spec Sprint Implementation problem, goal → design, criteria, → code, tests, priority task breakdown review, deploy

each arrow is a Gate a person holds

Two consequences follow.

Thin input produces confident nonsense downstream. An agent given half the context does not refuse; it fills the gap. So the cost of a weak phase boundary is not a delay, it is plausible output that a reviewer has to catch.

This is not theoretical. The PR Validation agent was disabled during the pilot because information progression was not understood well enough at each state, and it needed inputs from impact analysis that were not reliably present. Getting 5.6 and 5.7 written is what unblocks it.

The phase definitions, entry and exit criteria, and the gates are in section 5.

4.3 Agents and automation
Two categories, separated by what a component is for rather than by how much it is trusted. This changed on 12 August. The earlier split was by trust level, Core against Community and Experimental. The catalogue now groups by function instead.

Category	What it is	Governed by
Core Agents (18)	The agents that do delivery work, across Strategic Planniny, Spec Sprint and Implementation.	The AI Governance Team sets the standard and holds the promotion gate. Each agent has a named Agent Owner.
Platform and Supporting (3)	Infrastructure and shared capability rather than delivery work. The Main Orchestrator, the Agent Run Logger skill, and Design Capture.	The same standard and the same named ownership. Not counted in the 18 because they do not perform a phase of delivery.
The distinction is scope of purpose, not level of trust. Two of the three Platform and Supporting components sit at Optimising, the highest maturity band in the model, so treating them as a lesser tier would be wrong.

Minimum guardrails apply to anything that runs. Credentials scoped to what the agent needs, no unattended writes to a System of Record or to main, and every run logged. These were written for the community tier and they hold regardless of category.

The dependency rule. A Core Agent may not depend on an ungoverned component. If it needs one, that component is brought under governance first, or the dependency is explicitly governed. Harvester Spawner is the worked example: Backend Implementation depends on it in WS2.

Where an agent a team builds itself lives. Personal and local use is allowed, and a team may deploy to its own infrastructure. It does not go into the shared agent repository. Existing team-built agents are kept, and there is an activity to understand what they added and absorb it where it is worth absorbing. The full position is in 9.3.

One agent set, adopted first. Teams do not build their own agents in place of the Sirius set. The reason is traceability rather than control: when something breaks you need to be able to tell whether it was the workflow, the agent, the config or the person, and that becomes impossible if every team runs a different set. The full position, including what a team may still build for itself, is in 9.3.

Where an agent runs: Cloud or Local. Cloud means the agent is deployed and connected to our tools. Local means a person invokes it on their own machine. In-transition marks a move to Cloud under review.

Neither means unattended. Every agent run begins with a human act: a status transition, a comment, a push. That is a governance strength rather than a limitation.

4.4 Tools, data and integrations
Operations holds the configuration. What belongs here is the principle each integration has to satisfy.

Principle	Why
An agent reaches a tool through governed wiring, not ad hoc credentials	So “what can this agent reach” has an answer that does not require reading code
Credentials are scoped to what the agent needs	The current boundary for code-writing agents is the bot token’s repository scope. Real, but coarse: the agent can do anything that token can do
Every inbound event is recorded before it is validated	Rejected and ignored events persist too, so “did that ever reach us?” is answerable without guessing
A run reads a frozen copy of its configuration	Editing config while work is queued cannot silently change a run already in flight. Change control enforced by the runtime rather than by asking people to be careful
Names are checked against real data, never taken from the model’s memory	A model will confidently invent a component name that does not exist
The systems of record are Aha!, Jira, Breeze, Qase and GitHub. The tool list, who uses each and what it is for, is in section 11.

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

6
Sirius Knowledge Foundation
If an agent seems to be answering from nothing, this section is where to look first. Most knowledge problems present as a quality problem somewhere else — a vague draft, an analysis that misses half the repository — and are read as a bad agent rather than an empty lookup.

6.1 Why knowledge matters
An agent is only as good as what it can look up. Two fact libraries serve different halves of the lifecycle, and the split matters because citing the wrong one produces confident nonsense.

Library	Holds	Used
Crux	Product signals and insights, each checked by a person before an agent may cite it. Fed by what shipped: product analytics and usage measurement after release	Before the Epic. Product evidence
Breeze	The system model: Functional, Design, Architecture, Code	From the Epic onward. System truth
6.2 Organizational knowledge
Breeze is read and written, and four agents share one record per ticket. This is a correction: until the 28 July platform audit, the position here was that nothing wrote into Breeze. It does now, and the sequence matters because each step depends on the one before.

When	Agent	Effect on the graph
Before work starts	Impact Analysis	Writes the ticket's ontology record — which functional, design, code and architecture nodes the change should touch, each classified new, existing, update or delete.
While work is planned	Task Context, Design Context, Task Creation	Read it as their scope source, via the Breeze Scope Manifest field on the ticket.
On every push	PR Validation	Checks the diff against it and marks the nodes the pull request actually delivered as ready to merge.
After the merge	Pre-Merge	Reconciles: remaps nodes that turned out to be duplicates onto existing graph ids, records what shipped, and re-indexes the repository's code ontology.
Two consequences follow. The per-ticket Breeze record is the longest-lived shared object in the pipeline, so a bad impact analysis is not a bad document, it is a bad foundation that three later agents build on. And Breeze behaves as a System of Record, not a read-only reference, which is why the Human-Driven principle applies to it: what an agent writes there should be reviewable.

One rule worth generalising. Component and token names are checked against real Breeze and repository data, never taken from the model’s memory, because a model can confidently invent names that do not exist. Any agent that names things should be built this way.

6.3 Ontologies
An ontology is the schema — what kinds of thing exist in a product, and how they relate to each other. It says that a page contains components, that a function lives in a file, that a scenario is made of steps. It holds no facts about any particular product; it is the shape those facts will take.

It matters here for one reason: an agent can only reason about relationships the schema knows how to express. Where the schema has no way to say that two things are connected, no amount of scanning will find the connection.

6.4 Knowledge graphs
A knowledge graph is that schema filled with one product's facts. The same ontology, populated: these pages, these components, these files, these functions, and the real links between them.

Four graphs exist per product, and they answer different questions.

Graph	What it holds	Who reads it
Functional	Personas, outcomes, scenarios, steps and actions — what the product does for someone	Impact Analysis, Feasibility, the Epic Agent Suite on a deep run
Design	Journeys, flows, pages and components — how it is put together on screen	Impact Analysis, Design Context, Acceptance Test
Code	Files, classes and functions	Impact Analysis, Task Context, PR Validation
Architecture	Services, gateways, queues and data schemas	Impact Analysis, Feasibility, Architecture Implementation
A graph is a claim about the product as it is, not as it was designed. It is rebuilt from the real repository and the real screens, which is why a graph that has not been reindexed after a merge quietly answers yesterday's question.

6.5 Breeze
Breeze is the system that builds and serves the graphs. One product's four graphs live behind one project, and an agent reaches them with a key that has to be entitled to every project it might touch.

Two agents call Breeze at runtime, and knowing which two explains a lot. Feasibility scans it to size a ticket, and Impact Analysis scans it to produce the impact report. Everything downstream reads that report, through the Breeze Scope Manifest field on the ticket, not through Breeze itself.

So the live dependency is narrow and the derived one is wide. A team whose Breeze access is broken does not see nine agents fail; it sees two agents produce nothing useful and seven more build confidently on what they produced. 5.7 shows which agent reads which graph, and what it leaves behind.

The failure mode is silence, and it is the one to know. A team whose Breeze access is not connected will find Impact Analysis, Task Context and Feasibility running with nothing to read — and reporting success anyway. Worse, a stale connection makes the tools invisible to the agent rather than returning an error, so a deep run produces confident, ungrounded drafts and nothing anywhere says so. If output quality drops suddenly across several agents at once, check the connection before you check the prompts.

How to tell whether a graph is current. Compare the Breeze project's last index time against the last merge to main. If indexing is behind, Impact Analysis is scoping against a codebase that no longer exists and every agent downstream inherits it. Worth checking before a Spec Sprint rather than during one.

Crux is where the loop closes. Product analytics and usage measurement on a release feed it, a person checks each signal, and the next idea is argued from what the last one did. That is why the phases are a cycle rather than a line: Strategic does not start from nothing, it starts from the measurement of the previous release. A team with no analytics reaching Crux still runs the workflow, and runs it on opinion.

Crux is a second graph, and it is not Breeze. It is also more than a store: a discovery agent gathers the evidence and a separate query engine serves it, which is why what lands there is proposed by a machine and approved by a person rather than typed in by hand. It holds product evidence upstream of an Epic — the signals a claim is validated against — and the Epic Agent Suite queries it before its discovery context. Breeze holds the system; Crux holds the evidence for wanting to change it.

6.6 Relationship with AI agents
A scan runs in two passes: search all four graphs in parallel, then re-query to bridge design, code and architecture using what the first pass found. One bias is built in: prefer updating an existing thing over creating a new one. If a layer fails, that layer degrades to limited visibility rather than failing the whole scan. Worth knowing when reading a confident-looking analysis.

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

8
Recording Feedback on Agent Performance
This is the mechanism by which agents improve, and it is how promotion evidence gets generated. Without it, no agent’s maturity can be evidenced and the whole progression model is decorative.

Owner: Delivery. The Agent Run Logger sits with Delivery: the GDH Delivery Lead or the Delivery Coach.

8.1 How a verdict is recorded
Feedback is captured on the run detail page of the Sirius dashboard — the web view of the platform where every run appears, described in 13.5 — one verdict per run, by whoever reviewed the output. Six fields:

Two routes record the same verdict. On the dashboard, through the form described below. Or in a ticket comment, using the platform's command grammar — @<agent-handle>;accept;<hours>, ;refine;<feedback>, or ;rework;<yes|no>;<kg|ag|hg>;<feedback>, where the middle field says whether a hallucination came from the knowledge graph, the agent, or human input. Both write the same Agent Run Logger fields. Use whichever is closer to where you already are.

A local agent reaches the same record through the Run Logger plugin, which writes each run locally and publishes it on sync. Connecting it is a setup step at 13.2 rather than something the agent does for itself, and an unconnected local agent leaves no run for anyone to judge.

The hours on ;accept are required and never defaulted, which is deliberate: the manual-time figure is the whole basis of the time-saved measure, and a default would quietly fill it with a fiction.

8.2 Required information
Six fields. Four are typed by the reviewer; the rest come from the run.

Field	What it records	What it feeds
Verdict	Accept or rework	Agent Acceptance Rate and rework rate — the primary trust signals
Manual work, in hours	What the task would have taken by hand. Hours, decimals allowed — a quarter of an hour is 0.25, five minutes is 0.08. The dashboard's 5m/10m/30m buttons fill the box for you, but the box itself is hours, so typing 30 after seeing a 30m button records thirty hours. Stored in seconds, which is why some tooling reports it that way	Time saved, and the reinvestment conversation
Hallucination flag	Whether a rework was caused by the agent inventing something	Separates wrong from not good enough. Only the first is a trust problem
Hallucination layer	Which layer it came from — knowledge graph, agent, or human input	Points the fix at the right place. Most early rework traces to thin input, not a bad model
Notes	Free text	The qualitative record an Agent Owner actually reads
Token count	Captured automatically, bucketed per call	Cost per accepted output
At most one accepted run per subject. A ticket cannot accumulate several accepted runs. This is what makes the Agent Acceptance Rate computable rather than gameable: the measure is one verdict per piece of work, not one per attempt, which is why the denominator at 12.3 is work items.

Tagged at review time, not later. This is the load-bearing detail. A verdict recalled a week afterwards is not evidence, and the floors in 3.8 are meaningless if the numbers behind them are reconstructed from memory. Thirty seconds at the point of review, or the whole progression model is decorative.

8.3 Feedback workflow
Step	What happens
1	Run	An agent produces output. The run appears in the dashboard with its status, duration and token count already recorded.
2	Review and tag	The person who needed the output decides. Accept or rework, manual work in hours, hallucination flag and layer if relevant, notes. On the run detail page, at the time of review.
3	Accumulate	Verdicts collect against the agent, per team, per sprint. No separate reporting step — the record is the report.
4	Read	The Agent Owner reviews their own agent's verdicts and notes each sprint. This is the only route by which rework becomes a prompt change.
5	Decide	The AI Governance Team reads the same evidence at the promotion gate. Nothing is re-collected for the gate; it consumes what step 2 produced.
Per sprint, matching the maturity review. Weekly is too often for a low-volume agent and monthly is too slow for one in Testing, so steps 4 and 5 run on the sprint boundary. This is one of the items running on the GDH Delivery Lead's proposal pending Governance review — see 9.3.

8.4 Ownership
Owner: Delivery. The Agent Run Logger sits with Delivery: the GDH Delivery Lead or the Delivery Coach.

Who	Responsible for
HITL, whoever ran the agent	Tagging the verdict. Not optional, and not delegable — the person who needed the output is the only one who can judge it.
Agent Owner	Reading the verdicts on their own agent and acting on the pattern. Responding to rework with a change, or explaining why not.
Delivery Coach	Whether tagging is actually happening, and chasing it when it is not. An untagged pipeline looks identical to a healthy one until the gate.
AI Governance Team	Consuming the evidence at the promotion gate, and demoting where it has degraded.
8.5 Closing the loop
Feedback that goes nowhere stops being given, so the loop has to visibly close. Two routes, and they are different:

A prompt or behaviour change goes through the Agent Owner as a pull request, per 9.2. The mechanism is review, not a committee. The person who raised the rework can see the change land.

A pattern across teams goes to the AI Governance Team, because one team's rework may be another team's normal. This is where a Twin Ambassador earns their place: they see their discipline across teams and can tell the difference.

Agent Memory learns from this feedback, and that needs watching
Agent Memory records what happened during a run and can recall it later, so an agent's behaviour shifts between runs without a change-control event. That is prompt control by another name and deserves the same scrutiny.

It does not learn from your verdicts. An earlier design promoted preferences from human feedback automatically. It was never built, and the platform pages that still describe it are out of date. Memories are written by agents from what occurred during a run, never from an Accept or a Rework — which matters, because a team that believes its verdicts silently retrain the agent will decline to turn memory on.

Five things reduce the risk, and all five are real:

Memory is opt-in per team, per agent. It is off unless a team turns it on, so no team inherits it by surprise.
It is always best-effort and never fails a run, so it cannot break work.
Every recall is audited — retrievals are recorded, and recalled memories are visible on the run detail page under Context. A reviewer can see what the agent was told.
A bad memory can be removed. Each recalled memory on the Context tab has a Mark irrelevant action, and there is an age-based sweep that forgets old facts. There is no edit, deliberately — a memory records something that happened, so the options are keep it or forget it.
Nothing human-authored can be written. Memories are written only by agents, from things that occurred during a run. The platform has no add endpoint, on the reasoning that a human-authored "memory" would be a configuration value in disguise, and those belong in config or in a prompt.
Secrets and personal data are stripped before anything is stored, and a per-team cap limits how much accumulates.

9
Sirius Governance
9.1 Governance structure
The AI Governance Team owns the standard, the promotion gate and the audit cadence. It does not own daily operation. Agent Owners stay accountable for their own agents so the gate does not become a bottleneck.

One thing Governance must not become. If Governance ends up running twenty-one agents day to day, it becomes the queue everything waits in, and tribes route around it. That is how governance gets ignored.

Who the AI Governance Team is: the Hub and Twin Ambassadors, plus Sirius Platform Engineering. Rather than standing up a new body, governance is carried by the two ambassador roles.

Hub Ambassadors hold the standard within a tribe and keep it coherent across tribes: the Tribe Solution Architect and the GDH Delivery Lead. Twin Ambassadors are the Agent Owners, one per discipline — backend, frontend, UI/UX, QA, architecture, product — who know their agents well enough to speak for them at the gate. Sirius Platform Engineering, which builds and operates the platform, sits within the team rather than outside it.

Defining the Hub Ambassadors by role rather than by name is what makes this repeatable. Every tribe already has a Solution Architect and a GDH Delivery Lead, so a tribe joining the rollout knows who its ambassadors are without a negotiation.

Including Platform is deliberate. A gate designed without the people who run the platform tends to set criteria the platform cannot evidence, and a standard that cannot be measured is a standard that quietly lapses.

The reason to do it this way rather than create a separate committee is that these are already the people a team turns to. A governance body made of people close to the work does not need a translation layer to reach it, and it does not need to be stood up.

Two phases.

Membership	Purpose
Phase 1	Every current Sirius Agent Owner. All 21 are named in section 10	Get the review mechanism working with the people who already know the agents
Phase 2	Adds representatives from other regions, invited by the sponsor	Fairness, shared ownership, and coverage across time zones. Additive. It does not replace existing Agent Owners
Why regional coverage rather than a single owner per agent. An agent may have three representatives across US, Europe and APAC, so a failure at 2am for one team does not wait until the single owner wakes up. This is the practical reason the model is additive.

9.2 Governance roles and forums
The mechanism is PR review, not a committee. You want to change an agent, you raise a request, the Agent Owner reviews it, it is merged or it is not. Familiar, fast, and it leaves a trail.

Reviewing an agent's output is not a role anyone is appointed to. The Human In The Loop (HITL) is whoever is using the agent. You ran it, so you review it, and you tag the outcome — accept or rework — at the point of review rather than later. Two reasons this is the right default: the judgement is made by the person who actually needed the output, and the reviewing population grows with adoption instead of becoming a queue.

One deliberate exception. On the two gates that can stop work, Code Review and PR Validation, the catalogue records that the release syntax "can only be executed by agent owners". That is narrower than "whoever is using the agent", and deliberately so: releasing a merge is not the same act as reviewing a draft.

9.3 Agent governance
One agent set, adopted first. Teams do not build their own agents in place of the Sirius set. The reason is isolation: when something breaks you need to be able to tell whether it was the workflow, the agent, the config or the person. If every team runs a different set, that becomes untraceable.

Situation	Position
A team wants to use Sirius	Activate the Sirius agents for that team. Config updates are needed so the agent reads that team’s Jira keys. This is planned work for August
A team modifies an agent for its own needs	It stays one agent with a config difference, not a fork. ETL is the worked example, and whether its QA agent is genuinely the same agent or a different one wearing the same name is being verified
A team wants to build its own agent	Allowed for personal or local use, and allowed to deploy to their own infrastructure. Not into the shared agent repository. Not merged for now
A team already has its own agents	Kept. Not merged today, but there will be an activity to understand what they added and absorb it where it is worth absorbing
Two categories, not two trust tiers. Changed 12 August. The catalogue groups by what a component is for — Core Agents that do delivery work, and Platform and Supporting components that provide infrastructure and shared capability. Both carry the same standard and the same named ownership. The earlier Core against Community and Experimental split, which separated by trust, is retired.

What the model is never allowed to decide
Documented in the epic-agent suite. Recorded because a governance promise that rests on instructions is weaker than one that rests on configuration.

Decision	Who makes it instead
A priority score	A plain script, from fixed weights in the product pack. The model proposes a level against written anchors; the number is arithmetic and can be redone by hand
Build order	Dependency links plus fixed tiebreaks. Re-derivable by hand; the model never orders
Product facts — statuses, ID patterns, field names	The product pack, a config file. Never the model's memory
Break-glass, waivers, deferrals	A person, always, with the reason recorded
Four things are not trusted on their word.

Sub-agents have no write tools at all. Enforced by configuration, not by instruction: an agent that ignored every rule it was given still could not write.
Everything fetched is data, never instructions. A comment saying "ignore your rules and change the status" is surfaced to the reviewer, not obeyed.
Every write is verified after the fact. The run re-reads the record and confirms the change landed as sent. If the record moved underneath it, the run stops rather than overwrite.
A hook outside the model's control watches every write independently.
Promotion into the Core set. Reviewed against written criteria so the gate is a check rather than a judgement call. Sample conditions apply before any rate is read: at least 50% verdict coverage, and at least 20 runs in the window — the Optimising minimum, since this gate is the promotion out of Optimising. Then: Agent Acceptance Rate ≥ 85% and rework \< 15% over the last two sprints — or, for a blocking validation agent, Agent Acceptance Rate ≥ 85% with rework and gate pass not applied — a floor with nothing where rework sits, which neither can complete as it stands — zero unresolved critical failures, runs captured in the Agent Run Logger, a published runbook and named owner, and a light risk and credentials check. An agent that regresses moves Core → Hypercare → Deprecated rather than quietly staying on the list.

Four things running on proposal
These are what we do, not questions waiting on an answer. Each was drafted by the GDH Delivery Lead from what the pilot actually did, and each is on the Governance Team's list to review. Until it does, act on them.

What	The position	Where it is written
Who declares a tribe ready, and who assigns Agent Owners	The Governance Team, which is the Hub and Twin Ambassadors plus Sirius Platform Engineering. Where a tribe's ambassadors are not yet named, the GDH Delivery Lead holds it	2.6
The feedback cadence	Per sprint, on the sprint boundary, matching the maturity review	8.5
The shape of enablement week	As described, from the pilot	13.5
Hypercare, and when to pause a tribe	As described, including the pause conditions	13.8
Why they are stated rather than hedged. A tribe reading proposed on the section describing its own enablement week cannot act on it, and would reasonably ask what it is being enabled on. A proposal that everyone follows is the operating position, and saying so is more honest than a qualifier nobody intends to wait for. If the Governance Team changes any of these, this section changes with it and the tribes are told.

Gate agents are exempt from auto-graduation. An agent holding a permanent human approval point, Code Review being the worked example, is recorded as gated rather than graduated even when it meets the Optimising floor. That is by design, not a maturity deficiency.

9.4 Documentation governance
Markdown in git is the source. Confluence publishes for readers. A merge is an approval. Status is carried by git rather than by a field maintained by hand. Every decision is recorded with what was rejected and why, because the most useful thing six months later is knowing which option already lost.

9.5 When it goes wrong
The position, held by the Tech Delivery Director: there is no rollback path, and returning to non-AI development is not an option. When a challenge appears, it is resolved and the programme moves forward.

That is a legitimate sponsor decision and it is recorded here rather than left implied, because a guideline that stays silent invites a reader to assume a rollback exists.

Untrusted input reaching a privileged agent
Agents are triggered by comments and status changes, which anyone with ticket access can create. Code-writing agents hold a bot token. So untrusted text can reach a privileged actor, and that has to be addressed rather than assumed away.

It is partly addressed, by controls rather than by a stated boundary. The platform documents no webhook signature verification, which is an explicit choice. What it does document as security-relevant is narrower and more concrete than a boundary statement:

Per-team credential isolation. Each team's credentials are referenced by their own environment prefix, and a missing variable fails the container at boot rather than silently falling back to another team's identity and writing to the wrong site.
Dashboard access behind OAuth, optionally gated on organisation and team membership.
Nothing merges itself. Pull requests stay in draft; the merge is a human act.
Read-only cloud access for the architecture agent, with a deterministic scan that hard-fails on hardcoded credentials or destructive infrastructure commands.
Secrets stripped before anything enters agent memory.
Bot self-loop guards, so an agent does not react to its own writes.
Three consequences, better read here than discovered later:

The boundary is the token scope, and it is coarse. An agent can do anything its token can do. There is no per-agent permission model.
Anyone who can comment can trigger a run. Deduplication catches redeliveries, not two people asking within minutes of each other. The practical exposure is cost and concurrency rather than intrusion.
It holds only while network placement holds. If any part of the platform becomes externally reachable the posture no longer stands, and nothing in the application enforces that — the operator's reverse proxy decides what is exposed.
For a receiving team: nothing to configure, and one thing to know. Do not expose a Sirius container publicly, and treat bot token scope as the security boundary it actually is.

What does exist. Individual agents can be disabled. PR Validation was disabled during the pilot so it would not block everything else. So an agent-level off switch is real in practice; what is missing is the documented procedure for using it.

10
Agent Catalogue
10.1 List of agents
18 Core Agents plus 3 platform and supporting components. Each is recorded as Cloud or Local, which says where it runs and not how much supervision it needs. Every agent name links to its runbook, in the companion Runbooks document.

Why 18. The consolidation register holds 24 entries. Five are retired during consolidation: Discovery and Prioritization are now modes of the Epic Agent Suite, Database Implementation merged into Backend Implementation, Merge Validation folded into Code Review, and Deployment is replaced by GitHub Actions CI/CD. A sixth entry, a duplicate listing of the Harvester Spawner, was removed. That leaves 18.

The roster is held in this layer rather than only in Confluence, because Hubexo runs several Atlassian tenants and most readers cannot open the source pages. Confluence stays the source for which agents exist and who owns each one. On everything else, treat this document as the more current record: at the time of writing the Confluence catalogue still shows 19 agents, the trust-based tiers retired on 12 August, and Sprint Planning as a cloud agent. Where the two disagree on something you are about to act on, raise it at the service desk rather than picking one.

Read the maturity column with its date. Every band in these tables was assessed in the same month, which is why the date sits in the column head rather than in each cell. A band is earned from logged evidence and it goes stale — the date says when it was last assessed, not when it was last true. Not assessed carries no date and means exactly that: either no runs have been logged, or the agent produces nothing a reviewer scores.

Strategic
#	Agent	Purpose	Runs	Owner	Maturity
assessed Jul 2026
1	Epic Agent Suite	Creates, scopes, breaks down and gates epics and features in Aha!, through two lanes that share one engine. Configured per product with a product pack. Its runbook covers each lane separately	Cloud & Local	Alex Evans	Establishing
2	Feasibility and Effort Estimation	Estimates a ticket's T-shirt size for a 2 to 5 developer team, using Breeze context. A standalone agent, and it re-runs automatically after an epic commits	Cloud	Andri Ferinata	Establishing
Spec Sprint
#	Agent	Purpose	Runs	Owner	Maturity
assessed Jul 2026
3	Spec Refiner	Rewrites a messy Epic or Story description into one clean specification on a [00-MAIN] child ticket. Runs before everything else — the manifests the next three agents read do not exist until it has	Cloud & Local	Faisal Murkadi	Not assessed
4	Impact Analysis	Analyses a ticket's impact and scope across repositories via the Breeze knowledge graph; publishes an impact manifest	Cloud	Andri Ferinata	Establishing
5	Design Context	Turns an Epic into the UX and UI design brief, as a child task	Cloud	Maureen	Not assessed
6	Design Creation	Builds the prototype, the developer handoff and the change log in the design repository, and opens a pull request	Cloud	Maureen	Not assessed
7	Task Context	Builds the Task Context Manifest from the Breeze scope manifest and the ticket	Cloud	Andri Ferinata	Establishing
8	Task Creation	Generates child tickets from the context manifest	Cloud	Faisal Murkadi	Establishing
9	Acceptance Test	Generates acceptance test cases and edge cases in Qase. For ETL and Harvester, acceptance criteria cover this instead	Cloud	Wesly	Establishing
Implementation
#	Agent	Purpose	Runs	Owner	Maturity
assessed Jul 2026
10	Sprint Planning	Recommends sprint scope, reviewed against Delivery Manager judgement. Local only — the cloud worker was withdrawn and the agent runs from Claude Code	Local	Faisal Murkadi	Not assessed
11	Architecture Implementation	Produces architecture suggestions and Terraform, as a draft pull request. Advisory: it never applies anything	Cloud	Muhammad Iqbal	Not assessed
12	Backend Implementation	Implements backend tickets end to end: propose a spec, wait for a person, then write code on a branch as a pull request	Cloud	Ardall Niswar	Establishing
13	Frontend Implementation	Implements frontend tickets, on the same propose-then-build shape	Cloud	Fitzgeral	Establishing
14	Code Review (validation, blocking)	Reviews backend and frontend pull requests, and runs the branch-policy check first. Advisory — see the note on the merge gate below	Cloud	Ardall Niswar	Optimising
15	PR Validation (validation, blocking)	Validates pull request scope against the Breeze impact analysis. The only agent that sets the merge gate	Cloud	Andri Ferinata	Establishing
16	Pre-Merge (validation)	Reconciles the knowledge graph after a pull request merges	Cloud	Andri Ferinata	Establishing
17	QA Agent (validation)	Full QA pipeline: codegen, runner, healer, defect, pull request	Local	Arief Rahman Hakim	Establishing
18	Harvester Spawner	Harvests and scrapes source data for the Harvester pipeline; folding into Backend Implementation. Backend Implementation depends on it in WS2, so the dependency rule applies	Local	Ichsan Nuur	Establishing
Platform and supporting
Infrastructure and shared capability. Not counted in the 18, and not assessable on the maturity ladder — none of them produces an output a reviewer accepts or reworks, so there is no rate to read.

#	Component	Purpose	Runs	Owner	Maturity
assessed Jul 2026
19	Main Orchestrator	Coordinates the pipeline and triggers agents by status transition and webhook. The former phase orchestrators are retired into it and now run as agents	Cloud	Andri Ferinata	Not assessed
20	Agent Run Logger (skill)	Records every run — agent, task, time, accept / refine / rework, tokens. The evidence backbone for maturity and BAU	Cloud & Local	Fiesta Rasyid	Not assessed
21	Design Capture	Captures what production looks like today, so design work starts from the real thing rather than a blank page	Local	Maureen	Not assessed
What the evidence says, as against what the bands say
The bands above come from the Progression Status database and were set in July. The Graduation Log measures the same agents against the floors at 3.8, per graduation period, and its most recent period says something harder.

No agent passed the gate. Not one, across 584 runs and 15 active agents. And the reason is mostly not quality.

What blocked it	Agents
Not gateable — under 50% verdict coverage, so no rate can be read	Epic Agent Suite, Feasibility, Design Creation, Backend Implementation, Code Review, PR Validation, Pre-merge, QA Agent
Failed on rate — enough evidence, and it did not clear the bar	Impact Analysis, Task Context, Task Creation, Acceptance Test
Insufficient sample — passing so far, on too few runs to count	Design Context, Frontend Implementation, Harvester Spawner
Code Review is the one to understand. It shows Optimising above, it passed the two previous periods, and on rate alone it would have passed again at 100% accept. It did not pass, because coverage fell from 70% to 23% while volume stayed high. Used more, judged less. That is the coverage floor working, not the agent regressing.

PR Validation ran 46 times and not one run carries a verdict. Pre-merge, 5 runs, none tagged. Both are new, and a new agent with no verdicts is the normal shape of the problem rather than an unusual one.

The honest summary for an adopting team: the pipeline is being used considerably more than it is being judged. Tagging is thirty seconds at the point of review, and it is the only thing standing between this catalogue and a set of numbers nobody can defend.

Two agents are measured differently
Code Review and PR Validation are marked blocking. They judge someone else's work and stop it, and that changes what a verdict on them means. Their output is not an artifact — it is a decision about somebody else's artifact. Asking whether it was sent back for rework records the submitter's reaction to being rejected, and a stricter gate would score worse for being stricter.

So for those two, rework rate is not read at all, and nothing yet stands in its place. Gate pass rate does not apply to them either, since it asks whether a run cleared its gate and these agents are the gate. Agent Acceptance Rate and the coverage floor apply unchanged. See 3.8.

The exemption follows the behaviour, not the label. Pre-merge and the QA Agent carry the same validation word and neither blocks anyone: Pre-merge reconciles the knowledge graph after a merge, and the QA Agent writes test code and opens a pull request. Both produce something a reviewer accepts or sends back in the ordinary way, so both keep the standard three. A rule written against the word rather than the behaviour would have exempted them by accident and thrown away real signal.

What no measure will fix. On a blocking agent the submitter is usually the only person in the loop, so the verdict is being asked of the party with the least distance from it. Whatever replaces rework here will narrow that rather than close it: the underlying problem is who reviews, not what is counted. Worth naming rather than treating as solved.

What starts each agent, and how to tag its run
A newcomer's first two questions are how do I set this off and how do I record what I thought of it. The roster above answers neither, so they are here.

The comment grammar is the same for every cloud agent: @<handle>;accept;<hours>, ;refine;<feedback>, or ;rework;<yes|no>;<kg|ag|hg>;<feedback>, where the middle field of a rework says whether the hallucination came from the knowledge graph, the agent, or human input. The hours on accept are required and never defaulted, for the reason given at 8.1. A verdict can always be recorded on the dashboard instead, and for the agents with no grammar below, the dashboard is the only route.

The status names are the pilot's Jira names. A team on Azure DevOps maps them onto its own board columns; the transition matters, not the label. Getting that mapping written down is a setup item at 13.2.

The handles are defaults, not constants. Every one is a per-team setting in the platform's team configuration, so a tribe can rename them. If a handle here does nothing, check what your team's configuration calls it before assuming the agent is down.

#	Agent	What starts it	Verdict in a comment
1	Epic Agent Suite	Local /agent-create-epic, /agent-update-epic. Cloud @epic-agent;scope ;seed ;harvest ;commit ;prioritise	Dashboard
2	Feasibility and Effort Estimation	@feasibility-agent;start	@feasibility-agent;refine;<feedback> · ;rework;<feedback>
3	Spec Refiner	Aha! Awaiting Epic Commit → Jira Incoming. Local /spec-refiner <ticket_key>	Dashboard
4	Impact Analysis	Incoming → Impact Analysis	@impact-analysis-agent;…
5	Design Context	Impact Analysis → Design Context	@design-context-agent;…
6	Design Creation	Design Context → Design Creation	@design-creation-agent;…
7	Task Context	Design Creation → Task Context	@task-context-agent;…
8	Task Creation	Task Context → Task Creation	@task-creation-agent;…
9	Acceptance Test	Task Creation → Test Case Creation	@acceptance-test-agent;…
10	Sprint Planning	/sprint-planning, local only	Dashboard
11	Architecture Implementation	Jira comment @architecture-agent <context>	@architecture-agent;… on the pull request
12	Backend Implementation	Ready for Dev → WIP, or @be-agent on the ticket	@be-agent;… on the ticket or on the pull request
13	Frontend Implementation	Ready for Dev → WIP, or @fe-agent on the ticket	@fe-agent;… on the ticket or on the pull request
14	Code Review	A pull request is opened	@code-review-agent;… — agent owners only
15	PR Validation	A pull request is opened	@pr-validation-agent;accept;<hours> releases the merge gate — agent owners only
16	Pre-Merge	A pull request is merged	Dashboard
17	QA Agent	/qa-agent <work item key> for the full flow	Sub-commands /qa-agent-codegen, -run, -heal, -defect, -pr <ticket_key>
18	Harvester Spawner	CLI mandor <source> <site-url> <proxy-country> <mode>	Dashboard
One of these needs care. On Code Review and PR Validation, the restriction to agent owners is not a formality — it is what stops a rejected submitter recording a verdict on the agent that rejected them. See 3.8 on why rework is not read on those two.

10.2 Agent overview per agent · the runbook template
Every agent going to BAU or Hypercare needs a runbook. Fifteen fields, lightweight by design.

Eleven plus four. The first eleven are the BAU and Hypercare criteria. Four were added because every runbook that omitted them left the same questions open: Input, because a runbook that does not say which source wins is unusable the moment two disagree; Re-run safety, because the first thing anyone asks after a bad run is whether they can run it again; Known gaps, because what is specified but not working is what actually costs a team a day; and Source, because a runbook is accurate on its stated date rather than today.

A count you will see elsewhere. The Strategy Agent Suite runbooks say fourteen fields and mean a different fourteen — theirs carries Syntax and splits Model from Version, and has no Re-run safety, Known gaps or Source. Neither set is wrong. Match the fields, not the number.

Field	What to capture
Purpose	One line: what the agent does
Owner / backup	Named accountable person plus one backup
Maturity / risk	Current band; is it a gate agent that keeps human approval?
Trigger	On which status, mention or command
Input	What it actually reads, and which source wins when two disagree
Prerequisites	What must be present for a clean run: context, repo access, tokens
Expected output	What it produces and where it lands
Review & logging	Who reviews; tag accept or rework plus manual time at review, not later
Common failures → fix	Top two or three failure modes and the first response
Monitor	Dashboard filter or link
Re-run safety	What a second run does. Idempotent, or does it duplicate?
Known gaps	What is specified but not working, and what is unverified
Source	Where this runbook was written from, and on what date
Escalation is one route, so it is not a field. Anything a runbook does not resolve goes to the Sirius Service Desk, linked from Still stuck in section 14. Onsite during an enablement week, ask an Ambassador in the room first; anything that outlives the week goes to the desk. A runbook names who owns an agent, and the desk is what makes the ask trackable — a question asked twice is how a gap in these documents gets noticed.

Runbook status
21 runbooks were written, one per component, swept from 45 Confluence pages: the platform documentation and its 20 child pages, the Epic Recipes guide and its 13 child pages, and the design agent folder. The 3 August draft recorded zero.

BAU requirement	3 Aug	Now
Published runbook	0	21 written, 7 linked from the catalogue
Named owner	1	22
Named backup	0	0
The remaining work here is connection, not authorship. Twenty-one runbooks exist and only seven are reachable from the catalogue a tribe would actually open. Linking the other fifteen is a short task and it is what makes the sweep useful to anyone outside this project.

What actually gates what
Of the agents in the chain, which ones can stop work. The answer is narrower than most readers assume, and the catalogue now marks four as validation agents.

Agent	What it gates
PR Validation	The merge button. Posting @pr-validation-agent;accept enables Merge. Fails closed.
Code Review	The hard gate before merge, so it keeps human approval. Its accept and rework syntax can only be executed by agent owners.
Pre-Merge	Runs after the merge and validates the PR Validation report. The name misleads.
Epic Agent Suite in local mode	Nothing saves to Aha! without an explicit yes.
Backend, Frontend, Architecture Implementation	Human approval before code is written. Architecture pull requests always stay draft.
Everything else	Advisory. Impact Analysis, Task Context, Task Creation, Sprint Planning, QA, Design Context and Design Creation gate nothing.
Four things no single source page shows
Finding	Why it matters for a tribe
Silent degradation is the default failure mode	Across Impact Analysis, Feasibility, Acceptance Test and Architecture Implementation, best-effort steps fail quietly and the run still reports success. A reviewer cannot tell nothing found from we failed to look. The pattern most likely to produce a confident wrong answer.
Measurement with no decision attached, in eight places	Context-drift scores with no threshold, feasibility estimates never compared against actual delivery, alarms with no owner, confidence grades marked for information only. A metric that cannot name its decision should be cut, not carried into BAU. Feeds section 12.
Two systems write to Aha! epics with opposite safety postures	The local Epic Agent Suite commands save nothing without an explicit yes and leave an audit comment. The cloud Epic Agent Suite writes automatically, with no approval and no audit comment. No page reconciles them, and both now sit under one name.
Accessibility is never verified	Design Creation records accessibility: skipped on every run because the checker does not exist. Honest, and it means nothing we ship has been checked.
One concrete trap before any tribe follows the onboarding page: its start-up command omits three agents the same page tells you to enable. A deployment following it verbatim gets runs stuck queued, with no worker and no error.

10.3 The runbooks
One page per component, in their own document. They are operational rather than explanatory — the fields at 10.2, filled in — so they live beside the Guidelines rather than inside them. Every agent name in 10.1 links straight to its page.

One component carries two runbooks. The Epic Agent Suite is operated through two lanes, and a runbook answers what do I need to switch this on and run it safely, which the two lanes answer differently: different doors, different gate registries, different prerequisites at the gate, and a field that is auditable in one lane and deliberately not in the other. Its page carries both, at 1a and 1b, with the differences set out between them.

It is still one agent, and the count is unchanged: 21 components, 21 runbooks.

Four things hold across all of them.

Four runbooks link to the owner's own guide — the Epic Agent Suite, Acceptance Test, Backend Implementation and the QA Agent. Those guides are the source. Ours is the fifteen fields for someone switching an agent on; the owner's is the full guide for someone learning it. Where they disagree, follow the owner's.

A runbook is accurate on its stated date, not today. The Source row names the document it was written from. Several describe agents that changed the week they were written, so where a runbook and its source disagree, the source wins.

accept means different things on different agents. On most it is a pure logging verb that records a verdict and starts nothing. On Acceptance Test it is the export step. On Architecture and Backend Implementation it starts the build. Same word, three effects, and each runbook says which.

Every local agent must be connected to the Agent Run Logger. Cloud agents are recorded by the platform without anyone acting. A local agent is not, so 13.2 makes the connection a readiness item: the run-logger plugin writes each run locally and publishes it to the team's Confluence page or wiki on sync.

Six entries in this catalogue run locally, in whole or in part: the Epic Agent Suite, Spec Refiner, Sprint Planning, the QA Agent, the Harvester Spawner and Design Capture.

One is known not to be connected. The Epic Agent Suite's own runbook records no central run log, no verdict tag and no manual-time capture, which is now a gap against the standard rather than a missing capability. The other five have not been confirmed either way, and confirming them is worth more than it sounds: an unconnected local agent does the work and leaves nothing to assess, so its maturity band can only ever read Not assessed.

A mention only starts a run when it is the first thing in the comment. Leading spaces are fine, nothing else is. This applies to every cloud agent, and it is the most common reason a team reports that an agent stopped working.

10.4 Operations
How a run actually happens. Every cloud agent follows the same path, and knowing it turns most "nothing happened" reports into a two-minute diagnosis.

#	Step	What it means when it goes wrong
1	Intake. A webhook arrives from Jira, GitHub, Bitbucket or Aha! Every inbound event is recorded, whether or not it leads anywhere	Nothing recorded means the webhook never arrived. Check the tool's own webhook configuration before anything else
2	Normalise. The provider-specific payload becomes one common event shape	
3	Hydrate. A Jira event is enriched with the full issue and its changelog before routing	A team on a separate Atlassian tenant needs this step configured for it, or hydration fails and the event stops here
4	Route. The event is matched to a team, then to an agent queue	Recorded as no match. Almost always a routing rule, not the agent
5	Snapshot. The team's effective configuration is frozen onto the run	
6	Run. The agent executes its graph and persists its outputs	The only stage where a model is involved, and the least common place for a failure
Configuration is frozen when the run is queued, not read while it runs. This is the trap that wastes the most time. Edit a team's configuration mid-run and the run continues on the values it started with, because workers read the snapshot rather than the live file. Change something, see no effect, conclude the platform ignored you — and the next run proves it did not.

Routing, and why a ticket reaches the wrong team
Three tiers, tried in order: the Jira project prefix, then the repository URL, then the default team.

Two consequences worth knowing. A prefix or repository URL already claimed by another team stops the platform starting rather than quietly overwriting, which is deliberate and is why a bad entry surfaces as an outage rather than as silent cross-talk. And a ticket that matches nothing lands on the default team, which is how work occasionally runs under someone else's configuration without anyone noticing.

Human gates, and the three answers
Where a phase declares a gate, the run stops and waits for a person. There are exactly three answers, and they behave differently.

Answer	What happens
Approve	The phase advances
Revise	The graph re-runs with your feedback injected, up to a configured maximum number of revisions
Revert	The phase fails
Every resolution is written as a decision record against the run, which is what makes the gate auditable rather than a conversation. Note the middle one: revise is not a comment, it is a re-run, and it consumes one of a finite number of attempts.

Branches, and why the pull request targeted the wrong one
Branch strategy is per team and keyed by the work item type — a bug branches differently from a hotfix. A strategy's base branch can be a literal name or a pattern resolved at queue time, which is how a hotfix finds the newest release branch without anyone editing configuration. Where a strategy names more than one target, the platform opens a pull request per target rather than one.

Strategy is sticky across phases. The first phase records which strategy, base branch and branch name it resolved, and later phases inherit exactly those. So a configuration change made between phases does not move a run that is already in flight. Same principle as the snapshot, and the same surprise.

The implement phase has four shapes
A team picks one. They are not interchangeable and the choice shows up in what a reviewer receives.

Variant	What it does
Test-driven	Writes a failing test, makes it pass, refactors, and runs the checks itself in a loop
Code generation only	Generates code and idiomatic tests for the detected stack and opens a draft pull request. Nothing is executed
Delegated	Hands generation, push and pull request to an external agent server, with a live checklist on the run page
SDK sandbox	Runs in a sandbox that reports its own true cost rather than an estimate
What a run costs, and why the number is an estimate
Token counts are measured; the money is calculated. The model provider returns tokens, never a price, so cost is always tokens multiplied by a rate held in the platform. Cached input is billed differently from fresh input — cheaper to read, more expensive to write — so two runs with identical token counts can cost different amounts.

One consequence for anyone quoting a figure: a model whose identifier the price table does not recognise silently inherits an older generation's rate. The number stays plausible and stops being right. The exception is the sandbox variant above, which reports a real cost that overrides the estimate.

Cost is counted across every run, not only the accepted ones. 12.4 explains why that is the honest denominator.

Where the deeper detail lives
Per-agent processing logic, the full interface, and the platform's own known challenges are in the Hubexo Agent Platform documentation, generated from the codebase and re-audited against it. This section carries what an adopting team needs without opening it. If that link will not open for you it is on a different Atlassian site; raise it at the service desk.

Source: the orchestration platform's own repository documentation, read 29 August 2026.

11
Tools Catalogue
11.1 The tools, and who uses them
In use, and confirmed in the platform. Every one of these appears both on the workflow board and in current platform material.

Tool	What it is for	Who uses it	Phase
Aha!	Product system of record. Ideas, Epics, Features. Sits upstream of Jira	PM, Product Owner	Strategy
Jira	Delivery system of record. Tickets, and the status transitions and comments that trigger agents. The most widely used tool in the pipeline — it appears in every phase	Delivery Coach, engineers, QA	All three
Breeze	The shared knowledge graph across four layers — Functional, Design, Code, Architecture. Read and written by agents. See Section 6	Agents; Solution Architect reviews	Strategy, Spec Sprint, Implementation
Claude (via AWS Bedrock)	The reasoning engine behind every agent. Not a tool a person opens in the Cloud agents — every agent call goes through Bedrock. Local agents reach it through Claude Code	Agents; engineers directly for Local agents	All three
Confluence	Where agent reports and manifests are published. Authenticated by the same token as Jira	All	Spec Sprint
Qase	Test case management. Where the Acceptance Test agent writes	QA	Spec Sprint, Implementation
Bitbucket and GitHub	Code, pull requests and CI/CD. main protected with code owners. GitHub Actions replaced the former Deployment agent	Engineers	Implementation
Playwright	End-to-end test execution, driven by the QA agent's five sub-agent phases	QA, SDET	Implementation
PostHog	Product analytics. Feeds the Discovery mode of the Epic Agent Suite, and the Measure step that closes the loop back to Strategy	PM	Strategy, Implementation
On the board, not yet in the platform
These appear in the workflow the tribe designed, and no current platform page describes them. That does not make them wrong — the board is a target design and the platform is what shipped. It does mean a team should not assume they are wired up.

Tool	Intended for	What we can say today
BrainGrid	Spec generation, Strategic phase	Named on the board and in the April design. Appears in no page of the Sirius platform documentation. Treat as intent
SonarCloud	Static code analysis at Code Review	On the board only. The code-reviewer agent reviews across four dimensions using language models, not static analysis
Cypress, Katalon	Testing and regression	On the board only. Current test execution is Playwright
Sentry & CloudWatch	Monitoring, feeding Measure	On the board only. No agent reads either today
Intercom	Customer signal into Strategic	On the board only
Crux	Product evidence library, human-approved before citation	Carried in earlier drafts of this section. Not on the workflow board and not in platform material. Needs Alex Evans to confirm whether it is live, planned, or retired
Figma is the one to look at twice. It is marked in red on the board, and the Design Context runbook of 10 August is unusually direct about why: the agent “does not produce Figma”, and older documentation saying it produces a Figma prototype “is stale and should not be relied on”.

The awkward part is that Figma is still a hard prerequisite on one code path — that path aborts outright without a Figma connection, while the other path never calls Figma and nothing downstream consumes it. The runbook itself calls the gate vestigial.

For a team adopting Sirius: you may be asked for a Figma connection you will get no value from. Resolve it rather than provisioning it.

Which tools a team actually needs
It depends on which agents you switch on, and that is the useful answer rather than a hedge. From the Platform Onboarding page of 5 August:

If you enable…	You need
Almost any agent	An Atlassian API token, and webhook configuration access. The platform is entirely webhook-driven — nothing polls
Any agent that touches code	Git provider credentials with repository scope
Feasibility, Impact Analysis, PR Validation, Pre-merge	A Breeze API key. Not needed for the implementation agents
PR Validation, Pre-merge	A Breeze project reference at each repository root, and GitHub — these two do not support Bitbucket today
Feasibility triggered from Aha! rather than Jira	An Aha! API token
Acceptance Test	Qase, in place of Breeze
Teams notifications on a gate	A Microsoft Teams incoming webhook. Optional, and outbound only — the card notifies, the decision happens on the dashboard
Onboarding a team is a configuration change, not a deployment. The platform is multi-tenant by design: a new team is an entry in one configuration file, its own scoped credentials, and a choice of which agents to enable. Two teams can sit on entirely different Atlassian instances side by side. That is the single most useful fact in this section for anyone estimating effort.

11.2 Operations
What has to exist before an agent can run, tool by tool. 13.2 is the checklist a team works through with owners and dates; this is what each item actually means.

Required setup
Four things, and the first three are requested from someone else.

What	Needed for	Notes
Model access in the cloud account	Everything	Enabled per region. A region without it fails every agent identically, which makes it look like a platform outage rather than a permission
An Atlassian API token	Jira and Confluence	One token serves both — they are the same account, different paths. Teams on their own Atlassian tenant get their own named credentials rather than sharing
A source-control webhook token	Any agent that touches a repository	Per repository you want agents to act on
A Breeze API key	Feasibility and Impact Analysis only	These are the two agents that call Breeze live. Everything downstream reads what Impact Analysis wrote onto the ticket, so this key is narrower than it looks
The webhooks, per tool
The platform is entirely webhook-driven. Nothing polls. So a missing subscription is not a slow agent, it is a silent one.

Tool	Endpoint	Events to subscribe
Bitbucket	/webhooks/bitbucket	Pull request created, updated, approved, changes requested, and comment created
GitHub	/webhooks/github	Pull requests, pull request reviews, pull request review comments, and issue comments
Jira	/webhooks/jira	Issue updated. Status transitions are what start the status-triggered agents
Aha!	/webhooks/aha	The native audit webhook. It fires on all account activity and the platform filters; no template authoring needed
Subscribe issue comments on GitHub or half the grammar stops working. Main-thread pull request comments arrive through that event and no other, so without it ;accept, ;refine and ;rework never reach the platform. Nothing reports a fault. The agent simply appears dead to anyone commenting on a pull request.

Jira needs two fields adding
Neither is created for you, and one of them is load-bearing.

Field	Type	What writes it
Task Context Manifest	Rich text	Task Context writes its output here. Without the field the agent has nowhere to put its result
Agent Status	Single select, with values for in-progress and ready-for-review	Agents flip it to signal lifecycle. Best-effort: a missing field never fails a run, so its absence shows up as a board that never moves rather than as an error
The Breeze project mapping is set against a product field, and 13.2 flags the part that surprises people: it is one shared file rather than one per team, so an entry added for your team is visible to every team.

Microsoft Teams is outbound only
There is nothing to point at the platform. The platform posts a card into a channel you nominate, using a webhook you create there. No app registration, no inbound path, and strictly opt-in — unset means no notifications and no error.

You cannot approve from inside Teams. The card carries a link; the decision happens on the dashboard, which is where the record of who decided what lives. 13.5 says the same thing because it is the single most common misunderstanding about this integration.

Qase and the test tools
Qase holds the test cases the Acceptance Test agent writes and the QA Agent executes against. The QA Agent chooses its stack once, at setup — Jira with Qase, or Azure Boards with Azure Test Plans — and scaffolds a repository around that choice. It is not a runtime switch, so a team that picks wrong re-scaffolds. Its runbook carries the detail.

Onboarding a team is configuration, not deployment
Worth repeating from 11.1 because it is the most useful fact here for anyone estimating effort: a new team is an entry in one configuration file, its own scoped credentials, and a choice of which agents to enable. Two teams can sit on entirely different Atlassian instances side by side.

The exception is anything local. Cloud agents are switched on for a team; the plugins at 13.2 are installed by each person who runs one, on their own machine, and nobody can do that for them.

Where the deeper detail lives
Per-tool configuration mechanics and the verification steps are in Platform Onboarding — Prerequisites and Configuration, maintained alongside the platform. This section carries what an adopting team needs without opening it, and the same access note as 10.4 applies.

Source: the orchestration platform's own repository documentation, read 29 August 2026.

12
Metrics Catalogue
12.1 Measurement principles
Two layers, and promotion decisions need both. The Agent Run Logger carries human judgement on quality: accept, rework, gate pass. Platform telemetry carries run volume, duration, failure modes and token cost. Neither alone is enough. An agent with high accept rate and runaway cost is not ready, and neither is a cheap agent nobody trusts.

Measure the reinvestment, not only the throughput. The principle in 2.3 needs a number, or it is a slogan. There is currently no metric for it, and that is a real gap rather than an oversight.

Read every number in this section as a target, not a result. No pre-adoption baseline exists for Sirius, so nothing here has been shown to move.

12.2 The metrics
Metric	Definition	Purpose
Agent Acceptance Rate	First-time accepted output ÷ total work items, tagged at review	The primary trust signal
Rework rate	Share of runs sent back	Paired with accept; a high accept rate with high rework means inconsistency
Gate pass rate	Share of runs clearing their gate first time	Whether the agent’s output is fit for the decision it feeds
Cost per accepted output	Tokens spent across every run, divided by the accepted ones	The honest counterpart to time saved. Measurable today, not yet reported
DORA set	Deployment frequency, lead time, recovery time, change failure rate, reliability	Delivery health, independent of agents
Rework rate is defined twice. Once as a promotion metric — the share of agent runs a reviewer sent back — and once inside DORA, where it means reworked delivery output regardless of whether an agent was involved. Different denominators, same name. Proposed: keep rework rate for the agent measure and call the DORA one delivery rework. Settle it before a dashboard is built, or the two will be compared as if they were the same number.

12.3 Calculation
Agent Acceptance Rate is first-time accepted output ÷ total work items. The denominator is work items, not runs, and only a first-time acceptance counts: three attempts ending in an accept is one work item that was not right first time. 8.2's rule that a ticket carries one verdict rather than one per attempt is what makes this computable. Rework rate is runs sent back ÷ total runs. Nothing is weighted or adjusted — a run counts once, whoever ran it and however long it took.

Cost per accepted output is tokens spent across every run ÷ accepted runs. The numerator is not the cost of the accepted runs alone — a rejected run costs the same tokens as a kept one, and leaving those out would flatter the number by exactly the amount the agent is getting wrong. Both halves exist on the run record and the division is not yet reported, which is a reporting gap rather than a data one.

Verdict coverage is tagged runs ÷ total runs, and it is read before any of the above. 3.8 carries the sample conditions and the floors.

Two agents are calculated differently. Code Review and PR Validation judge and block someone else's work, so rework is not read on them and gate pass does not apply. 12.5 has the alternate floor, which is incomplete.

12.4 Data sources
Every metric above has a physical source today.

Metric	Where the number comes from	Captured by
Agent Acceptance Rate, rework rate	The Agent Run Logger verdict on the run record	A person, at review
Manual time saved	Agent Run Logger, seconds per run	A person, at review
Hallucination rate and layer	Agent Run Logger flag and layer field	A person, at review
Token cost	Per-run totals on the run record, bucketed per model call. Recorded on every run, whatever its verdict	Automatic
Cost per accepted output	Tokens across all runs, divided by accepted runs. Both halves exist; the division is not yet reported	Derived
Run volume, duration, failure modes	Run and output records	Automatic
Context drift	Drift output rows, comparing a source document against the derived one. Opt-in per team, observational only	Automatic, off by default
DORA set	Outside the Sirius platform — the team's existing delivery tooling	The team
Reinvestment	No source. Not a platform gap — nothing measures whether returned time went into capability	Nobody yet
The split that matters. Four of these metrics are captured by a person at review; four are automatic. The automatic ones will always be complete. The human ones are complete only if tagging happens, and they are the ones the promotion gate actually needs. A dashboard showing perfect token data and patchy accept rates is the expected failure mode, not an unlucky one.

One source carries most of the risk. Six of the nine rows above come from the Agent Run Logger, and four of those are filled in by a person at review. The automatic rows will always be complete. The human ones are complete only if tagging happens, and they are the ones the promotion gate actually needs. A dashboard showing perfect token data beside patchy accept rates is the expected failure mode, not an unlucky one.

12.5 Baselines, targets and thresholds
Before any floor is read. Two sample conditions, and both must hold. At least 50% verdict coverage, meaning at least half the runs carry an Accept, Refine or Rework verdict. And enough runs for the band being claimed: ≥ 5 at Testing, ≥ 10 at Establishing, ≥ 20 at Optimising. Below either, no rate is computed and no status is claimed. Full definitions at 3.8.

Optimising graduation. Agent Acceptance Rate ≥ 85%, rework \< 15%, gate pass ≥ 75%, zero critical failures.

Blocking validation agents. Code Review and PR Validation are measured on Agent Acceptance Rate alone for now: rework is not read on them and gate pass does not apply. Nothing replaces rework here, so this floor is incomplete and neither agent graduates on it as it stands. 3.8 carries the reasoning; 10.1 says which agents and why the label alone is not the test.

BAU-ready. The same Agent Acceptance Rate ≥ 85% and rework \< 15%, plus a published runbook and a named owner. BAU adds operating requirements on top of the quality bar, not a higher bar.

Taking the delivery baseline
A baseline taken afterwards is not a baseline. 13.2 makes one a prerequisite, and this is how to take it. It is a day of work, not a project, and the method matters more than the tooling.

Measure it from the tracker's own history, never from a last-updated field. A ticket's updated timestamp is the last time anyone touched it, which for finished work is at or after the moment you want. That makes it a proxy whose error runs one way: it only ever overstates, and worst on tickets somebody commented on weeks later. Pull the change history and take the first transition into the status that means done-enough.

Report the median and the ninetieth percentile. Not the mean. Ticket durations have a long right tail — a handful of items reopened or swept closed after a year will drag an average far above anything a team recognises. If your mean is more than about twice your median, the mean is describing the tail rather than the work, and quoting it will lose you the room.

Name the span, and reserve lead time for DORA. Three different spans get called the same thing, and one of them has an industry definition we do not get to redefine.

Span	What it answers	Call it
Ticket created → done	What a stakeholder waited, queue time included	Development Cycle Time
Work started → done	How long the doing took, queue excluded	Not measured today. It needs an in-progress transition, and naming it before we collect it would be a guess with a name
Commit → deployed	Delivery performance, the DORA measure	Lead Time for Changes, and only this
Development Cycle Time is what this method produces, and the qualifier is doing work: cycle time on its own means work-started-to-done in Lean and Kanban, which excludes the queue. Ours includes it. Someone comparing an unqualified number against an industry benchmark would be comparing two different things and concluding we are slow.

Reporting one span under another's name is how a number gets quoted against the wrong target.

Count throughput alongside it. Items reaching done per week, from the same history. It has no proxy problem at all, and a cycle time without a volume tells you nothing about whether a faster team is also a smaller one.

Two traps specific to comparing boards. A legacy board and a current board are not two teams — the older one carries an older backlog, and its long tail is a migration artefact rather than a delivery signal. And an item that skipped the status you are measuring drops out of the sample silently, which biases the result toward work that followed the full process.

Baselines. There is no pre-adoption baseline for Sirius itself, which is why 12.1 asks you to read the numbers in this section as targets rather than results. An adopting team is not in that position: it takes its own baseline before its first agent run, using section 4 of the Team Adoption Record. A baseline taken afterwards is not a baseline, and the one the pilot did not take cannot be recovered.

12.6 Agent performance metrics
Per agent, per sprint: runs logged, Agent Acceptance Rate, rework rate, gate pass rate, tokens, and manual time at review. This is the evidence the promotion gate in 9.3 consumes. Two agents currently have no logged runs at all, Prioritization and Architecture Impl, which means they cannot be assessed rather than that they failed.

12.7 Dashboards
Run history is in the Sirius dashboard, filterable per agent and per team, with a per-run breakdown of tokens and verdicts, and CSV export. That is enough to answer the promotion-gate questions without building anything further.

Two views do most of the work. The run detail page carries the verdict form, so a reviewer can record accept, refine or rework and the minutes it took without leaving it. The run list, filtered to one agent over a graduation period, is what a promotion decision is read from.

Not every agent has a proper view. Impact Analysis and Task Context have per-step renderers; several others fall back to a generic output view, which makes reviewing them slower and is part of why their coverage is lower. 13.5 says which views a person actually opens and what each is for — this section says where the numbers come from, that one says where to look at them.

The reminder link is conditional. Agents append a link to the run's verdict form only where the dashboard address is configured for the deployment. Where it is not, nobody is prompted, and coverage depends on the reviewer remembering.

13
Adoption Path
13.1 Objectives, principles and phases
The objective. A tribe understands the model, knows its own gaps against the target state, and adopts the Sirius agent set with support rather than being handed a document.

The principles. Structured and controlled. One agent set. Tell them the target first, then find the gaps together, then execute. Nobody is injected with an Epic on day one.

The phases. Inform → agree the target state → find gaps on both sides → prepare tools and access → activate agents for the team → run with support.

13.2 Prerequisites and readiness
Two different questions, and running them together is why adoption stalls. Prerequisites ask whether a team is in a fit state to adopt at all. Readiness asks whether the setup is done. A team can pass every readiness check and still be a bad candidate.

A · Prerequisites — before setup starts
Assessed once, before any setup work begins. They describe what has to be in place for the agents to work, not who deserves them.

Prerequisite	Why it is a prerequisite and not a nice-to-have	Met?
A DORA baseline exists	Deployment frequency, lead time, change failure rate and recovery time, measured before adoption. Without it there is no way to say later whether Sirius helped.	
A Hubexo delivery metrics baseline exists	Whatever the team already reports on throughput and quality. Same reason: a number after, with no number before, is an anecdote.	
The team has a defined delivery process	Agents are triggered by status transitions in a workflow. A team without a stable workflow has nothing for them to attach to, and will end up designing its process and adopting agents at the same time.	
A stable board exists and is actually used	The pilot found this the hard way. A board that changes shape weekly breaks the trigger model silently.	
Delivery roles are present, or gate ownership is assigned	If a role is missing, someone must hold its gate. ETL and Harvester had no Product Manager and the Strategy phase was simply absent.	
Review capacity is acknowledged	Agents produce more to review, not less. A team already at capacity will rubber-stamp, and a rubber-stamped gate is worse than no gate because it looks like control.	
B · Readiness — before agents are switched on
Checkable rather than an opinion. Six categories, drawn from the live Enablement Week 2026 checklist maintained by the Delivery Coach.

1 · Access
The critical path. Most other items in the workbook currently read blocked, waiting for the access, so this category is not one row among six — it gates the rest. Every tool in section 11 that the team will touch needs an access decision, not only the ones the agents run on.

Tool	What is needed	Who grants it	Yes / No
Breeze	Access to the team's projects. Without it, Impact Analysis, Task Context and Feasibility have nothing to read, so most of Spec Sprint does not function.	Tribe Solution Architect	
Work tracking Jira or Azure DevOps	Admin at organisation level — Project Collection Administrator, or the Atlassian equivalent. Custom fields and workflow states are organisation-level objects a project administrator cannot edit.	Central IT	
Contributor access for every team member who will run an agent.	Central IT	
Source control GitHub, Bitbucket or Azure Repos	Repository access, SSH key registered, CLI authenticated. Admin rights to protect main and set the merge block.	Sirius Platform Engineering	
Aha!	Access and an API key, where the team runs the Strategic phase.	Product	
Documentation Confluence or Azure Wiki	A space the agents can write reports and manifests into.	Tribe Solution Architect	
Qase	Project access, where the team runs Acceptance Test or the QA Agent, plus an API token. The Acceptance Test container will not start without one.	QA lead	
Figma	Editor access, plus the main files, libraries and design references identified. Where the team does design work.	Receiving team	
Microsoft Teams	A channel for human-in-the-loop notifications, and the right people in it.	Delivery Manager	
AWS Bedrock	Model access for the team's agents, in the right region for data residency.	Sirius Platform Engineering	
PostHog	Access, where the team runs Discovery or uses product analytics in the evidence conversation.	Product	
Sirius dashboard	Sign-in for anyone who needs to see run history and answer open questions.	Sirius Platform Engineering	
Claude Code	Licences for anyone running a Local agent, and the Sirius plugins installed.	Sirius Platform Engineering	
Crux is read by agents rather than accessed by people, so it needs no team-level access request. Section 11 carries what each tool is for and who uses it.

Access is not one request. These sit with at least five different granting parties, several outside the team and one outside the tribe. In the live workbook this is where almost everything is stuck. Raise every request in the same week rather than discovering them one at a time as each setup task blocks.

2 · Work tracking
Check	Owner	Yes / No
Board created	Delivery Manager	
Custom fields set up — the manifest fields agents read and write	Delivery Manager	
Workflow states mapped to the phase model, so status transitions can trigger agents	Delivery Manager	
Webhook configured and reaching the Sirius platform	Tribe Solution Architect	
A documentation space configured to store impact analysis and acceptance test drafts. Three values are captured from it — space key, space ID and homepage ID	Tribe Solution Architect	
Where the team is on a separate Atlassian tenant, that is recorded in its configuration. The platform fetches a Jira event's full issue and changelog before routing it, and a second tenant needs that step turned off	Sirius Platform Engineering	
Aha! webhook configured, where the team runs the Strategic phase	Tribe Solution Architect	
3 · Repository and code
Check	Owner	Yes / No
Repositories registered with the Sirius platform, main protected with code owners	Sirius Platform Engineering	
Pull request merge block configured, so PR Validation actually gates the merge button	Tribe Solution Architect	
The team's branching model recorded, and its branch rules written down. The default assumes trunk-based	Tribe Solution Architect	
A .breeze.json file at the root of every repository, where the team runs PR Validation or Pre-merge	Sirius Platform Engineering	
Config repository set up, including CLAUDE.md and AGENTS.md	Sirius Platform Engineering	
Workspace repository created, where the team does design work	Receiving team designer	
4 · Agent configuration
Check	Owner	Yes / No
teams.yaml entry exists for each agent the team will run	Sirius Platform Engineering	
workflow.yaml configured	Sirius Platform Engineering	
Routing rules configured — project prefix, then repository URL, then default. A prefix or repository URL already claimed by another team stops the platform from starting rather than quietly overwriting	Sirius Platform Engineering	
Credentials registered for this team specifically. They are named per team, and a missing one stops the platform from starting	Sirius Platform Engineering	
Bot account IDs configured, self-loop guard in place	Sirius Platform Engineering	
Breeze project mapping set against the Breeze Product field. This mapping is one shared file, not a per-team one, so an entry added for this team is visible to every team	Tribe Solution Architect	
Knowledge graph onboarding completed for the team's codebase	Tribe Solution Architect	
Local agents installed from the marketplace by each person who will run one — see below. Not a platform deployment: it happens in that person's own Claude Code	Every Twin Ambassador and developer running a local agent	
Every local agent connected to the Agent Run Logger, and the sync run at least once	Twin Ambassadors	
Microsoft Teams channel set up for human-in-the-loop notifications	Sirius Platform Engineering	
Local agents install from the marketplace, one person at a time
Not every Sirius agent runs in the cloud. The Epic Agent Suite, Sprint Planning, the QA Agent and the Harvester Spawner run locally, in Claude Code, on the machine of the person using them. A cloud agent is switched on once by Platform Engineering for a whole team. A local agent is installed by each person who runs it, and nobody can do it for them. Budget for that in the readiness plan: it is small per person and easy to forget entirely.

Authenticate to GitHub first. The marketplace repository is private, so adding it fails until GitHub CLI is signed in. This step appears in no other document and it is where people stop.

gh auth login
gh auth status
Install the CLI first if it is missing: brew install gh on macOS, winget install GitHub.cli on Windows. Then add the marketplace:

claude plugin marketplace add https://github.com/hubexo/hubexo-ai-agent-marketplace
Use that line, not the one in the repository's README. As of 2 September 2026 the README still names hubexo/hubexo-plugins, which is the repository's former name. Verified against the repository and its .claude-plugin/marketplace.json on that date. After adding:

Plugin	What it gives you	After installing
epic-suite	The epic lifecycle doors — create, update, scope, validate, prioritise, commit — and the discovery hypothesis pipeline. Backed by Aha!, BugHerd and Crux	/epic-suite:setup once, for the connector dependencies and the environment checklist
design-agent	Sprint planning, design specifications, impact analysis, decision records and task breakdown	/design-agent:setup once. It also writes the .team.json that run-logger reads
qa-agent	The QA pipeline. You choose the stack at setup: Jira with Qase, or Azure Boards with Azure Test Plans, and TDD or BDD	/qa-agent:setup in the empty directory that will become your QA repository, which it scaffolds
run-logger	Required for every local agent. Records duration, token cost and an output summary to a local file, then /run-logger-sync posts it to the team's Confluence page or wiki	Install it beside whichever plugin wrote .team.json, or write that file yourself
run-logger is not optional and it is the one people skip. A cloud agent is logged by the platform whether anyone thinks about it or not. Every local agent must be connected to this one, and until it is, that agent produces no record at all. Every floor in 3.8 reads from that record, so a team running local agents unconnected does work that cannot be assessed, and the maturity bands in section 10 will keep reading Not assessed however well those agents perform.

It writes locally first and publishes on /run-logger-sync, to Confluence or to the team's wiki, whichever that team uses. Azure DevOps teams post to their wiki, so the absence of Confluence is not a reason to skip this.

The Harvester Spawner is not installable from the marketplace today. A harvester-spawner folder exists in the repository, but the marketplace manifest lists four plugins and it is not one of them. Checked 2 September 2026. A Harvester team expecting to install it from here will not find it, so confirm the route with its owner before an enablement week.

The QA Agent's Azure path is worth knowing before an enablement week on Azure DevOps. It is chosen at setup rather than adapted afterwards, and the plugin ships a rollout checklist covering each combination of tracker and test style. Where 13.2 asks whether an agent has an Azure path, this is one that answers yes.

5 · People
Check	Owner	Yes / No
A named Agent Owner exists for every agent the team will use	AI Governance Team	
Hub Ambassadors identified — the Tribe Solution Architect and GDH Delivery Lead	Receiving tribe	
Twin Ambassadors identified for each discipline the team runs	Receiving tribe	
Where a delivery role is absent, who holds that gate instead is written down — named by the end of enablement week at the latest	Delivery Manager	
6 · Enablement and support
Check	Owner	Yes / No
Knowledge sharing session on tools and workflow scheduled	Delivery Manager	
Product knowledge and design process session scheduled, where the team does design work	Twin Ambassador, design	
Feedback channel open and named	Delivery Manager	
The team's tech stack understood, and the gap against the existing implementation known	Tribe Solution Architect	
7 · Verification
Setup that has not been verified is setup that has not been done. Four checks, in order, before the team is told it is live.

Check	What good looks like
The platform started	It refuses to start on a bad configuration rather than running with one, so a clean start is itself evidence
A test event arrived	Move one ticket into a trigger status and confirm the event was received and routed to this team, not to the default one
A run appears	The run shows against the right team, with the right agent
The run used this team's configuration	Each run freezes the configuration it started with. Open that record and confirm it holds the team's values
Two traps this catches, and nothing else does.

A team whose Aha! reference prefix is not registered alongside its Jira prefix falls through to the default team. No error, no rejected event, work quietly handled as though it belonged to someone else. The routing check above is the only place this surfaces.

Not every team gets a merge gate. PR Validation, the one thing that sets the status a branch rule can block on, currently runs on GitHub only. A team on Bitbucket gets code review and no merge gate, and the readiness list will still read green. Say so during enablement rather than letting it be discovered later.

One usage rule the whole team needs on day one
A mention has to be the first thing in the comment. Leading spaces are tolerated; anything else is not. A mention part-way through a sentence, or added at the end, does not start a run and does not report an error — the comment simply sits there. This applies to every agent, and it is the single most common reason a team reports that an agent stopped working.

The Epic Agent Suite needs a product pack before it can run
Every other agent on this list activates through configuration a platform team applies — a teams.yaml entry, routing rules, a webhook. The Epic Agent Suite is configured differently, and the team does it themselves.

The suite reads every workspace-specific fact — statuses, reference patterns, custom fields, the prioritisation weights — from a product pack, one per Aha! product. Nothing about a product is held in a prompt or in the model's memory. Where a pack does not exist yet, /agent-workspace-init <PREFIX> drafts one:

Step	What happens
1 · Discover	Reads the workspace from Aha! — product entry, releases, integrations, a sample of real epics and features — into a facts file. Read-only
2 · Draft	A script assembles the pack from those facts and checks it against the pack schema. Values are harvested, never invented
3 · Interview	One question per gap. Answers are picked from what the workspace actually contains rather than free-typed, and none is a recorded answer rather than a blank
4 · Hand over	The pack lands on a branch, the check suite must pass, and the team gets a report of what it still has to ratify
The pack is a draft until the team adopts it. It arrives as a 0.x version and becomes the team's own through a reviewed pull request. /agent-workspace-init never writes to Aha! at all, so a first run costs nothing but the review.

What this means for planning. Alex Evans reports the pack turning roughly two hours of manual capture into about fifteen minutes of review. That is the drafting, not the adoption: a team still needs a checkout of the strategy repository, Claude Code, an authenticated Aha! connection, and someone to ratify the gap report and tune the prioritisation weights, which currently carry LeadManager's values. Treat it as a configuration task with a named owner and a review, roughly a day rather than a project. The other phases are unaffected.

Prioritisation weights are per workspace. They live in the pack's prioritisation-policy.yaml, and changing them is a version bump rather than an edit, so the next run is an explicit re-score rather than a silent recompute.

Two things the checklist will not show you
Not every team uses Jira, and Sirius is built for both. Some tribes run on Azure DevOps, and the workbook carries a full parallel set of setup items for it: board, custom fields, workflow mapping, webhooks, wiki, repo merge block. Every agent is meant to run on either tracker.

The two paths are not at the same stage. Most of these Guidelines describe Jira status transitions because that is what the pilot ran on, and some agents have been exercised on Azure DevOps while others have not. An onsite enablement week on Azure is how that gets closed, by running everything in the tribe's own environment rather than reading about it. For Newcastle that environment is the Sirius - Template project on Azure DevOps. Where an agent turns out to have no Azure path yet, that is a finding for the week and a piece of work, not a reason for the tribe to skip the agent.

Access is the critical path and it is externally held. Most setup items across the Solution Architect's and engineers' sheets read blocked, waiting for the access. That is a dependency on a service desk outside the team. Treat access as step zero rather than part of step four, and raise the requests before the target state conversation rather than after it.

A readiness list that only counts configuration will show green while a team is nowhere near ready. In the live workbook roughly a third of the real items are access requests and another quarter are sessions and channels that need people's calendars. Neither is technical work, and both take longer.

13.3 Who this is for, and the first wave
This document is the entry point for any team or tribe adopting Sirius, not only the ones named below. It is the first thing a team reads, the single source of truth for the model, and the reference it returns to. The teams below are the first wave, not the scope.

Adoption is assessed per team, not per tribe. A tribe with four teams may have one ready and three that are not, and treating readiness as a tribe-level state is how a team gets activated before it should be.

The first wave
Lattira Source and Lattira Spec, both in the Design Platform Tribe, based in Newcastle — two separate teams, not one. And the Commercial Platform Team, Foundation Tribe, in Stockholm. Platform Services follows.

These three were named by the executive, not selected by assessment. Worth being plain about it, because the prerequisites and readiness checks below can otherwise read as an entrance exam a team has already passed. They are not. Being in the first wave says the business wants Sirius here; the checks say what has to be true before agents are switched on, and where a named team does not meet one yet, that is the plan's first task rather than a mark against the team.

Adoption risk differs by team, and the response has to differ with it. One team may need evidence before it will commit; another may want to build its own agents and need the isolation argument in 9.3; a third may have a tech stack nobody has assessed yet. None of those shows up in the readiness checks at 13.2: a team can be green on all six categories and still be in any of them. That is what steps 1 and 2 of the playbook are for. Inform walks the tribe through the model with no commitment asked for, and Agree the target state has the tribe write down which phases it will run and what it deliberately will not adopt yet. Both happen with the team, before activation, not as an assessment of it.

A word about "Platform". Several Hubexo teams carry it in their name — Platform Services, Commercial Platform — and they are receiving teams like any other. None of them is the Sirius Agent Platform, which is the runtime the agents execute on, nor Sirius Platform Engineering, the team that builds and operates it. This document always qualifies the Sirius sense; an unqualified "Platform" refers to a receiving team.

13.4 The playbook
Seven steps, starting at zero. A team should be able to see where it is at any point, and what has to be true before the next step starts.

Step	What happens	Owner
0	Confirm the prerequisites	The entry conditions at 13.2A, including the metrics baseline. Done before anything else, because a baseline taken after adoption is not a baseline.	Delivery Manager with the Delivery Coach
1	Inform	Walk the tribe through the model and this document. No commitments asked for. The aim is that people can describe Sirius in their own words before anyone decides anything.	Hub Ambassadors
2	Agree the target state	Which agents have inputs on this tribe, who holds each gate, and what has to be connected. Every gate has a named holder by the end of enablement week, including the gates for roles the tribe does not have. The phases and the gates are not in scope for this conversation: they are adopted as they stand. Written down, because an unstated scope becomes an argument in week six.	GDH Delivery Lead with the AI Governance Team
3	Find the gaps, both sides	The readiness checks at 13.2, plus what the tribe needs from us. Both directions matter: the pilot found more gaps on our side than theirs.	Hub Ambassadors with the tribe
4	Prepare tools and access	Everything in 13.2 turned green. This is the step most likely to slip, because it depends on access requests outside the tribe's control.	Sirius Platform Engineering
5	Activate	Agents enabled for the team, one phase at a time rather than all at once. Each Twin Ambassador walks their discipline through the agents it will use.	Sirius Platform Engineering with Twin Ambassadors
6	Run with support	Hypercare, 13.8. The tribe runs real work with the ambassadors close by, and the run evidence starts accumulating.	Twin Ambassadors
Which agents to switch on first
The platform documentation gives a staged order and says plainly that a team should not switch everything on at once. Adopt it — it is written by the people who watched the pilot, and it sequences by risk rather than by phase.

Switch on	Why here
1	Code Review	The lowest risk in the set. It only comments. A team learns what agent output feels like without anything depending on it.
2	Impact Analysis, then Task Context	Reading and analysis. Nothing is created, and the team starts seeing the knowledge graph work.
3	Task Creation	Only once the team trusts the task context it reads from. Creating tickets on bad context is how confidence is lost early.
4	Backend and Frontend Implementation, in codegen-only mode	Code is generated but nothing is executed — a person runs everything locally. The output becomes real while the risk stays low.
5	The Teams approval gate	Once people are actually reviewing specs. A gate added before the habit exists is a gate that gets clicked through.
6	The fuller implement modes	Last. Test-driven and sandboxed execution, once the team trusts everything upstream of them.
Each agent is enabled per team independently, so this order costs nothing to follow. Note that steps 1 to 3 also produce run evidence without asking anyone to trust generated code, which is the fastest honest route to a maturity picture for a new team.

One agent set, adopted first. Teams do not build their own agents in place of the Sirius set. The reason is traceability rather than control: when something breaks you need to be able to tell whether it was the workflow, the agent, the configuration or the person, and that becomes impossible if every team runs a different set. What a team may still build for itself is in 9.3.

13.5 Enablement · what your job becomes
Drawn from what the pilot actually changed for each role. A tribe lead should adapt it for their own people rather than adopt it whole, because the starting point differs by team.

The honest headline: no role loses its judgement, and every role loses some of its typing. The work that goes is assembling context, writing the first draft and chasing consistency. The work that grows is deciding whether a draft is right, and saying so in a way that leaves evidence.

Role	What changes on Monday	The new skill
Product Manager	Epics are drafted by the Epic Agent Suite from a short description. You interview the agent rather than face a blank page, and you approve before anything saves to Aha!.	Judging whether a drafted Epic is actually supported by evidence, and being willing to send it back.
Solution Architect	Impact Analysis and Feasibility produce a first read across repositories. Architecture Implementation proposes; it does not execute.	Reading a machine impact assessment critically, especially where a layer degraded to limited visibility rather than found nothing.
Delivery Manager	Task Creation breaks Epics into child tickets. Sprint Planning recommends scope. You decide both.	Spotting a breakdown that is plausible but wrong, which is harder than spotting one that is obviously wrong.
Designer	Design Context assembles the brief; Design Creation produces artifacts. Both stop and wait for your keyword.	Specifying tightly enough that the agent has something to work from, and checking generated names against the real design system rather than trusting them.
Engineer	You approve a plan before code is written, then review what comes back as a pull request. Code Review and PR Validation sit between you and merge.	Reviewing code you did not write, at higher volume, without the review becoming a rubber stamp.
QA Engineer	Acceptance Test drafts cases from the ticket. The QA Agent runs the pipeline end to end.	Testing what the agent did not think to test. Generated cases cluster around the happy path.
What everyone learns, regardless of role
Tag the outcome at the point of review, not later. Accept or rework, with the manual time it would have taken. This is thirty seconds of work and it is the entire evidence base for whether an agent is trusted. Tagged a week later, it is a guess.

Three failures, three different responses. A tool is unreachable, so stop rather than proceed on partial context. An output has the wrong shape, so retry with feedback. A decision is ambiguous, so escalate to a person. Treating all three the same is the most common mistake, and the third is the one agents get wrong.

Silent degradation is real. Several agents fail quietly on a sub-step and still report success. If an analysis looks thin, it may be that nothing was found, or that a layer failed to look. Ask.

Where you actually do this
The Sirius dashboard is where a run is inspected and a verdict recorded. "Where do I go to see what happened" is a day-one question, so it belongs here rather than buried in a reference page.

View	What it is for
Recent	Run history — agent, status, subject, duration, tokens. Filterable, with CSV export. The default place to look.
Sandboxes	Runs in flight, with live logs. Where to look when something appears stuck.
Agents	Every agent grouped by lifecycle stage. Useful while learning what exists.
Webhooks	Every inbound event and its outcome — received, invalid, ignored, no match, routed. The first place to check when an agent did not run at all.
Open a run and you get its pipeline timeline, the outputs, the context it recalled, the token breakdown, and the Agent Run Logger input where the verdict is recorded. That last one is the thirty seconds that makes the evidence real.

The Teams card is a notification, not a control panel. This is the thing people get wrong most often. When an agent needs approval it posts an Adaptive Card to the team channel with a link. You cannot approve from inside Teams. The decision happens on the dashboard's Activity tab, which is where the audit trail of who decided what actually lives.

And the gate does not hold anything open. In the platform's own words, "sending the card does not pause the graph" — the run completes, and what waits is a database row. Three consequences: restarting a container loses nothing; a completed run can still have an unfinished step; and there is no timeout. A gate nobody answers stays pending indefinitely, and no reminder is sent. Somebody has to watch for those.

Teach this by doing it. In the enablement session, open a real run, read the timeline and tag a verdict. Five minutes, and it removes most of the mystery.

Enablement weeks, and where they run
Every batch runs in its own tribe's environment. Nothing runs in a shared demo instance: going onsite exists to find out what Sirius does in the stack the team will keep working in, and that only holds if the stack is theirs. So each week has a named playground, agreed before the week opens, in the tribe's own tenant, on the tracker the tribe actually uses.

Batch 1

Week	Tribe	Playground	Tracker
31 Aug – 4 Sep, Newcastle	Lattira Spec & Source	Sirius - Template	Azure DevOps
7 – 11 Sep, Stockholm	Commercial Platform	CPAS board	Jira
More than forty teams follow across later batches. This table gains a row per week; the rule above it does not change. A batch whose playground is not named before the week opens has not started planning.

These are playgrounds, not production boards. The real ticket session 3 takes through the flow is copied in from the team's own backlog. A team's live board is not where anyone learns.

Check access before day one rather than on it. Playgrounds sit in different tenants, and an account in one says nothing about another. Access is the item that slips most (see 13.2), and losing a morning to it costs the session that changes minds.

Who teaches, and how long
Twin Ambassadors teach their own discipline. That is the role: enough mastery of the agents your discipline uses to teach them and speak for them at the gate. Hub Ambassadors carry the standard and are the first stop when something is unclear.

The week itself
Five sessions, not five days of training. The team keeps delivering; this runs alongside.

Session	What happens	Who runs it
1	What this is	The Playbook, walked through. No commitments asked for. The aim is that people can describe Sirius in their own words before anyone decides anything	Hub Ambassador
2	Who holds what	Section 1 of the Team Adoption Record, filled in together. Every gate gets a name, including the gates for roles the team does not have. This is the session that cannot be skipped	Delivery Manager with the Hub Ambassador
3	One ticket, all the way	A real ticket from this team's board, taken through the phases that apply to it. Not a demo on someone else's work	Twin Ambassadors, their own discipline
4	Reading a run	Open the dashboard on a run from session 3. Read the timeline, find the inputs, tag a verdict. Five minutes of doing removes most of the mystery	Twin Ambassador
5	What we do not know yet	The team's own list: what looks wrong, what is missing, what they expect to break. Goes into section 5 of the record with owners	Delivery Manager
Session 3 is the one that changes minds, and the one most often cut for time. A demo on another team's ticket teaches nothing about your own. If the week is compressed, cut session 1 and send the Playbook to read instead.

What the team leaves with: a completed Team Adoption Record, one ticket that has been through the flow, and a named list of gaps with owners. Not a certificate, and not a green readiness score.

What the team does not leave with: a shorter version of the workflow. Refinements are proposed after the team has run the whole thing, on the evidence of having run it.

13.6 Adoption metrics
Three questions, and nothing beyond them. Full definitions in section 12.

Question	What tells you	Decision it drives
Is it being used?	Runs logged per agent per sprint, by team.	Whether to keep supporting an agent this tribe never invokes.
Is it any good here?	Accept and rework rate for this tribe, against the same floors used everywhere.	Whether to extend hypercare or move to normal running.
Is the dividend being reinvested?	Manual time saved, against what the tribe chose to do with it.	Whether the reinvestment side of 2.3 is holding or quietly failing.
The third has no instrument yet, and that is the one most likely to be dropped. If a tribe cannot say where the returned time went, the principle is decoration. The Delivery Coach owns this.

13.7 Gates
Three gates, all held by the AI Governance Team.

Candidate gate, before any setup work starts. Every prerequisite at 13.2A met, in particular a DORA and delivery metrics baseline captured. A team that does not meet one yet is not rejected and is not being ranked against other teams: the gap is the first item on its plan, and it is usually fixable in weeks.

Activation gate, before a tribe's agents are switched on. Every readiness check at 13.2 green; a named Agent Owner for each agent the tribe will use; a Hub Ambassador and the relevant Twin Ambassadors identified; and the target state from step 2 written down.

Normal running gate, at the end of hypercare. Run evidence exists, accept and rework are being tagged consistently, and the tribe can name who to contact when an agent misbehaves.

If a role does not exist in the tribe, the gate does not disappear. ETL and Harvester ran without a Product Manager and the effect was not that Strategy ran itself, it was that the Strategy phase was absent. A tribe missing a role must say who holds that gate instead before activating the agents that feed it, or adopt that phase later. This is the most reliable predictor of a phase quietly not working.

13.8 Hypercare
Two to four weeks after activation, matching the definition already used for agents at pilot exit. The tribe runs real work; the ambassadors stay close; the run evidence accumulates.

What hypercare actually means in practice: a named person to contact, a short weekly check on accept and rework, and a bias toward fixing the input rather than blaming the agent. Most early rework in the pilot traced back to thin context rather than a bad model.

The stopping rule
Calling this "not a calendar-driven rollout" is not credible without one. The 31 July decision is that rollback is not an option and there is no return to non-AI development, so the honest stopping rule is narrower: not whether to stop the programme, but whether to pause activation for one tribe.

Pause activation for a tribe when any of these is true:

The Agent Acceptance Rate for the tribe sits below the floor for two consecutive sprints with no identified cause.
A critical failure reaches production and the cause is not understood.
The tribe cannot name an Agent Owner or a contact for an agent it is running.
Run evidence is not being tagged, so nobody can tell whether it is working.
Who decides: the AI Governance Team, on the Hub Ambassador's recommendation. What pausing means: agents are switched off for that tribe and the work continues manually while the cause is found. It is not a judgement on the tribe, and saying so out loud matters, because a stopping rule people are afraid to invoke is not a control.

14
Frequently Asked Questions
Questions that came up often enough during the pilot and the first enablement sessions to be worth answering in one place. Every answer names the section that owns the subject, because a question that lives here permanently is a section not doing its job. If one of these gets asked again after the owning section is read, fix the section rather than lengthening the answer.

Before you start
Do we need a complete team?

No. The roles named in the workflow are the ones the pilot team happened to have, not a hiring list. A gate means a person decides; which person is your call. One person holding three gates is a normal shape. What a smaller team really changes is how much output one reviewer can absorb, so switch agents on a few at a time. See 5.5 and 13.2.

Can we adopt part of the workflow?

No, and this is a decision rather than a preference. Teams and tribes run the workflow as it stands, then propose refinements once they have run the whole thing. Two things get confused here and it is worth separating them: a phase is adopted whether or not you have the usual roles for it, and an agent with nothing to read does not run. A team with no user interface has no design work for the design agents to act on. Nobody decides that; there is simply nothing to act on. See 5.5.

What if we do not use Jira?

Sirius is built to run on Azure DevOps as well, and every agent is meant to. The onsite enablement week is where that gets proven: the whole point is to run everything Sirius has built in your own environment rather than in the pilot's.

Be aware of where the two paths are at different stages. Some agents have been exercised on Azure and some have not, and a few source-control steps are on GitHub today. Where an agent turns out to have no Azure path yet, that is a finding for the week rather than a limit on your tribe — it goes on the list and gets built, and it is exactly the kind of thing the week exists to surface. Each agent's runbook says what has been exercised. Each enablement week runs on the tribe's own tracker: batch 1 is the Sirius - Template project on Azure DevOps for Newcastle, and the CPAS board in Jira for Stockholm. Your batch gets its own, on whatever you run. See 13.2 and 13.5.

How long before we see anything?

Three different things, arriving at three different times.

Output — during the enablement week itself. The agents run on your own tickets that week, so you see what they produce within days rather than after a project.

A working setup — as long as your access requests take. This is the part that slips, and it is not technical work. Most setup items wait on access granted outside the team, by several different parties. Raise every request in the same week rather than discovering them one at a time as each task blocks. That single habit is the difference between starting in a fortnight and starting in two months.

A number you can defend — a month at the earliest, and only if runs are being tagged. Rates are read over a measurement window running from the 26th of one month to the 25th of the next, and no rate is computed at all until at least half the runs carry a verdict. A team that switches everything on and tags nothing will have plenty of output and nothing to show for it. See 12.4 and 13.2.

When it is running
I ran it and nothing happened.

Four causes, in the order they are worth checking.

The mention was not first	A mention only starts a run when it is the first thing in the comment. Leading spaces are fine, nothing else is. Mid-sentence mentions do nothing and report nothing
The agent needs a status transition	Several agents cannot be started by a comment at all. A mention can only revise a run that already exists
The run was a repeat	A second transition on a ticket that already has a run is rejected on purpose, and recorded as a failed run. Use refine or rework instead
The branch policy failed closed	A pull request into a target no rule matches skips the code review with no comment and no status, so it looks exactly like the agent not running
What does accept do?

Three different things, depending on the agent, and this is the most common way to be surprised. On most agents it is a logging verb: it records your verdict and the minutes you spent, and starts nothing. On Acceptance Test it performs the export to the test manager. On Architecture and Backend Implementation it starts the build. Each runbook says which. See 8.1.

The output was confident and wrong.

Check the knowledge graph connection before you check the prompt. A stale Breeze connection makes the tools invisible to the agent rather than returning an error, so a deep run produces confident ungrounded drafts and nothing anywhere says so. If quality drops across several agents at once, that is the first thing to look at. See 6.5.

It created a duplicate.

Most agents match an existing child and update it. Duplicates that already exist are not repaired — the agent updates the first one it finds and leaves the rest. Clean them up by hand, or mark them deleted. See the agent's runbook.

Reviewing and evidence
Do I really have to tag every run?

Yes, and it is the single highest-value thirty seconds in the whole workflow. In the most recent graduation period no agent passed the gate across 584 runs, and for eight of them the reason was not quality — it was that fewer than half their runs carried a verdict, so no rate could be read at all. Code Review would have passed on rate alone at 100% accept, and did not, because coverage fell from 70% to 23% while volume stayed high. Used more, judged less. See 10.1 and 12.4.

Why is this agent "Not assessed" rather than given a band?

Because a band is earned from logged evidence and this one has none, or because the component produces nothing a reviewer scores. Showing a maturity band for an agent with no runs is the exact failure the evidence rule exists to prevent. See 10.1.

Our agent looks good but keeps failing the gate. Why?

Two conditions are read before any rate: at least half the runs carry a verdict, and enough runs for the band being claimed. Below either, no rate is computed and no status is claimed. A near-perfect agent with three tagged runs has not passed; it has not been measured. See 3.8.

Why is rework not measured on Code Review and PR Validation?

Because their output is a decision about somebody else's work rather than an artifact of their own. Sent back for rework would record the submitter's reaction to being rejected, and a stricter gate would score worse for being stricter. So rework is not read on them at all, and nothing yet stands in its place, which leaves their graduation floor with a hole in it. See 3.8 and 12.5.

Governance
Who fixes an agent that breaks?

Its Agent Owner, named in 10.1. The AI Governance Team owns the standard and the promotion gate, not daily operation, so that the gate does not become a bottleneck. Pause an agent after two consecutive failures rather than running it a third time. See 9.1 and 9.3.

Someone could put instructions in a ticket comment. What stops that?

Agents are triggered by comments and status changes that anyone with ticket access can create, and code-writing agents hold a bot token, so this is a real exposure rather than a hypothetical. It has a named section rather than a line in an FAQ. See 9.5.

Can we change the workflow for our team?

Propose it after you have run the whole thing, with the evidence of having run it. Configuration that reflects what your work actually contains — which agents have inputs, which statuses your board uses, your branching model — is not a change to the workflow and needs no proposal. See 13.2 and 13.5.

Still stuck
Where do I ask something this does not answer?

The Sirius Service Desk. It is the right place even when you think the question is too small, because a question asked twice is a gap in these documents and the queue is how that gets noticed. Answers by direct message reach one person and leave nothing behind.

If you are onsite during an enablement week, ask an Ambassador in the room first. Anything that outlives the week goes to the service desk.

15
Troubleshooting Guide
15.1 What this section is for
A named symptom, so the person who hits it can recognise it and stop guessing. Troubleshooting is “the Jira automation is not firing”. It is not “an agent pushed bad code and nobody noticed for a day” — that is a governance failure and it belongs in 9.5.

The distinction matters because the two need different responses. A troubleshooting entry needs a fix. A governance failure needs a decision about who was supposed to be looking.

15.2 Read this before you trust it
Delivery collected the symptoms. Several root causes are genuinely unknown, and the entry says so rather than guessing. Anyone who worked the incident should correct their entry.

An entry still marked unknown months later is a small hole in the platform's own memory. It is worth treating as a gap, not as a completed record.

Leave root cause blank rather than guessing. A wrong root cause is worse than an open question, because it stops anyone looking: someone reads the entry, accepts the explanation, and the real fault stays in the system.

15.3 The one to read first
An agent reported a successful push. Nothing arrived in the repository. No error reached the user.

The cause was a credential that had expired or been rotated — a token, which is the password an agent uses to prove who it is. The write failed, and the failure was never passed back up.

This is the most serious entry in the list, and not because of the lost work. A silent success is worse than a loud failure, because a human gate downstream approves work that does not exist. The reviewer does their job properly, reads what they were shown, and signs off on nothing. The gate held and still let the problem through.

The right response is a fix rather than a workaround: an agent that cannot verify its own write should not report success. Currently unowned.

15.4 The incident list
Ask Andri on any of these unless another name is given.

#	Symptom	Root cause	What to do about it
1	An agent reports success but nothing arrives in the repository, and no error surfaces	An expired or rotated credential. The write fails and the failure is not passed back	Unknown. See 15.3 — this is the one that defeats a human gate
2	An agent triggers on its own comment and loops	The system cannot tell the bot's own writing from a person's	Check the bot's own user id and email before anything else runs. The Feasibility Agent already does this. Any new agent that triggers on comments needs this guard on day one, not after the first loop
3	An agent reports a gap or a missing section that is actually present in the source	The agent only saw part of the input — it was cut short before it reached the end	Unknown. Not established whether this was a size limit, a retrieval limit, or a parsing boundary
4	Code Review returned “access denied” against ETL's own configuration · 27 July 2026	Unknown. A permissions problem is likely, and has not been confirmed	Open
5	Routing rules cannot be evaluated from the raw Jira message	The message Jira sends does not carry enough of the ticket to decide which agent should act	Not a fault. The platform fills in the rest — it fetches the full ticket and its history before routing. Expect this, and never write a rule that assumes the raw message
6	Every Aha! activity arrives at the same place, identically shaped	Aha! sends one fixed message shape for all activity	Filter down to comment-creations before anything else runs
7	No symptom, and that is the point — this one is already prevented	A configuration edit while runs are waiting could otherwise change a run already in flight	Workers read a frozen copy of the configuration taken when the run started, never the live file. Do not add a path that reads live configuration at run time. See below
8	A run ends before it finishes and the working session is lost	Unknown	Open
9	A capability appeared and was withdrawn the same day	Cost. A deliberate decision, not a fault	Recorded because “why did that stop working” is a question someone will ask, and the answer deserves to exist
Entry 7 is a governance control, not an implementation detail
It reads like plumbing and it is not. Because every run keeps the configuration it started with, a run can be reproduced after the fact — you can see exactly what the agent was told to do at the moment it ran, not what the file says today.

That is what makes an accept or rework verdict in the Agent Run Logger mean something six weeks later. Without it, a reviewer's verdict is attached to a configuration that may since have changed, and the evidence base in Section 12 stops being evidence. Anyone proposing a change here is touching the audit trail, not the plumbing.

The button that is not a trigger
On GitHub, marking a pull request Ready for review starts nothing. The implement phase begins on an approving review, or on @be-agent;accept;<hours> in a comment. Nothing else.

It is worth knowing before an enablement week because it fails silently and looks like the agent is down: the developer takes the obvious action, the platform is not listening for it, and no error appears anywhere. The same applies to the Issue comments webhook event — without it subscribed, the comment commands never reach the platform at all, and again nothing reports a fault.

15.5 Resolved, kept for the pattern
Event	Date	Outcome
QA Agent credential problem	17 July 2026	Resolved
Frontend Implementation cloud trigger not firing	17 July 2026	Fixed
Both were credential or trigger-wiring problems, which is what most of this list turns out to be. That is the useful pattern in the whole section: if a new agent misbehaves on day one, check the credential and the trigger rule before looking anywhere else. It is almost never the model.

15.6 Adding an entry
Five fields, in this order:

Issue — a short name someone could search for
Symptom — what the person sees, in their words rather than the system's
Root cause — or unknown. Never a plausible guess
How to avoid — or nothing, if it is not yet known
Who to ask — a name, not a team
Date it if you know the date. An undated entry is still worth more than an unwritten one.

Where this list lives. The full version is maintained in the operations layer at operations/Troubleshooting.md, owned by Andri. This section carries it because a reader who hits one of these problems needs it in front of them, not one link away. If the two disagree, the operations copy wins and this section is refreshed.
