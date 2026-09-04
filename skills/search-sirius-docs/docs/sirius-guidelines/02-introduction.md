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

