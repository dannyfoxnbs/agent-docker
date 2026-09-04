20
Agent Run Logger
Field	
Purpose	Records every run and the verdict a reviewer gave it. The evidence backbone — maturity, graduation and BAU all read from here
Owner / backup	Fiesta Rasyid / none named
Maturity / risk	Not assessed — it produces nothing a reviewer scores. Its own coverage is the platform's biggest measurement risk
Trigger	Two ways. A reviewer fills the form on the run detail page; or a well-formed comment fills the previous run's entry automatically
Trigger syntax	No command
Prerequisites	The run exists, and the comment resolves to it
Input	The verdict — accept, refine or rework — plus manual work in minutes, whether a rework was a hallucination and from which layer, and notes
Expected output	The verdict stored against the run. At most one accepted run per subject
Review & logging	This is the logging
Common failures → fix	A comment that does not parse creates no run at all, not even a failed one, so malformed input leaves no trace. The prompt link only appears when the dashboard address is configured, so on a deployment without it nobody is reminded
Monitor	The graduation log, which reads from here
Re-run safety	A later submission overwrites the earlier one, and stays editable
Known gaps	Coverage, everywhere. Eight of fifteen active agents fell below the 50% floor in the last period, which is why no agent passed the gate. Three agents have no verdict verb at all, so nothing can be captured for them. Local logging stopped, so local activity is invisible rather than absent
Source	Platform documentation and the Graduation Log
