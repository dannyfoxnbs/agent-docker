14
Code Review
Field	
Purpose	Reviews backend and frontend pull requests, and runs a deterministic branch-policy check first
Owner / backup	Ardall Niswar / none named
Maturity / risk	Optimising as banded, not gateable on the latest evidence. Advisory — it writes a comment and blocks nothing
Trigger	A pull request opened or updated, on either source-control provider. No command, no mention
Trigger syntax	@code-review-agent;accept;<manual_effort_hours> @code-review-agent;rework;<yes/no>;<KG/AG/HG>;<feedback>. Agent owners only
Prerequisites	The repository is registered; the branch policy is configured for the team's branching model
Input	The pull request metadata and a shallow clone of the source branch, with the diff bounded by a budget
Expected output	A branch-policy verdict recorded on every run, findings, and one aggregated comment on the pull request
Review & logging	Runs recorded on the platform. No accept or rework verb in the comment grammar — verdicts reach it only through the dashboard. Rework is not measured on this agent, and nothing yet stands in its place, per 3.8
Common failures → fix	The branch policy fails closed. A pull request into a target no rule matches is a violation, the run is marked skipped, and the review below never happens. There is no comment and no status for this, so it looks like the agent simply did not run. This is the most common misconception about it
Monitor	The run detail page's validation tab is the only place the branch-policy verdict appears
Re-run safety	Safe. A new commit re-runs the review
Known gaps	Verdict coverage fell from 70% to 23% while volume stayed high. It passed the two previous graduation periods and would have passed again on rate alone at 100% accept. Used more, judged less
Source	The Code Reviewer and Merge Validation platform pages
Merge Validation is not a separate agent. It is the branch-policy check that runs as the first step of every Code Review run, on both providers. It has no container, no queue and no page of its own in the roster. An earlier description of it as a standalone agent posting a comment and setting a status describes a design that was never built, and that description is the likely source of a three-way disagreement about what gates the merge.

