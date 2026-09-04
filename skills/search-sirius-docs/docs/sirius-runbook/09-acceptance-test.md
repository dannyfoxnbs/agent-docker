9
Acceptance Test
The owner's guide is the source. Acceptance Test Agent, written by Wesly, covers the five stops, with real screenshots of a draft and its export. This page is the fifteen fields for someone switching the agent on; that one is the full guide for someone learning it. Where they disagree, follow the owner's. Captured 29 Aug 2026.

Field	
Purpose	Writes the test cases so the team reviews the coverage instead of typing it out
Owner / backup	Wesly / none named
Maturity / risk	Establishing. Not a gate agent. Five steps, two of which are yours
Trigger	A QA ticket tagged with a test prefix moving from ready-for-dev to in-progress. Only the status transition can start a fresh chain; a mention can continue one
Trigger syntax	@acceptance-test-agent;refine;<feedback> @acceptance-test-agent;rework;<yes/no>;<KG/AG/HG>;<feedback> @acceptance-test-agent;accept;<manual_effort_hours>
Prerequisites	A scope summary table on the QA ticket, and an impact analysis on its Epic. In the normal pipeline nobody writes either by hand — Task Creation and Impact Analysis produce them upstream
Input	The QA ticket first, which is scoped tighter than the Epic and often to one region or one page; then the Epic's analysis, a Breeze scan, the design child's prototype, and existing Qase cases
Expected output	A draft as a comment for you to read, then on your acceptance an export to Qase: cases, a test plan, suite folders created as needed, and a summary mirrored onto the automation sibling ticket
Review & logging	You read the draft and reply. The draft loop repeats as many times as you need. 100% verdict coverage in the last graduation period — the only agent to manage it
Common failures → fix	Three conditions stop a run, and each posts its reason on the ticket rather than failing quietly. No scope summary, or no configured platform named in it, so it cannot tell which Qase project to target. More than one platform named, which is always fatal — one run targets one project, so split the ticket. More than one tier, but only where that platform's tiers map to separate projects; where a platform declares no tiers, two tiers in one cell are read as scope and the run proceeds
Monitor	Runs recorded on the platform, with the export summary on the ticket
Re-run safety	Safe. A case already in its target suite is folded into the plan rather than created again, so re-accepting never doubles anything up. Near-identical suite names are folded together — a later ticket proposing Bid Trackers lands in an existing Bid Tracker rather than forking the tree, while Bid Management stays separate. Every fold is reported on the draft comment. To add coverage after an export, put additional: and what you want on its own line in a comment; only the new cases are drafted and the exported ones are never rewritten, so titles do not drift
Known gaps	Agent Acceptance Rate 57% against a floor of 85%. It is the only agent improving on both rates, and still short. accept does two jobs here — it records your verdict like everywhere else, and it also performs the export. No other agent's accept writes anything
Source	The Acceptance Test Agent guide, and the platform documentation
