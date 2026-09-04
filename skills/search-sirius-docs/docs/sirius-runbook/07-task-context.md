7
Task Context
Field	
Purpose	Builds the Task Context Manifest — the classification, architecture decisions and implementation tasks that Task Creation turns into tickets
Owner / backup	Andri Ferinata / none named
Maturity / risk	Establishing. Not a gate agent
Trigger	A status transition into the task-context status, from either impact analysis or design creation. There is no bare mention that bypasses the status gate. A duplicate transition is rejected and recorded as a failed run
Trigger syntax	@task-context-agent;refine;<feedback> @task-context-agent;rework;<yes/no>;<KG/AG/HG>;<feedback> @task-context-agent;accept;<manual_effort_hours>
Prerequisites	The Breeze Scope Manifest field is filled, with a report link at the top
Input	The topmost report link off the scope manifest, and the ticket
Expected output	The Task Context Manifest field on the ticket. Nothing is published to the documentation space and the description is not edited
Review & logging	Reviewer tags a verdict with manual time. A well-formed comment fills the previous run's log entry automatically, and it stays editable afterwards
Common failures → fix	The scope manifest is empty, so there is nothing to read. A repeat transition, rejected by design — use refine or rework
Monitor	Has a dashboard renderer
Re-run safety	A fresh run cannot be repeated on the same ticket. Revision is safe
Known gaps	Agent Acceptance Rate 45% against a floor of 85%, on 96% coverage — so this is a real quality signal rather than a measurement one. Rework is improving across periods; accept is flat
Source	Platform documentation, audited against the codebase in August
