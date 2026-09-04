21
Design Capture
It captures production, not intent. It takes one-to-one snapshots of what a page really looks like today into the design repository's reference/ area, which the other design agents then treat as read-only pixel truth. Everything else in the design pipeline describes what should be built; this is the only thing recording what is actually there.

Field	
Purpose	Captures what production looks like today, so design work starts from the real thing rather than a blank page
Owner / backup	Maureen / none named
Maturity / risk	Not assessed — no runs logged. Low risk: it reads production and writes only into the design repository
Trigger	One command, given a production address
Trigger syntax	Three ways, all ending in the same pipeline. /design-capture with no arguments, which reads Platform and URL from the Run Configuration page. /design-capture <production-url>, optionally with state hints appended in plain language. Or plain language alone, for example capture the project-pipeline page
Prerequisites	The design repository present, and the capture tooling with its configuration
Input	A live production page
Expected output	A captured master page in the design repository, which Design Creation then builds against
Review & logging	Reviewed through the design repository's own checks. No run log
Common failures → fix	A page that cannot be resolved, which stops rather than guessing
Monitor	The design repository's check command
Re-run safety	Re-capturing replaces the master
Known gaps	Most page masters are still blank scaffolds, which is why Design Creation stops on them. That stop is correct behaviour and the fix is a capture, not a retry
Source	The Design Capture agent page and the design workspace documentation
