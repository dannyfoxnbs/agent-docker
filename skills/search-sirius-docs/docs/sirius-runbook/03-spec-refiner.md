3
Spec Refiner
Field	
Purpose	Takes one Epic or Story whose description is a brain dump and rewrites it into one clean specification on a [00-MAIN] child ticket. It never changes Product's words and never invents scope
Owner / backup	Faisal Murkadi / none named
Maturity / risk	Not assessed — no runs logged in the last graduation period. Not a gate agent. The only route for new scope is the Delivery Manager's answer in the gaps comment
Trigger	Cloud: an Epic or Story created already sitting in the entry status, or a mention on that ticket. Local: /spec-refiner <TICKET-KEY> in Claude Code. Refine and rework comments go on the [00-MAIN] child, never on the parent
Trigger syntax	Local: /spec-refiner <ticket_key>. Cloud: no command, status transition AWAITING EPIC COMMIT (Aha!) → INCOMING (Jira)
Prerequisites	A working Jira connection; exactly one ticket key; the ticket is an Epic or Story; an Epic must have no Story children; the description is not empty. PostHog optional and read-only
Input	The description and everything linked from it — design images, prototypes, documents — plus the Delivery Manager's answers in the gaps comment, which win over the original text
Expected output	A [00-MAIN] child carrying title, definition of done, scope summary, detailed specification, links and an assessment; a Spec Refiner block appended to the parent listing only new or corrected lines; one gaps comment with an empty answer column
Review & logging	The Delivery Manager reviews the child. Answered gaps are marked as blended in on the next run. Cloud runs record a verdict; the local path records nothing
Common failures → fix	Epic has Story children, which aborts by design — run it on each Story instead. Empty description — write the brain dump first. A very large specification can exceed the Jira description limit
Monitor	No dedicated dashboard renderer yet
Re-run safety	Safe. It finds the existing [00-MAIN] child and updates it in place rather than creating a second
Known gaps	Answers written as bullet lists in the gaps comment can be dropped when the comment is rebuilt, so check the comment by hand after a run. Sources it cannot open are listed as unread, which means the context is incomplete. Enabled for LeadManager only
Source	Platform documentation and the Spec Refiner runbook
It runs before the rest of the pipeline, which is easy to miss. Task Context, Design Context and Task Creation all read a manifest that does not exist at this point in a ticket's life. It also brings PostHog in as a dependency, which no other Spec Sprint agent needs.

