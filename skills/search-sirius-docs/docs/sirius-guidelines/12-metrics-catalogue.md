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

