8
Task Creation
Field	
Purpose	Creates every engineering and QA child ticket for one Epic, sized, sequenced and linked
Owner / backup	Faisal Murkadi / none named
Maturity / risk	Establishing. Not a gate agent — the output is reviewed before anything is built
Trigger	Cloud: the status transition into the task-creation status. A bare arrival at that status does not fire it, and a repeat transition is rejected outright. Local: /task-creation <EPIC-KEY>, with a refine mode that takes named children
Trigger syntax	@task-creation-agent;refine;<feedback> @task-creation-agent;rework;<yes/no>;<KG/AG/HG>;<feedback> @task-creation-agent;accept;<manual_effort_hours>
Prerequisites	The anchor is an Epic or a Story — both are valid — with a description, a Breeze Scope Manifest and a Task Context Manifest, all filled. A missing one stops the run and says which
Input	The Epic, both manifests, the topmost report link, and the design child's prototype and handoff attachments
Expected output	Child tasks under the Epic, idempotent by their code prefix, moved to ready-for-dev. Backend and frontend children carry the repository in the title and as a label. Story points per child, and the Epic's own points overwritten with the sum. Blocking links in a fixed order
Review & logging	Reviewer tags a verdict with manual time. A verdict left on a child resolves to the run that created it; a verdict on the Epic re-runs the whole generation and flags children no longer backed by the manifest
Common failures → fix	A missing manifest, which aborts and names the field. A repeat transition, rejected — use refine or rework instead
Monitor	The Agent Status field on the ticket. No dedicated dashboard row named
Re-run safety	Idempotent by code prefix — existing children are updated, not duplicated. Where a refine lands decides what it does: on a child it revises that child only; on the anchor it re-derives the whole plan, which can create new children and mark others as deleted. Pause after two consecutive failures.
Known gaps	Agent Acceptance Rate 55% against a floor of 85%, on 98% coverage. The published runbook page carries several fields copied from the QA agent — its purpose, trigger, prerequisites, outputs, failures and monitor rows all describe a different agent, and the page says so itself. The fields above come from the platform documentation instead
Source	Platform documentation, audited against the codebase in August
