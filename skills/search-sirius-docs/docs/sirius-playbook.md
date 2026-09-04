Hubexo · Project Sirius
Sirius Playbook
How we build with agents, and where people decide. Agents draft the work. People review it. Seven pages, for a team about to adopt Sirius: read them before the onsite session. The Sirius Guidelines carry the detail you will want once you start.

Version
1.0 · Enablement release
Audience
All Hubexo Tech Delivery tribes
Last updated
29 August 2026
Maintained by
GDH Delivery Lead

Questions
Sirius Service Desk
Raise a request
Any question, however small
Introduction & Glossary
What the Sirius Agentic SDLC is, and the handful of words you need to follow the rest.

The idea in three sentences
Agents draft the work. People review it. Agents Generate. Humans Govern.

We are moving from traditional Scrum to a way of building where AI drafts the first version of everything — strategy, design, code, tests — and people decide whether it's good enough to move forward. A person starts every run, and no work leaves a phase without a person agreeing it should.

Two rules that decide everything else
Human-Driven. AI is the engine; people hold the handlebars. Every agent has one named owner who directs it, reviews its output, and approves it.
More output, and the people to match it. Sirius is not a headcount exercise. It is meant to produce more. But agents produce drafts, and every draft needs a person able to judge it — so a share of the time saved goes back into the team's skill, thinking and wellbeing. Output rises as fast as the team's capacity to review it, and not faster.
What it is, and what it isn't
It is	It isn't
Agents draft, people review	Hands-off automation
More output, with the skill to review it	Output the team has no capacity to check
Agents earn trust by proving quality	Agents "graduated" on a date
A gradual change run alongside live work	A big-bang switch
Time saved reinvested in the team	A headcount exercise
The words you actually need
You don't need the full dictionary to take part. You need these.

The four building blocks (smallest to biggest, like a building site):

Skill — a reusable how-to an agent picks up for one kind of task. A tool in the toolbox.
Sub-Agent — a temporary helper an agent spins up for one narrow job, then discards.
Agent — a worker that owns a whole job: reads its inputs, does the work, produces output. Every agent has one named human owner. The craftsman.
Orchestrator — the coordinator that runs many agents and passes work between them. The site foreman. It coordinates; it does not approve.
The five maturity statuses an agent moves through, earned by evidence, never by calendar:

Not Started → Manual → Testing → Establishing → Optimizing.

Roughly: nobody's built it yet → done by hand → prototype under full review → the owner's normal way of working → the trusted default.

The gate — a required human sign-off. Agents never skip one. Four kinds: Hard (must pass), Iterative (send back for another round), Selective (human picks among options), Conditional (only applies in certain cases).

Everything else — exact numeric thresholds, the full term list — lives in the Glossarium. This page is only what you need to follow a conversation.

Who this is for
This started on the Forever Promise Tribe (Project Sirius) and is now rolling out to every Hubexo Tech Delivery tribe, across ANZ, APAC, EU and US. That rollout runs through Workstream 4 (WS4), with two local guides per tribe — a Hub Ambassador and a Twin Ambassador. Page 7 covers how a tribe checks its own readiness and finds its gaps. Nobody adopts everything at once.

The seven pages
Introduction & Glossary — the idea and the vocabulary (you're here).
Infrastructure — what the agents run on.
The Workflow — the three phases and the one coordinator.
Human Gates — where people sign off, and how.
Observability & Metrics — what we measure, and the line we won't cross.
Governance — how agents earn trust and who decides.
Readiness & Adoption (WS4) — how your tribe gets started.
Infrastructure
What the agents run on. You won't operate most of this, but knowing the parts helps when something breaks.

The short version
Agents run in the cloud, think using Claude, reach your everyday tools through a standard connector, and ship code through GitHub. Credentials are locked in a vault and every run's cost is tracked. That's the whole picture.

The parts, in plain terms
Part	What it is	Why you care
Cloud (AWS)	Where agents run. Some wake up on demand and stop when idle; a few run continuously.	Agents are available when you trigger them, and we only pay for what runs.
The model (Claude, via AWS Bedrock)	The reasoning engine behind every agent.	This is the "brain" doing the drafting.
MCP connectors	A standard plug that lets an agent securely read and write a tool.	It's how an agent can open a Jira ticket or a Figma frame without a person copying things across.
GitHub	Where code lives and how it ships (build and deploy are automated).	One home for agent code and product code, moved off the old BitBucket setup.
Secrets vault + least-privilege access	Credentials stored centrally; each agent gets only the access it needs.	Keeps the keys safe and limits what any single agent can touch.
Cost tracking	Token use and cost logged per agent.	We can see which agents are expensive and tune them.
The tools agents connect to today: Aha!, Jira, Qase.io, GitHub, Breeze (the knowledge graph), BrainGrid, and PostHog.

Design does not go through Figma. Page designs are HTML using shared Tailwind tokens, authored with Claude, and they live in one design repository alongside the design systems and a per-sprint record of what shipped. Worth saying plainly, because most people assume a design agent means Figma.

One coordinator, not many
Earlier the design had several coordinators, one per track. It has since simplified to one Main Orchestrator that runs the whole pipeline. Fewer moving parts to operate, one place to look when a handoff goes wrong.

If you are on call, go to the agent runbook, not this page. The exact AWS settings, scaling rules and alarms change too often to copy here.

The Workflow
How work moves through the Sirius Agentic SDLC. If you read only one page to understand how we build, read this one.

The whole idea in three sentences
Agents draft the work. People review it. One coordinator moves it along, but never decides on its own.

That is the whole model. Everything below is detail.

The three phases
Work travels through three phases. Each one takes something rough and hands the next a cleaner version of it — and the handover is a person, every time.

an idea
a committed Epic
specs and tasks
merged code
shipped
Strategic
Spec Sprint
Implementation
shape · evidence · commit
impact · design · tasks · tests
build · review · QA · deploy
measured, into Crux
1
2
3
Product Manager
commits the Epic
Delivery Manager, Designer
and QA approve
reviewers merge,
QA signs off
Nothing crosses a boundary until the person at that gate says so.
And nothing starts from nothing: the next idea is argued from what the last release did.
Here they are side by side.

Strategic	Spec Sprint	Implementation
Purpose	Turn a raw idea into a committed, well-formed Epic.	Turn the Epic into buildable specifications.	Turn specifications into reviewed, tested, deploy-ready code.
What happens	Discovery, hypothesis, feasibility, prioritisation, commit.	Impact-aware design, acceptance tests, task breakdown.	Build (with tests), review, QA, deploy.
Who owns it	Product Owner / PM (architect supports feasibility).	Delivery Manager, Designer, QA Lead.	Engineers per track, Tech Lead, QA Lead.
The human gate	PM approves the Epic before it's committed.	Owners approve design + tests + tasks before any code.	Humans review and merge; QA Lead signs off deploy readiness.
Goes in	An idea, a signal, a problem worth solving.	The committed Epic.	The approved specs and tasks.
Comes out	A committed Epic in Aha!/Jira with problem, goal, priority.	Approved design, acceptance tests, task breakdown.	Reviewed, tested, merged, deployed code.
Where it gets hard	Needs someone to hold the PM's gate. Where there is no PM, that is named before the phase runs. Output is only as good as the input data.	Highest-rework agents live here. Design steps don't apply to teams with no UI.	Autonomous runs are scaling fast, but only QA is near "trusted default" so far.
That last row is deliberate. Sirius ran across three different teams (LeadManager, ETL, Harvester), and they are not the same shape. LeadManager has a UI, a database, and a PM. ETL and Harvester have none of those, so some agents simply don't apply to them. If a phase or an agent says "not applicable" for your team, that's expected, not a gap you failed to fill.

You don't need a complete team to start. The "who owns it" row names the roles LeadManager happened to have, not roles you must hire. A gate means a person decides; which person is your call. If one person holds three gates that LeadManager spreads across three people, that's a normal shape, not a compromise. What a smaller team really changes is how much output one reviewer can absorb, so switch agents on a few at a time rather than all at once.

The coordinator (the "Main Orchestrator")
There is one coordinator that runs the pipeline end to end. Think of a site foreman: it sequences the agents, passes work between them, and runs the build-and-check loops so the pieces fit.

It is powerful, so it's worth being clear about what it does not do:

It does not approve work. Every gate is held by a person.
It does not skip a phase or a gate to save time.
It does not change an official record (Jira, GitHub, and so on) without a human sign-off.
That's the line that keeps this "human-driven" and not "hands-off": the coordinator moves the work, people decide whether it's good enough to move.

Three things you'll hear on day one
You don't need the whole glossary to follow a standup. You need these.

Run — one execution of one agent against one work item. It's the unit everything is counted in: how long, what it cost, and whether you accepted it. Every agent comment on a ticket links to its run.
Accept, Refine, Rework — your verdict on what an agent produced. Accept means usable as it stands, and you give the hours it saved you. Refine means it wasn't usable, so you added the missing context and re-ran — the gap was in the inputs, not the agent. Rework means not acceptable, and it needs a reason someone can act on. Rework also means moving the ticket back to the status that owns the fix, not just tagging it.
Board Status and Agent Status — a ticket carries two states. Board Status is where the work is, and only a person moves it. Agent Status is where the agent run is, and it moves on its own. They can disagree, and the first time they do it is confusing. Now it won't be.
One thing that keeps changing (read it live)
The exact list of agents is still settling (it has gone from 24 to 20 to 19 during the pilot, and it will move again). The shape on this page (three phases, one coordinator, human gates) is stable. For the current agent list and how far each one has matured, don't trust a number written here. Open the live AI Agent Progression Status and read today's.

Human Gates
Where a person says "yes" before the work moves on. This is the heart of "Humans Govern."

The rule
No agent moves work past a gate on its own. A gate is a point where a named human reviews what the agent produced and decides: good enough to proceed, or not. If you remember one thing from this page, remember that.

Four kinds of gate
Gate	What it means	Example
Hard	Must pass before anything continues.	A committed Epic, or code merged to main.
Iterative	Send it back for another round.	"Close, but redo the acceptance tests."
Selective	The human picks among options the agent offered.	Choosing one of three design directions.
Conditional	Only applies in certain cases.	Extra security review, but only for changes that touch payments.
Gates get lighter as trust grows (they never disappear)
How closely you look depends on how far the agent has earned its place:

Testing — you review everything. Rework is normal here.
Establishing — you review lightly; the agent is usually right.
Optimizing — you spot-check a sample; the agent is the trusted default.
Trust changes how closely you look, not whether you look.

The reviewer's verdict
Every review lands on one of three: Accept (use it), Rework (fix and re-run), Reject (don't use it). These verdicts are logged, and they're what tell us whether an agent is ready to move up. (More on that in Observability & Governance.)

The Hard Gate Checklist
The must-pass checkpoints for each stage live in the Hard Gate – Checklist (a live list, owned by named people, updated each sprint). It's the operational companion to this page: this page explains the gates; the checklist tracks whether each one actually passed, with evidence and an owner.

Observability & Metrics
What we measure, and the one line we won't cross.

Everything starts with the Agent Logs
Every agent run is logged: what it did, how long it took, whether the output was accepted or reworked, whether it hallucinated, and how much manual time it saved. Nothing else on this page works without this. If a run isn't logged, it didn't happen as far as the metrics are concerned.

The few numbers that matter
We deliberately track a short list, well, rather than a wall of charts nobody reads.

Agent Acceptance Rate — how often an agent's output is used as-is, first time. The clearest quality signal.
Rework rate — how often it needs another round. Some rework is healthy iteration, not failure.
Time saved — counted only when the output was actually accepted. We don't claim time savings on work that got thrown away.
DORA — our standard delivery health: how often we ship, how fast, how safely, how quickly we recover.
The line we won't cross
A milestone is not a metric, and ticket count is not the measure. Getting the pipeline running is a milestone we celebrate once, not a number we chase. More output is the point, but it is delivered, reviewed work that counts — not tickets moved.

And we watch the people, not just the machines. Here's why that matters, from our own pilot:

Delivery went elite — near-perfect uptime, fast recovery, deploys rebounding — while team engagement fell sharply (8.45 → 7.2 in a month, the biggest single drop on record) and over 100 finished items piled up in a final-check queue. The machines were green. The people were red.

That is exactly the signal this page exists to catch. Strong delivery numbers can hide a tired team. We read both, and pace beats output when they conflict.

Governance
How an agent earns trust, and who decides. Governance here is there to keep the model safe and to let people take part with confidence — not to slow anyone down.

Agents earn trust; they aren't granted it
An agent moves up a level only when the logs show it's ready — a steady Agent Acceptance Rate, low rework, no serious mistakes. The AI Governance Team signs off each promotion against that evidence — the Hub and Twin Ambassadors with Sirius Platform Engineering. See Guidelines 9. No agent graduates because a date arrived.

Changing an agent is controlled, so trust doesn't quietly erode
Prompts are versioned, like code.
Every change needs a reason and a quick test showing it still behaves.
Overrides are logged.
This is what stops an agent that everyone trusts from drifting into something different without anyone noticing.

Deciding what continues
When the pilot ends, each agent gets a clear call, with evidence behind it:

BAU-ready — keep running as normal.
Hypercare — keep, but watch closely for now.
Redesign — the idea is right, the build isn't there yet.
Retire — not worth continuing.
Every agent that continues has a runbook and a named owner, so knowledge never sits with one person.

Why governance is light on purpose
Enough process to keep trust and protect people; not so much that the team spends its saved time filling in forms. Governance here is about enabling participation and ownership, not policing it. If a rule isn't earning its place, we drop it.

Readiness & Adoption (WS4)
How your tribe gets started — a repeatable way to check where you stand and find your gaps. Nobody adopts everything at once.

Start where you are, not where the pilot ended
The pilot team spent months building this. Your tribe doesn't repeat that from scratch. You assess where you are today, pick the highest-value gaps to close first, and grow from there. This page is the method for doing that the same way in every tribe, so we can compare readiness fairly.

Two people who make it land locally
Change doesn't travel on a document. It travels through people the team trusts. Each tribe has two:

Hub Ambassador	Twin Ambassador
Their job	The local anchor for trust and psychological safety through the change.	The role-model who shows the value in everyday work.
Strength	Trusted locally; turns the global message into something that means something here; spots where people quietly disconnect.	Deep expertise in a role; connects the change to real, day-to-day tasks.
Focus	Honest, unfiltered conversations; surfacing resistance early; local support.	Working through shared pain points; building case studies on real tickets.
The Hub Ambassador watches the human side. The Twin Ambassador proves the everyday value. You need both.

The readiness check: four things, per team
The workflow itself is not one of the four. The three phases and the gates are adopted as they stand. Refinements are proposed after a team has run the whole thing, on the evidence of having run it — not chosen from a menu beforehand. That is deliberate: the pilot could only tell what was worth changing after it had been through the full loop once.

What the check establishes is what it takes to run it here:

Roles — every gate needs a person. Where the team has no one in a role, name who holds that gate instead.
Agents — which agents have inputs on this team. An agent with nothing to read does not run: a team with no UI has no design work for the design agents to act on.
Tools — what needs connecting (Jira or Azure DevOps, Aha!, Breeze, GitHub, and so on).
Metrics — what this team tracks from day one, and the baseline taken before anything is switched on.
Each team comes out with a named list of gaps to close — not a pass/fail score, and not a shorter version of the workflow.

What changes for you
The short version: nothing about your judgement changes, and a lot of your typing goes. You stop assembling context, drafting the first version, and copying things between tools. You start reviewing more, earlier, and deciding faster.

If you are a…	What changes on Monday	What gets harder
Product Manager	Epics are drafted from a short description. You interview the agent instead of facing a blank page, and you approve before anything saves to Aha!	Judging whether a drafted Epic is actually supported by evidence, and being willing to send it back
Solution Architect	Impact Analysis and Feasibility give you a first read across the repositories. Architecture Implementation proposes; it does not execute	Reading a machine impact assessment critically — especially where one layer degraded to limited visibility and the analysis still looks confident
Delivery Manager	Task Creation breaks Epics into child tickets. Sprint Planning recommends scope. You decide both	Spotting a breakdown that is plausible but wrong, which is harder than spotting one that is obviously wrong
Designer	Design Context assembles the brief; Design Creation produces the artifacts. Both stop and wait for you	Specifying tightly enough that the agent has something real to work from
Engineer	You approve a plan before code is written, then review what comes back as a pull request	Reviewing code you did not write, at higher volume, without the review becoming a rubber stamp
QA Engineer	Acceptance Test drafts cases from the ticket. The QA Agent runs the pipeline end to end	Testing what the agent did not think to test — generated cases cluster around the happy path
The pattern is the same for everyone. The work that goes is assembly. The work that stays is judgement, and there is more of it per hour than there was before. That is why the time saved is not all spent on more tickets: the reviewing is the job now, and it needs people who are good at it.

One thing everyone learns, whatever the role. Tag the outcome at the point of review — accept or rework, with the time it would have taken by hand. Thirty seconds, and it is the only evidence that exists for whether an agent is working. A verdict remembered a week later is not evidence.

Readiness is about people, not installs
A team can have every tool connected and still not be ready. The real signals are simpler: are people actually using the agents, and is the team healthy enough to take on change? Our pilot shipped beautifully while the team burned out. Readiness that ignores that isn't readiness. So the check includes a plain read on adoption and wellbeing, not just tooling. A green tooling checklist next to an exhausted, unconvinced team is a false positive, and it is the most expensive mistake a rollout can make.
