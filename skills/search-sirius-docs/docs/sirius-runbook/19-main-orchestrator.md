19
Main Orchestrator
Field	
Purpose	Ingests every webhook, normalises it, works out which team and which agent it belongs to, and puts it on that agent's queue
Owner / backup	Andri Ferinata / none named
Maturity / risk	Not assessed — it produces nothing a reviewer scores. Risk is concentrated rather than absent: a routing mistake here sends a team's work somewhere else silently
Trigger	Inbound webhooks from the four providers
Trigger syntax	No command. Inbound webhooks from the four providers
Prerequisites	The team's configuration entry, its credentials, and its routing keys
Input	Webhooks. Jira events are fetched in full with their change history before routing
Expected output	A routed job on the right queue, and a record of the event
Review & logging	Every inbound webhook is recorded before validation, so rejected calls are visible too, with the routing outcome against each
Common failures → fix	A reference prefix not registered for the team, which routes the work to the default team with no error. A duplicate prefix or repository address across teams, which stops the platform starting rather than overwriting
Monitor	The event record, and the run that follows it
Re-run safety	Deduplication is in-flight only. It catches redeliveries, not two people asking at once
Known gaps	There is no webhook signature verification — a stated decision, where the trust boundary is network placement plus the tokens' own scopes rather than a signature
Source	Platform documentation, audited against the codebase in August
One control worth claiming. Each run freezes the configuration it started with and reads from that frozen copy, never from live configuration. So an edit made while a run is queued cannot change it mid-flight, and the run record shows exactly which values it used.

