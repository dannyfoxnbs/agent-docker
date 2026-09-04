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

