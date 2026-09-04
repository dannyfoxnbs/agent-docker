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

