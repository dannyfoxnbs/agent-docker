16
Pre-merge
Field	
Purpose	Reconciles the knowledge graph after a pull request merges, so the graph reflects what was actually shipped
Owner / backup	Andri Ferinata / none named
Maturity / risk	Establishing. Not a gate — it runs after the decision has been made
Trigger	A pull request closed with merged true, by a non-bot author. GitHub only, by design
Trigger syntax	No command. Fires when a pull request is closed with merged true, by a non-bot author
Prerequisites	GitHub; a .breeze.json at the repository root; a ticket key derivable from the pull request title
Input	The merged pull request, the ticket key, the repository's allowed projects, the nearest ontology, and live graph searches
Expected output	A merge report as a comment, a rewritten ontology for the ticket, and a re-index so later analyses read the shipped state
Review & logging	Runs recorded. No accept or rework verb. Runs it cannot act on are marked skipped rather than failed, deliberately, so the failure count stays meaningful
Common failures → fix	No ticket key in the pull request title, so it skips. No ontology found, so there is nothing to reconcile
Monitor	Runs on the platform
Re-run safety	Not applicable — it fires once per merge
Known gaps	5 runs, none tagged. Test coverage of its core steps is partial. Configured for two teams only
Source	Platform documentation, audited against the codebase in August
