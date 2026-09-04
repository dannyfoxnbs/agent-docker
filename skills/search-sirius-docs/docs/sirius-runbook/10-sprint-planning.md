10
Sprint Planning
Field	
Purpose	Plans the team's next two-week sprint: reads the Epics that reached ready-for-dev, works out how many hours each person really has, suggests assignees, and shows which Epics fit
Owner / backup	Faisal Murkadi / none named
Maturity / risk	Not assessed — no runs logged in the last graduation period. Low risk by design: everything is a suggestion until a person presses Proceed
Trigger	/sprint-planning in Claude Code, no arguments. Never autonomous. The cloud worker was withdrawn and the capability now runs locally only
Trigger syntax	/sprint-planning in Claude Code, no arguments
Prerequisites	Epics sitting in the ready-for-dev column of the refinement board; every engineering task has a story-point value, read directly as hours, so a task without one makes its whole Epic wait; and current settings for public holidays, leave and each person's time split
Input	Nothing to supply. It gathers the Epics, the delivery board's work history for tie-breaking between equally free people, and the settings. Your only inputs are optional overrides on the dashboard
Expected output	One stable link to a sprint dashboard: four summary tiles, an assignment view with a suggested person per task, and team capacity. After Proceed: each ticket's sprint field set, status moved, and the sprint started
Review & logging	The Delivery Manager reviews on the dashboard and can change any assignee, hours or board before pushing. Nothing reaches Jira until Proceed. No run log
Common failures → fix	Data older than twelve hours shows an amber stale banner — press Refresh. A task with no story points holds its Epic back — add points in Jira. Unclassifiable items are listed and held out of the plan — fill in the ticket code or the product field
Monitor	The dashboard's own freshness stamp, plus the notices listing anything held back
Re-run safety	Re-running is normal operation. Refresh re-reads, recomputes and redraws, and your overrides are kept
Known gaps	No named maturity band and no documented run-failure modes. The published runbook page carries several fields copied from the QA agent, including its owner names and an autonomous trigger this agent does not have. The fields above come from the specification instead
Source	The Sprint Planning runbook, read against its own corrections
