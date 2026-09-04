Hubexo · Project Sirius
Sirius Runbooks
Fifteen fields per agent, defined at Guidelines 10.2. Each is a summary, not the source. The Source row names the document it came from and its date, and where the two disagree, the source wins. Where an owner has written their own guide, the runbook links to it.

Version
1.0 · Enablement release
Audience
All Hubexo Tech Delivery tribes
Last updated
29 August 2026
Maintained by
GDH Delivery Lead

Fiesta Rasyid
Direct email
Questions
Sirius Service Desk
Raise a request
Any question, however small
1
Epic Agent Suite
One agent, two runbooks. The Epic Agent Suite is a single component: one owner, one repository, one engine. But it is operated through two lanes, and a runbook exists to answer what do I need to switch this on and run it safely — a question the two lanes answer differently. Different doors, different gate registries, different prerequisites at the gate, different failure modes, and at least one field that is auditable in one lane and deliberately not in the other. A single table covering both would have to say it depends in most of its cells, which is the same as saying nothing.

So the catalogue count does not change. This is one of the 18 Core Agents, counted once. What follows is two operating surfaces belonging to it, at 1a and 1b, and a team switching the suite on needs both.

The owner's guides are the source. Doors & Lanes, written by Alex Evans, covers the strategy phase end to end with the critical path and the promises. His Epic Lane and Feature Lane runbooks carry the door-by-door detail. These pages are the fifteen fields for someone switching the suite on; his are the full guides for someone learning it. Where they disagree, follow the owner's. Captured 29 Aug 2026.

1a · Epic lane
The lane that owns the why. It takes an idea to a committed epic and proposes the breakdown the feature lane then works from.

Field	
Purpose	Audits an Aha! epic against a versioned gate registry, drafts what is missing, and gates it toward Ready for Spec Sprint. Owns the business case, the objective, the audience and the release strategy. /agent-featurize lives here, because it writes the breakdown into the epic body
Owner / backup	Alex Evans / none named
Maturity / risk	Establishing. A gate agent — it moves status and rewrites record bodies directly in Aha!, with no reviewable pull request in between. Review is before the write: every interactive run stops on one explicit go. The helper agents hold no write tools at all, enforced by their tool list rather than by instruction. Body writes are whole-body, which is a wider blast radius than the feature lane's patches
Trigger	Manual. You type a door. It never fires from a description, and there is no status trigger. Scheduled running is supported only for harvesting an answered worksheet
Trigger syntax	Cloud: @epic-agent;scope @epic-agent;seed @epic-agent;harvest @epic-agent;commit @epic-agent;prioritise. Local Epic Create: /agent-create-epic <feedback> /agent-update-epic <feedback>
Prerequisites	Claude Code with the working directory set to the strategy repository root; an authenticated Aha! connection; Node; the record is an epic; nobody editing it in the Aha! interface. Deep runs additionally need Breeze
Input	The epic reference, plus either your live answers or the worksheet cells someone filled in. Ranked: the gate registry is law, then your answer, then the live record, then native Aha! fields, then Breeze evidence
Expected output	A rewritten epic body, field updates, at most one status change, an audit comment giving previous value, new value and reason per field, an owner ping, and a receipt
Review & logging	The audit comment on the record is the log. No central run log, no accept or rework tag, no manual-time capture. Every local agent is required to be connected to the Agent Run Logger (13.2); this one is not, which is a gap against the standard rather than a missing capability
Common failures → fix	Helper scripts not found — the door ran outside the repository root, set the working directory. Run aborts just before the write — someone edited the record mid-run, which is deliberate, re-run. Deep runs produce confident but ungrounded drafts — a stale Breeze connection, where the tools are invisible rather than erroring, so start a fresh session
Monitor	No dashboard row is known to exist. Monitoring is the audit trail on each record plus the self-identifying line every run prints first
Re-run safety	Safe and expected. Seeding preserves answers already filled in; harvesting lands what is resolved and leaves the rest. Duplicate worksheet tables do not self-heal and are a deliberate hard error. Pause a door after two consecutive aborts and run the test suite before re-enabling
Known gaps	No backup owner. Not connected to the Agent Run Logger, which 13.2 requires. One child feature satisfies the epic gate, so a twelve-row breakdown with one feature minted passes here and nothing in this lane checks the other eleven
Source	Doors and Lanes enablement guide v3; Alex Evans, Epic Lane Runbook, 13 Aug 2026
1b · Feature lane
The lane that owns the what. It turns a committed epic's why into the delivery spec. A feature maps one-to-one to a Jira Story, and the committed feature body is the handoff — there is no separate handover document and no step that re-derives intent before the build.

Field	
Purpose	Audits one Aha! feature against a versioned gate registry, drafts the missing delivery detail, and gates it into Ready for Spec Sprint with a per-field audit trail. Every feature has a parent epic, and the parent carries the why
Owner / backup	Alex Evans / none named
Maturity / risk	A gate agent, as above, but two differences narrow the risk. Writes are patch-shaped — anchored spans rather than the whole body — so a patch whose anchor matches zero times or more than once is refused rather than applied to a guess. And agent-feature-commit is the only door in the suite that runs the engine's checkpoint runner, making it the most mechanically enforced thing the suite does
Trigger	Manual. Six doors, typed. Scheduled or headless running is supported only for harvesting a worksheet with --trust-worksheet; without that flag a headless run skips auditable writes rather than applying them silently
Trigger syntax	Six doors, typed. /agent-featurize writes the breakdown into the epic body; agent-feature-commit is the only door that runs the checkpoint runner. The full six-door list is in Alex Evans's Feature Lane runbook, not the Agent Catalogue — confirm there before relying on this row
Prerequisites	As the epic lane, plus two of its own. The record must be a feature with a parent epic — epics, ideas and parentless features are refused at entry. And on the commit door the recipe is read from a pinned git commit, so an uncommitted skill edit does nothing at all
Input	The feature reference, plus your live answers or the worksheet cells. The parent epic is always fetched, for context and a parent-fit check. Native Aha! fields come from the field rail, never the worksheet
Expected output	A patched feature body, field updates, at most one status change, a per-field audit comment, an owner ping, and a receipt. At commit, additionally a Sequence panel written into the body so build-order context travels with the record
Review & logging	The per-field audit comment is the log. Same gap as the epic lane, with one addition: on the commit door a receipt lint enforces the receipt's shape, so a commit receipt missing its gate block means the runner was never called
Common failures → fix	Acceptance criteria that look fine but grade weak — they are loose prose rather than Given/When/Then, and there is no deferral path at commit. A skill edit that appears to do nothing on the commit door — the runner reads the boot-pinned commit, so commit the change. A whole run aborting on an enum — Tier and User role take strict single values, so a compound value kills the run. A commit refused at entry — the feature has no parent
Monitor	As the epic lane. Additionally the commit receipt's gate block, and the nudge line listing unlinked dependencies
Re-run safety	Safe. Minting from a breakdown is idempotent by name, so rows already created are skipped. --land re-audits each live body, so review edits are honoured rather than overwritten. Scope harvests may land partially; commit is all or nothing
Known gaps	No backup owner. Not connected to the Agent Run Logger, which 13.2 requires. No orphan features, ever is enforced, but the un-minted tail is only ever reported, never created, and nothing forces anyone to look at it
Source	Alex Evans, Feature Lane Runbook v0.2, 13 Aug 2026
Five ways the feature lane deliberately differs
These are decisions, not inconsistencies, and knowing them prevents most cross-lane mistakes.

Epic lane	Feature lane	Why
T-shirt size	Not auditable — feasibility owns sizing	Auditable, reason and consent required	Sizing feeds the build sequence here, so a change needs a recorded reason
Acceptance criteria at commit	Can be deferred	No deferral, ever	The feature is the delivery spec. Real Given/When/Then or no commit
Read-only keyword	score	check	Features have no score. Priority lives on the parent epic
Tech handover	An opt-in block at commit	None	The committed feature body is the handoff
Body writes	Whole-body	Patch-shaped, anchored spans	Smaller blast radius, and a drifted anchor refuses rather than guesses
Where the gate actually sits. Epic gate registry v0.5 closed a gap that had left this lane carrying the whole delivery gate alone: an epic can no longer commit without a breakdown block and at least one child feature. So the epic gate proves the work was broken down, and this lane owns every judgement about whether the breakdown is any good. One child satisfies the gate upstream. Nothing but this lane looks at the rest.

What a gate cannot catch. The registry enforces form. Three Given/When/Then scenarios pass, and three is rarely enough for a real feature. Whether the scenarios are the right ones, whether the summary would mean anything to someone with no context, whether the scope boundary names the sibling overlaps that actually exist, and whether an inferred draft you accepted was correct — none of that is machine-checkable. A gate passing is a claim, not a verdict.

agent-workspace-init is a door of this suite, not a separate component. It drafts a product pack for an Aha! product, and 13.2 describes what that pack carries. The workflow diagram draws it as its own box, which is why people look for it in the catalogue and do not find it. It is counted here.

Do not confuse this with the platform's epic agent. A cloud agent called epic-workflow also exists, triggered by a Jira status, and it shares command names with the doors above. Its own documentation records that several of those modes do not do what their names suggest: the scoring mode writes no score, the handover refresh computes a payload and discards it, and the tiered recipes return success without auditing anything. The doors described here are the ones that work. If a team is running the commands through Jira rather than through Claude Code, it is running the other one.

2
Feasibility and Effort Estimation
Field	
Purpose	Estimates a ticket's T-shirt size for a 2 to 5 developer team, grounded in a Breeze scan across all four graphs
Owner / backup	Andri Ferinata / none named
Maturity / risk	Establishing. Not a gate agent — advisory. Effort never enters the priority score
Trigger	A comment on an Aha! record, or a comment on a Jira ticket for teams on the second tenant. It also re-runs automatically after an epic commits
Trigger syntax	@feasibility-agent;start @feasibility-agent;refine;<feedback> @feasibility-agent;rework;<feedback>
Prerequisites	An Aha! token, and Breeze projects mapped for the team
Input	The Aha! epic or Jira ticket, any prior assessment and its questions, and a live Breeze scan across functional, design, code and architecture
Expected output	A written assessment as a comment, and the native Delivery T-shirt estimate field set — Extra-Small, Small, Medium, Large or Extra-Large. On the Jira path it writes a Feasibility Assessment field instead
Review & logging	Run recorded on the platform. This agent has no rework verb, so no hallucination source is ever captured for it
Common failures → fix	Breeze unmapped for the team, so the scan returns nothing and the estimate is ungrounded. No status field flip and no dashboard renderer, so a failed run is quiet
Monitor	No dedicated dashboard renderer. Runs fall back to the generic output view
Re-run safety	Safe. A later assessment supersedes the earlier one on the record
Known gaps	No backup owner. No rework verb. Verdict coverage was 35% in the last graduation period, so the accept rate cannot be read
Source	Platform documentation, audited against the codebase in August
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

4
Impact Analysis
Field	
Purpose	Works out what a change touches across repositories, using the Breeze knowledge graph, and publishes the reasoning as a report
Owner / backup	Andri Ferinata / none named
Maturity / risk	Establishing. Not a gate agent — it writes the report unreviewed
Trigger	A status transition into the impact-analysis status, and only that. There is no command that starts a fresh run; a mention can only revise a report that already exists. A second transition on a ticket that already has a run is rejected and recorded as a failed run
Trigger syntax	@impact-analysis-agent;refine;<feedback> @impact-analysis-agent;rework;<yes/no>;<KG/AG/HG>;<feedback> @impact-analysis-agent;accept;<manual_effort_hours>
Prerequisites	Breeze reachable and the team's projects mapped; the ticket carries enough description to analyse
Input	The ticket including any Spec Refiner block, up to five parent tickets for business context, attachments, and a deep Breeze scan across all four graphs
Expected output	A report published to the documentation space, its link prepended newest-first to the ticket's Breeze Scope Manifest field, and the analysis saved back into Breeze as the ticket's impacted ontology
Review & logging	Reviewer tags accept, refine or rework at review time. A well-formed comment fills the previous run's log entry automatically, so the verdict is captured without a separate visit to the dashboard
Common failures → fix	A duplicate transition, rejected by design — use refine or rework instead. Breeze unreachable, which produces a report grounded in nothing
Monitor	Has a dashboard renderer, with a tab showing per-step status. The best-instrumented agent on the platform
Re-run safety	A fresh run cannot be repeated on the same ticket by design. Revision through refine or rework is safe and expected
Known gaps	One reporting step is disabled in the shipped step list. Agent Acceptance Rate has declined across four periods — 83%, 71%, 82%, then 48% — against a floor of 85%
Source	Platform documentation, audited against the codebase in August
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
6
Design Creation
Field	
Purpose	Takes one reviewed design ticket and builds three things in the design repository: the prototype, the developer handoff carrying the manifest, and the change log. Then delivers them on the ticket and iterates on comments
Owner / backup	Maureen / none named. Approval is no longer restricted to her account — that identity check was removed, because the webhook payload does not reliably carry the commenter's address and so could not be verified
Maturity / risk	Disputed, and worth resolving before a team relies on it. Its own runbook says specified, never run, with seven open blockers; the platform documentation describes behaviour fixed against real tickets. Not a gate agent — every output is reviewed on the ticket and again at the pull request. It never merges and never writes to the main branch
Trigger	Two implementations. The platform agent runs on the status transition into the design-creation status, and a duplicate transition on a delivered ticket is rejected and recorded as a failed run. The local variant is a command in Claude Code with no status hook and no comment poller at all. Either way, revision is driven by a comment verb rather than by re-running
Trigger syntax	@design-creation-agent;refine;<feedback> @design-creation-agent;rework;<yes/no>;<KG/AG/HG>;<feedback> @design-creation-agent;accept;<manual_effort_hours>
Prerequisites	A design ticket a person has read; a resolvable target page with a real base; the design repository present; an authenticated command-line client
Input	The design ticket, its comments and attachments, the sprint field, the parent Epic's two manifests, the linked impact analysis, and the design repository's constraint pack
Expected output	On the ticket: a pull request, two HTML attachments, a final design table in the description, and one comment covering deviations, change log and open items. In the repository on a ticket branch: the prototype, the handoff, metadata, a regenerated registry entry and an immutable sprint snapshot
Review & logging	Review happens on the ticket and that thread is the record. The approval verb is accept with the hours you spent — approve was retired outright, so a designer following an older note gets a usage reply rather than a finished build. On the platform path a well-formed comment fills the previous run's log entry automatically; the local variant records nothing
Common failures → fix	It stops because a capture fails verification — re-capture with Design Capture; the stop is correct behaviour. No attachments — the Jira token file is absent. Sprint number ambiguous — the same fix
Monitor	No dashboard and no run-log page. Monitor the branch and its pull request, the ticket, and the repository's own check command
Re-run safety	Idempotent, and re-running is how a revision works: same branch, same files, attachments replaced, change log amended rather than appended. A ticket with a pull request and no new instruction is not re-run — it reports and stops. Pause after two consecutive failures rather than running a third time.
Known gaps	Accessibility is never verified — the check is recorded as skipped on every run, and a skip is never reported as a pass. The design repository has no branch protection, so the never-merge rule is enforced by the agent's own code rather than by the repository. Most page masters are still blank scaffolds
Source	The Design Creation runbook and the platform documentation
7
Task Context
Field	
Purpose	Builds the Task Context Manifest — the classification, architecture decisions and implementation tasks that Task Creation turns into tickets
Owner / backup	Andri Ferinata / none named
Maturity / risk	Establishing. Not a gate agent
Trigger	A status transition into the task-context status, from either impact analysis or design creation. There is no bare mention that bypasses the status gate. A duplicate transition is rejected and recorded as a failed run
Trigger syntax	@task-context-agent;refine;<feedback> @task-context-agent;rework;<yes/no>;<KG/AG/HG>;<feedback> @task-context-agent;accept;<manual_effort_hours>
Prerequisites	The Breeze Scope Manifest field is filled, with a report link at the top
Input	The topmost report link off the scope manifest, and the ticket
Expected output	The Task Context Manifest field on the ticket. Nothing is published to the documentation space and the description is not edited
Review & logging	Reviewer tags a verdict with manual time. A well-formed comment fills the previous run's log entry automatically, and it stays editable afterwards
Common failures → fix	The scope manifest is empty, so there is nothing to read. A repeat transition, rejected by design — use refine or rework
Monitor	Has a dashboard renderer
Re-run safety	A fresh run cannot be repeated on the same ticket. Revision is safe
Known gaps	Agent Acceptance Rate 45% against a floor of 85%, on 96% coverage — so this is a real quality signal rather than a measurement one. Rework is improving across periods; accept is flat
Source	Platform documentation, audited against the codebase in August
8
Task Creation
Field	
Purpose	Creates every engineering and QA child ticket for one Epic, sized, sequenced and linked
Owner / backup	Faisal Murkadi / none named
Maturity / risk	Establishing. Not a gate agent — the output is reviewed before anything is built
Trigger	Cloud: the status transition into the task-creation status. A bare arrival at that status does not fire it, and a repeat transition is rejected outright. Local: /task-creation <EPIC-KEY>, with a refine mode that takes named children
Trigger syntax	@task-creation-agent;refine;<feedback> @task-creation-agent;rework;<yes/no>;<KG/AG/HG>;<feedback> @task-creation-agent;accept;<manual_effort_hours>
Prerequisites	The anchor is an Epic or a Story — both are valid — with a description, a Breeze Scope Manifest and a Task Context Manifest, all filled. A missing one stops the run and says which
Input	The Epic, both manifests, the topmost report link, and the design child's prototype and handoff attachments
Expected output	Child tasks under the Epic, idempotent by their code prefix, moved to ready-for-dev. Backend and frontend children carry the repository in the title and as a label. Story points per child, and the Epic's own points overwritten with the sum. Blocking links in a fixed order
Review & logging	Reviewer tags a verdict with manual time. A verdict left on a child resolves to the run that created it; a verdict on the Epic re-runs the whole generation and flags children no longer backed by the manifest
Common failures → fix	A missing manifest, which aborts and names the field. A repeat transition, rejected — use refine or rework instead
Monitor	The Agent Status field on the ticket. No dedicated dashboard row named
Re-run safety	Idempotent by code prefix — existing children are updated, not duplicated. Where a refine lands decides what it does: on a child it revises that child only; on the anchor it re-derives the whole plan, which can create new children and mark others as deleted. Pause after two consecutive failures.
Known gaps	Agent Acceptance Rate 55% against a floor of 85%, on 98% coverage. The published runbook page carries several fields copied from the QA agent — its purpose, trigger, prerequisites, outputs, failures and monitor rows all describe a different agent, and the page says so itself. The fields above come from the platform documentation instead
Source	Platform documentation, audited against the codebase in August
9
Acceptance Test
The owner's guide is the source. Acceptance Test Agent, written by Wesly, covers the five stops, with real screenshots of a draft and its export. This page is the fifteen fields for someone switching the agent on; that one is the full guide for someone learning it. Where they disagree, follow the owner's. Captured 29 Aug 2026.

Field	
Purpose	Writes the test cases so the team reviews the coverage instead of typing it out
Owner / backup	Wesly / none named
Maturity / risk	Establishing. Not a gate agent. Five steps, two of which are yours
Trigger	A QA ticket tagged with a test prefix moving from ready-for-dev to in-progress. Only the status transition can start a fresh chain; a mention can continue one
Trigger syntax	@acceptance-test-agent;refine;<feedback> @acceptance-test-agent;rework;<yes/no>;<KG/AG/HG>;<feedback> @acceptance-test-agent;accept;<manual_effort_hours>
Prerequisites	A scope summary table on the QA ticket, and an impact analysis on its Epic. In the normal pipeline nobody writes either by hand — Task Creation and Impact Analysis produce them upstream
Input	The QA ticket first, which is scoped tighter than the Epic and often to one region or one page; then the Epic's analysis, a Breeze scan, the design child's prototype, and existing Qase cases
Expected output	A draft as a comment for you to read, then on your acceptance an export to Qase: cases, a test plan, suite folders created as needed, and a summary mirrored onto the automation sibling ticket
Review & logging	You read the draft and reply. The draft loop repeats as many times as you need. 100% verdict coverage in the last graduation period — the only agent to manage it
Common failures → fix	Three conditions stop a run, and each posts its reason on the ticket rather than failing quietly. No scope summary, or no configured platform named in it, so it cannot tell which Qase project to target. More than one platform named, which is always fatal — one run targets one project, so split the ticket. More than one tier, but only where that platform's tiers map to separate projects; where a platform declares no tiers, two tiers in one cell are read as scope and the run proceeds
Monitor	Runs recorded on the platform, with the export summary on the ticket
Re-run safety	Safe. A case already in its target suite is folded into the plan rather than created again, so re-accepting never doubles anything up. Near-identical suite names are folded together — a later ticket proposing Bid Trackers lands in an existing Bid Tracker rather than forking the tree, while Bid Management stays separate. Every fold is reported on the draft comment. To add coverage after an export, put additional: and what you want on its own line in a comment; only the new cases are drafted and the exported ones are never rewritten, so titles do not drift
Known gaps	Agent Acceptance Rate 57% against a floor of 85%. It is the only agent improving on both rates, and still short. accept does two jobs here — it records your verdict like everywhere else, and it also performs the export. No other agent's accept writes anything
Source	The Acceptance Test Agent guide, and the platform documentation
10
Sprint Planning
Field	
Purpose	Plans the team's next two-week sprint: reads the Epics that reached ready-for-dev, works out how many hours each person really has, suggests assignees, and shows which Epics fit
Owner / backup	Faisal Murkadi / none named
Maturity / risk	Not assessed — no runs logged in the last graduation period. Low risk by design: everything is a suggestion until a person presses Proceed
Trigger	/sprint-planning in Claude Code, no arguments. Never autonomous. The cloud worker was withdrawn and the capability now runs locally only
Trigger syntax	/sprint-planning in Claude Code, no arguments
Prerequisites	Epics sitting in the ready-for-dev column of the refinement board; every engineering task has a story-point value, read directly as hours, so a task without one makes its whole Epic wait; and current settings for public holidays, leave and each person's time split
Input	Nothing to supply. It gathers the Epics, the delivery board's work history for tie-breaking between equally free people, and the settings. Your only inputs are optional overrides on the dashboard
Expected output	One stable link to a sprint dashboard: four summary tiles, an assignment view with a suggested person per task, and team capacity. After Proceed: each ticket's sprint field set, status moved, and the sprint started
Review & logging	The Delivery Manager reviews on the dashboard and can change any assignee, hours or board before pushing. Nothing reaches Jira until Proceed. No run log
Common failures → fix	Data older than twelve hours shows an amber stale banner — press Refresh. A task with no story points holds its Epic back — add points in Jira. Unclassifiable items are listed and held out of the plan — fill in the ticket code or the product field
Monitor	The dashboard's own freshness stamp, plus the notices listing anything held back
Re-run safety	Re-running is normal operation. Refresh re-reads, recomputes and redraws, and your overrides are kept
Known gaps	No named maturity band and no documented run-failure modes. The published runbook page carries several fields copied from the QA agent, including its owner names and an autonomous trigger this agent does not have. The fields above come from the specification instead
Source	The Sprint Planning runbook, read against its own corrections
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
14
Code Review
Field	
Purpose	Reviews backend and frontend pull requests, and runs a deterministic branch-policy check first
Owner / backup	Ardall Niswar / none named
Maturity / risk	Optimising as banded, not gateable on the latest evidence. Advisory — it writes a comment and blocks nothing
Trigger	A pull request opened or updated, on either source-control provider. No command, no mention
Trigger syntax	@code-review-agent;accept;<manual_effort_hours> @code-review-agent;rework;<yes/no>;<KG/AG/HG>;<feedback>. Agent owners only
Prerequisites	The repository is registered; the branch policy is configured for the team's branching model
Input	The pull request metadata and a shallow clone of the source branch, with the diff bounded by a budget
Expected output	A branch-policy verdict recorded on every run, findings, and one aggregated comment on the pull request
Review & logging	Runs recorded on the platform. No accept or rework verb in the comment grammar — verdicts reach it only through the dashboard. Rework is not measured on this agent, and nothing yet stands in its place, per 3.8
Common failures → fix	The branch policy fails closed. A pull request into a target no rule matches is a violation, the run is marked skipped, and the review below never happens. There is no comment and no status for this, so it looks like the agent simply did not run. This is the most common misconception about it
Monitor	The run detail page's validation tab is the only place the branch-policy verdict appears
Re-run safety	Safe. A new commit re-runs the review
Known gaps	Verdict coverage fell from 70% to 23% while volume stayed high. It passed the two previous graduation periods and would have passed again on rate alone at 100% accept. Used more, judged less
Source	The Code Reviewer and Merge Validation platform pages
Merge Validation is not a separate agent. It is the branch-policy check that runs as the first step of every Code Review run, on both providers. It has no container, no queue and no page of its own in the roster. An earlier description of it as a standalone agent posting a comment and setting a status describes a design that was never built, and that description is the likely source of a three-way disagreement about what gates the merge.

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
17
QA Agent
The owner's guide is the source. qa-agent Runbook v1.0, written by Arief Rahman Hakim, covers installation, setup and the stacks it supports. This page is the fifteen fields for someone switching the agent on; that one is the full guide for someone learning it. Where they disagree, follow the owner's. Captured 29 Aug 2026.

Field	
Purpose	Turns an approved test case into a running automated test, executes it, repairs it when a button moves, reports the result, files the evidence on the right ticket, and opens a pull request
Owner / backup	Arief Rahman Hakim / Yohanes Christianto. The only agent in this catalogue with a named backup
Maturity / risk	Establishing. It is not a merge gate. You give it one ticket key; it does the rest and writes down everything it did
Trigger	One command in Claude Code, and that is all today. A status transition into QA review is the stated target rather than current behaviour, so a team waiting for the ticket to trigger it will wait indefinitely. Each of the five sub-phases can also be called on its own
Trigger syntax	Full flow in Claude Code: /qa-agent <work_item_key>. Individual stages: /qa-agent-codegen <ticket_key> /qa-agent-run <ticket_key> /qa-agent-heal <ticket_key> /qa-agent-defect <ticket_key> /qa-agent-pr <ticket_key>
Prerequisites	More than any other agent here, and all of it per machine. Node 20 or later with npm — the runner refuses to start below 20. Git and the GitHub command-line client, authenticated, because the pull request is opened through it. Playwright, with its browsers fetched during setup; Chromium only. A Qase project and token. SSH access to the frontend repository, which selector mining needs. A staging environment. And the tracker hosting the delivery envelope — a parent with a manual-test child that names the plan, an automation child, and frontend and backend children for defects to route to. The tracker and test style are chosen once, at setup: Jira with Qase, or Azure Boards with Azure Test Plans, and TDD or BDD. It is a scaffolding decision, not a runtime switch, so a team that picks wrong re-scaffolds rather than reconfigures
Input	Test scenarios written upstream by the Acceptance Test agent, as a Qase plan. It does not invent tests, and it never rewrites the plan's cases. It does write back one thing: a case that passes is flipped to automated automatically
Expected output	Playwright code against the live frontend, a Chromium run, results uploaded to Qase, self-healed selectors, defects routed to the tracker, and a pull request
Review & logging	The review phase runs automatically on the status transition and writes unreviewed. The five sub-phases each need a person to ask for them
Common failures → fix	The plan is not marked for automation, so there is nothing to pick up. A selector moves and the healer repairs it, which is expected rather than a failure
Monitor	Runs recorded, plus the Qase run and the pull request
Re-run safety	Safe. Re-running re-executes against the same plan. /qa-agent:upgrade is the exception: it pulls fresh framework files and overwrites the plugin-owned ones — the agent contract, the Playwright and TypeScript configuration, the shared utilities, the scripts and the CI workflow. Your tests, page objects, locators, features, environment file and app profile are repo-owned and never touched. Anything you tuned in a plugin-owned file is lost on upgrade, which is the one way to lose work here
Known gaps	1 run in the last graduation period, untagged. The platform's own registry marks this as a legacy report agent superseded by Acceptance Test for new work, while keeping it deployed. It installs as a plugin from the internal marketplace, which is a different activation route from every cloud agent here
Source	The QA Agent runbook v1.0, and the platform documentation
18
Harvester Spawner
Field	
Purpose	Given a council, tender or planning portal address, produces a declarative harvester configuration and a production-ready scraper
Owner / backup	Ichsan Nuur, with M. Ravi Wicaksono and Akbar Tolandy. No explicit owner and backup split
Maturity / risk	Establishing. Not a hard approval gate by default — the quality step fixes selector mismatches without pausing. A person reviews the final pull request before it merges
Trigger	Manual, by name or trigger phrase. No status trigger
Trigger syntax	From the CLI: mandor <source_name> <site-url> <proxy-country> <mode>. In Claude Code: /<agentname> <source_name> <site-url> <proxy-country> <mode>
Prerequisites	A repository checkout carrying the agent definitions and skills; browser tooling; proxy credentials where a country is requested
Input	A source name, the site address, an optional proxy country, and a mode. The mode is set only by explicit instruction — never guessed, never changed mid-run
Expected output	A results folder per source: the harvester configuration, a developer guide, three reports, the scraper and its test. After integration the scraper and test move into the strategies tree
Review & logging	The user reviews the record count before accepting. A runtime and token table per sub-agent is recorded at review time rather than reconstructed later. The only agent still logging locally after the local logs stopped
Common failures → fix	The results page is never reached, so it stops and reports rather than proceeding. No detail link found, so it reports that mapping is unavailable. A scraper that crashes or returns nothing goes to the debugger, not the quality step. Field-value mismatches go to the quality sub-agent; crashes, timeouts and empty output to the debugger. Missing required parameters halt the pipeline and ask rather than guessing
Monitor	The per-run output folder, cross-checked against the strategies mapping once integrated. No dashboard row
Re-run safety	Not documented
Known gaps	No maturity band and no version in its own runbook. Re-run safety undocumented. 4 tagged runs at 100% accept, which is too few to count
Source	The Harvester Spawner runbook
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
