15
PR Validation
Field	
Purpose	Validates what a pull request actually changed against the impact analysis, and holds the merge gate
Owner / backup	Andri Ferinata / none named
Maturity / risk	Establishing. The only agent on the platform that sets a merge status. The validation itself is automatic; opening the gate is not
Trigger	A pull request opened or updated. Re-run on a mention. The gate opens only on a comment whose body, once the mention is stripped, is exactly approved — deliberately strict, because the effect is enabling a merge
Trigger syntax	@pr-validation-agent;accept;<manual_effort_hours> — this is what enables the Merge button. @pr-validation-agent;refine;<feedback> @pr-validation-agent;rework;<yes/no>;<KG/AG/HG>;<feedback>. Agent owners only
Prerequisites	GitHub. All three trigger rules are GitHub-only, so a team on the other provider gets no merge gate at all. A .breeze.json at the repository root, and an impact analysis to validate against
Input	The pull request title and head commit, the ticket key from the title, the repository's project identifier, the nearest ontology, and the diff in bounded chunks
Expected output	A comment on the pull request, a write-back marking the ticket ready to merge, a saved report, and the merge-gate commit status set to success or failure on the head commit. The status is named pr-merge-gate, and that exact string is what a branch protection rule has to require
Review & logging	Runs recorded on the platform. No accept or rework verb — the approval comment is a gate command, not a verdict. Rework is not measured on this agent, and nothing yet stands in its place, per 3.8
Common failures → fix	It fails closed. If the report lookup errors it reports not-validated and blocks the merge, which is correct: a gate that opens when its datastore is unreachable is not a gate. An approval comment that reads "approved!" or "looks approved" does not match
Monitor	Runs on the platform, and the commit status on the pull request
Re-run safety	Safe. The status key is stable, so a re-run updates the existing check rather than stacking another
Known gaps	46 runs in the last period and not one carries a verdict. The architecture layer is wired but dead — only two of the three layers are really validated. The platform sets the status; a branch rule is what enforces it, and nothing confirms a branch rule is configured on any repository
Source	Platform documentation, audited against the codebase in August
This is where the merge gate actually lives. Three things are named after merging and only one touches the merge button: the branch-policy check inside Code Review blocks the review, PR Validation sets the status a branch rule can block on, and Pre-merge, despite the name, runs after the merge.

