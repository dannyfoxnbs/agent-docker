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

