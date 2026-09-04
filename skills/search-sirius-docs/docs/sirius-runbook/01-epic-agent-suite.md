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

