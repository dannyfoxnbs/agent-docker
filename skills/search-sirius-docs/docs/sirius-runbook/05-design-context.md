5
Design Context
Field	
Purpose	Turns one Epic into the UX and UI design brief that Design Creation builds from
Owner / backup	Maureen / none named
Maturity / risk	Testing. Not a gate agent — it writes the ticket unreviewed, so review happens after delivery
Trigger	Two implementations, and they differ. The platform agent runs on the status transition into the design-context status — that exact pair only, and the older design status fires nothing. A refine or rework comment on the Epic itself regenerates the whole brief. The local variant is a command in Claude Code, and a comment on it bypasses the status gate entirely
Trigger syntax	@design-context-agent;refine;<feedback> @design-context-agent;rework;<yes/no>;<KG/AG/HG>;<feedback> @design-context-agent;accept;<manual_effort_hours>
Prerequisites	The ticket is an Epic or a Story; the Breeze Scope Manifest field is filled with a report link; the Breeze Product is set; a mock-up is attached. The local variant additionally needs a Figma connection and a Task Context Manifest naming UI work — it aborts outright without either
Input	The manifest field, the impact analysis report it links, the description, and design references attached to the ticket — HTML, spreadsheets, documents or images. The platform agent reads no Figma and no external design service; design references come from attachments. The local variant probes a Figma connection before its gate
Expected output	How many children depends on the path. The platform agent writes exactly one per Epic; the local variant writes one per UI or UX row in the manifest. Each is a child task whose description is the four-section brief: definition of done, scope summary, detailed specification, and dependencies. Plus a recommendations and open questions comment where it is uncertain
Review & logging	The designer reviews the child's description and tags a verdict with manual time, at review time
Common failures → fix	It ran but wrote nothing — the impact analysis found no design work, so fix the analysis rather than the agent. Several design children exist — duplicates do not self-heal, so clean them by hand. Nothing happened — the transition has to be the exact status pair. Manifest or access problems — raise with the Impact Analysis owner rather than this one, since the manifest is written upstream
Monitor	The Agent Status field on the Epic, and a dashboard filter whose name is unverified
Re-run safety	Safe. It matches the existing child and updates in place. Pre-existing duplicates are not repaired — the first match is updated and the rest silently left. Pause after two consecutive failures.
Known gaps	Two live implementations differing on trigger and on how many children they write. The failed status was wired late, so a stale ready-for-review on an older Epic is not proof of success. Passing so far on 7 tagged runs, which is too few to count
Source	The Design Context runbook and the platform documentation
