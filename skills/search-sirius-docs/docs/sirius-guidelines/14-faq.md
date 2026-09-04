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

