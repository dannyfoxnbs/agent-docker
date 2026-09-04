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

