12
Backend Implementation
The owner's guide is the source. Backend Implementation Agent, written by the agent's owner, covers the three phases and why the gate in the middle is the point. This page is the fifteen fields for someone switching the agent on; that one is the full guide for someone learning it. Where they disagree, follow the owner's. Captured 29 Aug 2026.

Field	
Purpose	Reads a backend ticket, proposes a specification, waits for a person to say yes, and only then writes the code, on a branch, as a pull request someone else still has to review
Owner / backup	Ardall Niswar / none named
Maturity / risk	Establishing. One human gate, and it blocks. Three phases: propose, revise, implement
Trigger	Mostly a status transition — most runs start by themselves when a ticket moves, matched on the status pair, the issue type and a title pattern. A mention is the second door, and Jira only. Revision on a request-for-changes review or a refine comment. Build on an approval review or an accept comment
Trigger syntax	No comment command. Status transition READY FOR DEV → WIP. Review and the accept or revise decision happen on the pull request and the Sirius Platform run page, notified to Teams
Prerequisites	The ticket carries a repository label; the repository is registered with the platform; the specification has been approved
Input	The ticket, the repository clone, the team's conventions, and review feedback
Expected output	A specification document, then a draft pull request with the code on a branch. Not code first — a document, then a pull request. Both are things a person can read, argue with and reject
Review & logging	The gate sits between proposal and build. Accept records manual hours and starts the implementation. Rework additionally records whether the fault came from the knowledge graph, the agent or the human gate
Common failures → fix	No repository label. A specification approved before it was read properly, which is the expensive one — the gate in the middle is the reason the rest of the pipeline is allowed to run at all
Monitor	Runs recorded on the platform, with per-phase token accounting
Re-run safety	Revision updates the same specification and branch
Known gaps	Whether the code runs in a sandbox depends on the team's chosen engine, which is one configuration line. Two of the four engines have no sandbox boundary at all, and one generates code without running anything. It does not verify that the code push actually landed — no check after handing off to the code generator, unlike the frontend agent. Verdict coverage 30%, so the accept rate cannot be read, and it has never been gateable in any period
Source	The Backend Implementation Agent guide, and the platform documentation
