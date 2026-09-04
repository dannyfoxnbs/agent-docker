11
Architecture Implementation
Field	
Purpose	Reads a ticket, proposes an architecture, and on approval writes Terraform as a draft pull request
Owner / backup	Muhammad Iqbal / none named
Maturity / risk	Not assessed — no runs logged. It never applies anything. The pull request always stays draft, and a person runs the plan and apply themselves
Trigger	A mention on the ticket to propose. Revision on a request-for-changes review or a refine comment. Build on an approval review or an accept comment. The repository is resolved from the ticket's labels
Trigger syntax	On a Jira comment to propose: @architecture-agent <additional-context>. On a GitHub or BitBucket comment: @architecture-agent;refine;<feedback> @architecture-agent;rework;<yes/no>;<KG/AG/HG>;<feedback> @architecture-agent;accept;<manual_effort_hours>
Prerequisites	The ticket carries a repository label; the infrastructure repository is reachable; read-only cloud credentials for reading current state
Input	The ticket, a clone of the infrastructure repository, its conventions, the live infrastructure state read-only, and pull request feedback
Expected output	A draft pull request, and four documents written into the repository: the proposal, the design, the tasks and the acceptance criteria
Review & logging	Two human gates — the specification is approved before any code is generated, and the draft pull request is reviewed before anything is applied. Accept records manual hours and starts the build
Common failures → fix	No repository label on the ticket, so it cannot resolve where to work. Older space-separated commands no longer parse — use the current grammar
Monitor	Runs recorded on the platform
Re-run safety	Revision runs update the same draft pull request
Known gaps	It shipped narrower than specified — code generation only, never touching live infrastructure. accept starts the build here, unlike the agents where it only records a verdict. No logged runs at all, so the band above is not earned
Source	Platform documentation, audited against the codebase in August
