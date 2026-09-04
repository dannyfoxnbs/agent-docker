4
Impact Analysis
Field	
Purpose	Works out what a change touches across repositories, using the Breeze knowledge graph, and publishes the reasoning as a report
Owner / backup	Andri Ferinata / none named
Maturity / risk	Establishing. Not a gate agent — it writes the report unreviewed
Trigger	A status transition into the impact-analysis status, and only that. There is no command that starts a fresh run; a mention can only revise a report that already exists. A second transition on a ticket that already has a run is rejected and recorded as a failed run
Trigger syntax	@impact-analysis-agent;refine;<feedback> @impact-analysis-agent;rework;<yes/no>;<KG/AG/HG>;<feedback> @impact-analysis-agent;accept;<manual_effort_hours>
Prerequisites	Breeze reachable and the team's projects mapped; the ticket carries enough description to analyse
Input	The ticket including any Spec Refiner block, up to five parent tickets for business context, attachments, and a deep Breeze scan across all four graphs
Expected output	A report published to the documentation space, its link prepended newest-first to the ticket's Breeze Scope Manifest field, and the analysis saved back into Breeze as the ticket's impacted ontology
Review & logging	Reviewer tags accept, refine or rework at review time. A well-formed comment fills the previous run's log entry automatically, so the verdict is captured without a separate visit to the dashboard
Common failures → fix	A duplicate transition, rejected by design — use refine or rework instead. Breeze unreachable, which produces a report grounded in nothing
Monitor	Has a dashboard renderer, with a tab showing per-step status. The best-instrumented agent on the platform
Re-run safety	A fresh run cannot be repeated on the same ticket by design. Revision through refine or rework is safe and expected
Known gaps	One reporting step is disabled in the shipped step list. Agent Acceptance Rate has declined across four periods — 83%, 71%, 82%, then 48% — against a floor of 85%
Source	Platform documentation, audited against the codebase in August
