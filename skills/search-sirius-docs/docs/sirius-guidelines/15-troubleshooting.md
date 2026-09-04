15
Troubleshooting Guide
15.1 What this section is for
A named symptom, so the person who hits it can recognise it and stop guessing. Troubleshooting is “the Jira automation is not firing”. It is not “an agent pushed bad code and nobody noticed for a day” — that is a governance failure and it belongs in 9.5.

The distinction matters because the two need different responses. A troubleshooting entry needs a fix. A governance failure needs a decision about who was supposed to be looking.

15.2 Read this before you trust it
Delivery collected the symptoms. Several root causes are genuinely unknown, and the entry says so rather than guessing. Anyone who worked the incident should correct their entry.

An entry still marked unknown months later is a small hole in the platform's own memory. It is worth treating as a gap, not as a completed record.

Leave root cause blank rather than guessing. A wrong root cause is worse than an open question, because it stops anyone looking: someone reads the entry, accepts the explanation, and the real fault stays in the system.

15.3 The one to read first
An agent reported a successful push. Nothing arrived in the repository. No error reached the user.

The cause was a credential that had expired or been rotated — a token, which is the password an agent uses to prove who it is. The write failed, and the failure was never passed back up.

This is the most serious entry in the list, and not because of the lost work. A silent success is worse than a loud failure, because a human gate downstream approves work that does not exist. The reviewer does their job properly, reads what they were shown, and signs off on nothing. The gate held and still let the problem through.

The right response is a fix rather than a workaround: an agent that cannot verify its own write should not report success. Currently unowned.

15.4 The incident list
Ask Andri on any of these unless another name is given.

#	Symptom	Root cause	What to do about it
1	An agent reports success but nothing arrives in the repository, and no error surfaces	An expired or rotated credential. The write fails and the failure is not passed back	Unknown. See 15.3 — this is the one that defeats a human gate
2	An agent triggers on its own comment and loops	The system cannot tell the bot's own writing from a person's	Check the bot's own user id and email before anything else runs. The Feasibility Agent already does this. Any new agent that triggers on comments needs this guard on day one, not after the first loop
3	An agent reports a gap or a missing section that is actually present in the source	The agent only saw part of the input — it was cut short before it reached the end	Unknown. Not established whether this was a size limit, a retrieval limit, or a parsing boundary
4	Code Review returned “access denied” against ETL's own configuration · 27 July 2026	Unknown. A permissions problem is likely, and has not been confirmed	Open
5	Routing rules cannot be evaluated from the raw Jira message	The message Jira sends does not carry enough of the ticket to decide which agent should act	Not a fault. The platform fills in the rest — it fetches the full ticket and its history before routing. Expect this, and never write a rule that assumes the raw message
6	Every Aha! activity arrives at the same place, identically shaped	Aha! sends one fixed message shape for all activity	Filter down to comment-creations before anything else runs
7	No symptom, and that is the point — this one is already prevented	A configuration edit while runs are waiting could otherwise change a run already in flight	Workers read a frozen copy of the configuration taken when the run started, never the live file. Do not add a path that reads live configuration at run time. See below
8	A run ends before it finishes and the working session is lost	Unknown	Open
9	A capability appeared and was withdrawn the same day	Cost. A deliberate decision, not a fault	Recorded because “why did that stop working” is a question someone will ask, and the answer deserves to exist
Entry 7 is a governance control, not an implementation detail
It reads like plumbing and it is not. Because every run keeps the configuration it started with, a run can be reproduced after the fact — you can see exactly what the agent was told to do at the moment it ran, not what the file says today.

That is what makes an accept or rework verdict in the Agent Run Logger mean something six weeks later. Without it, a reviewer's verdict is attached to a configuration that may since have changed, and the evidence base in Section 12 stops being evidence. Anyone proposing a change here is touching the audit trail, not the plumbing.

The button that is not a trigger
On GitHub, marking a pull request Ready for review starts nothing. The implement phase begins on an approving review, or on @be-agent;accept;<hours> in a comment. Nothing else.

It is worth knowing before an enablement week because it fails silently and looks like the agent is down: the developer takes the obvious action, the platform is not listening for it, and no error appears anywhere. The same applies to the Issue comments webhook event — without it subscribed, the comment commands never reach the platform at all, and again nothing reports a fault.

15.5 Resolved, kept for the pattern
Event	Date	Outcome
QA Agent credential problem	17 July 2026	Resolved
Frontend Implementation cloud trigger not firing	17 July 2026	Fixed
Both were credential or trigger-wiring problems, which is what most of this list turns out to be. That is the useful pattern in the whole section: if a new agent misbehaves on day one, check the credential and the trigger rule before looking anywhere else. It is almost never the model.

15.6 Adding an entry
Five fields, in this order:

Issue — a short name someone could search for
Symptom — what the person sees, in their words rather than the system's
Root cause — or unknown. Never a plausible guess
How to avoid — or nothing, if it is not yet known
Who to ask — a name, not a team
Date it if you know the date. An undated entry is still worth more than an unwritten one.

Where this list lives. The full version is maintained in the operations layer at operations/Troubleshooting.md, owned by Andri. This section carries it because a reader who hits one of these problems needs it in front of them, not one link away. If the two disagree, the operations copy wins and this section is refreshed.
