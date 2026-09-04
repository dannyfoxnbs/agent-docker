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

