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

