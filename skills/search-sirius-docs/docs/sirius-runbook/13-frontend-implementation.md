13
Frontend Implementation
Field	
Purpose	Implements frontend tickets on the same propose-then-build shape as the backend agent
Owner / backup	Fitzgeral / none named
Maturity / risk	Establishing. High blast radius — the code generator pushes under its own identity. Keeps human approval at every phase boundary
Trigger	A mention on the ticket to propose, with the repository passed in. Revision on a request-for-changes review or a refine comment. Build needs an explicit command
Trigger syntax	No comment command. Status transition READY FOR DEV → WIP. Review and the accept or revise decision happen on the pull request and the Sirius Platform run page, notified to Teams
Prerequisites	The repository is registered; a design handoff exists where the ticket has design work; a prior run on the ticket for anything after the proposal
Input	The design handoff, ticket attachments, the API contract and test cases, the repository clone, and the working files the previous phase left on the branch
Expected output	Working files on the branch, then a draft pull request
Review & logging	Every phase boundary needs a person. Accept records manual hours; rework records the fault's source
Common failures → fix	A bare approval does nothing here. Unlike the backend and architecture agents, approving the review is deliberately a no-op and the build needs an explicit command. Feedback the agent judges unactionable stops the run rather than guessing
Monitor	Runs recorded on the platform
Re-run safety	Revision updates the same branch and working files
Known gaps	Four older commands were retired. They are still recognised, so an old comment does not hard-fail, but each replies with guidance instead of starting anything. Passing both thresholds so far, on 9 tagged runs, which is too few to conclude from. Approve-is-a-no-op is the single most confusing difference between the three implementation agents
Source	Platform documentation, audited against the codebase in August
