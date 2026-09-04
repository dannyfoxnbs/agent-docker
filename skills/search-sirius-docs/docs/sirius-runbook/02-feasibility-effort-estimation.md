2
Feasibility and Effort Estimation
Field	
Purpose	Estimates a ticket's T-shirt size for a 2 to 5 developer team, grounded in a Breeze scan across all four graphs
Owner / backup	Andri Ferinata / none named
Maturity / risk	Establishing. Not a gate agent — advisory. Effort never enters the priority score
Trigger	A comment on an Aha! record, or a comment on a Jira ticket for teams on the second tenant. It also re-runs automatically after an epic commits
Trigger syntax	@feasibility-agent;start @feasibility-agent;refine;<feedback> @feasibility-agent;rework;<feedback>
Prerequisites	An Aha! token, and Breeze projects mapped for the team
Input	The Aha! epic or Jira ticket, any prior assessment and its questions, and a live Breeze scan across functional, design, code and architecture
Expected output	A written assessment as a comment, and the native Delivery T-shirt estimate field set — Extra-Small, Small, Medium, Large or Extra-Large. On the Jira path it writes a Feasibility Assessment field instead
Review & logging	Run recorded on the platform. This agent has no rework verb, so no hallucination source is ever captured for it
Common failures → fix	Breeze unmapped for the team, so the scan returns nothing and the estimate is ungrounded. No status field flip and no dashboard renderer, so a failed run is quiet
Monitor	No dedicated dashboard renderer. Runs fall back to the generic output view
Re-run safety	Safe. A later assessment supersedes the earlier one on the record
Known gaps	No backup owner. No rework verb. Verdict coverage was 35% in the last graduation period, so the accept rate cannot be read
Source	Platform documentation, audited against the codebase in August
