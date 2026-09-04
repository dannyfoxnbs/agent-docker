11
Tools Catalogue
11.1 The tools, and who uses them
In use, and confirmed in the platform. Every one of these appears both on the workflow board and in current platform material.

Tool	What it is for	Who uses it	Phase
Aha!	Product system of record. Ideas, Epics, Features. Sits upstream of Jira	PM, Product Owner	Strategy
Jira	Delivery system of record. Tickets, and the status transitions and comments that trigger agents. The most widely used tool in the pipeline — it appears in every phase	Delivery Coach, engineers, QA	All three
Breeze	The shared knowledge graph across four layers — Functional, Design, Code, Architecture. Read and written by agents. See Section 6	Agents; Solution Architect reviews	Strategy, Spec Sprint, Implementation
Claude (via AWS Bedrock)	The reasoning engine behind every agent. Not a tool a person opens in the Cloud agents — every agent call goes through Bedrock. Local agents reach it through Claude Code	Agents; engineers directly for Local agents	All three
Confluence	Where agent reports and manifests are published. Authenticated by the same token as Jira	All	Spec Sprint
Qase	Test case management. Where the Acceptance Test agent writes	QA	Spec Sprint, Implementation
Bitbucket and GitHub	Code, pull requests and CI/CD. main protected with code owners. GitHub Actions replaced the former Deployment agent	Engineers	Implementation
Playwright	End-to-end test execution, driven by the QA agent's five sub-agent phases	QA, SDET	Implementation
PostHog	Product analytics. Feeds the Discovery mode of the Epic Agent Suite, and the Measure step that closes the loop back to Strategy	PM	Strategy, Implementation
On the board, not yet in the platform
These appear in the workflow the tribe designed, and no current platform page describes them. That does not make them wrong — the board is a target design and the platform is what shipped. It does mean a team should not assume they are wired up.

Tool	Intended for	What we can say today
BrainGrid	Spec generation, Strategic phase	Named on the board and in the April design. Appears in no page of the Sirius platform documentation. Treat as intent
SonarCloud	Static code analysis at Code Review	On the board only. The code-reviewer agent reviews across four dimensions using language models, not static analysis
Cypress, Katalon	Testing and regression	On the board only. Current test execution is Playwright
Sentry & CloudWatch	Monitoring, feeding Measure	On the board only. No agent reads either today
Intercom	Customer signal into Strategic	On the board only
Crux	Product evidence library, human-approved before citation	Carried in earlier drafts of this section. Not on the workflow board and not in platform material. Needs Alex Evans to confirm whether it is live, planned, or retired
Figma is the one to look at twice. It is marked in red on the board, and the Design Context runbook of 10 August is unusually direct about why: the agent “does not produce Figma”, and older documentation saying it produces a Figma prototype “is stale and should not be relied on”.

The awkward part is that Figma is still a hard prerequisite on one code path — that path aborts outright without a Figma connection, while the other path never calls Figma and nothing downstream consumes it. The runbook itself calls the gate vestigial.

For a team adopting Sirius: you may be asked for a Figma connection you will get no value from. Resolve it rather than provisioning it.

Which tools a team actually needs
It depends on which agents you switch on, and that is the useful answer rather than a hedge. From the Platform Onboarding page of 5 August:

If you enable…	You need
Almost any agent	An Atlassian API token, and webhook configuration access. The platform is entirely webhook-driven — nothing polls
Any agent that touches code	Git provider credentials with repository scope
Feasibility, Impact Analysis, PR Validation, Pre-merge	A Breeze API key. Not needed for the implementation agents
PR Validation, Pre-merge	A Breeze project reference at each repository root, and GitHub — these two do not support Bitbucket today
Feasibility triggered from Aha! rather than Jira	An Aha! API token
Acceptance Test	Qase, in place of Breeze
Teams notifications on a gate	A Microsoft Teams incoming webhook. Optional, and outbound only — the card notifies, the decision happens on the dashboard
Onboarding a team is a configuration change, not a deployment. The platform is multi-tenant by design: a new team is an entry in one configuration file, its own scoped credentials, and a choice of which agents to enable. Two teams can sit on entirely different Atlassian instances side by side. That is the single most useful fact in this section for anyone estimating effort.

11.2 Operations
What has to exist before an agent can run, tool by tool. 13.2 is the checklist a team works through with owners and dates; this is what each item actually means.

Required setup
Four things, and the first three are requested from someone else.

What	Needed for	Notes
Model access in the cloud account	Everything	Enabled per region. A region without it fails every agent identically, which makes it look like a platform outage rather than a permission
An Atlassian API token	Jira and Confluence	One token serves both — they are the same account, different paths. Teams on their own Atlassian tenant get their own named credentials rather than sharing
A source-control webhook token	Any agent that touches a repository	Per repository you want agents to act on
A Breeze API key	Feasibility and Impact Analysis only	These are the two agents that call Breeze live. Everything downstream reads what Impact Analysis wrote onto the ticket, so this key is narrower than it looks
The webhooks, per tool
The platform is entirely webhook-driven. Nothing polls. So a missing subscription is not a slow agent, it is a silent one.

Tool	Endpoint	Events to subscribe
Bitbucket	/webhooks/bitbucket	Pull request created, updated, approved, changes requested, and comment created
GitHub	/webhooks/github	Pull requests, pull request reviews, pull request review comments, and issue comments
Jira	/webhooks/jira	Issue updated. Status transitions are what start the status-triggered agents
Aha!	/webhooks/aha	The native audit webhook. It fires on all account activity and the platform filters; no template authoring needed
Subscribe issue comments on GitHub or half the grammar stops working. Main-thread pull request comments arrive through that event and no other, so without it ;accept, ;refine and ;rework never reach the platform. Nothing reports a fault. The agent simply appears dead to anyone commenting on a pull request.

Jira needs two fields adding
Neither is created for you, and one of them is load-bearing.

Field	Type	What writes it
Task Context Manifest	Rich text	Task Context writes its output here. Without the field the agent has nowhere to put its result
Agent Status	Single select, with values for in-progress and ready-for-review	Agents flip it to signal lifecycle. Best-effort: a missing field never fails a run, so its absence shows up as a board that never moves rather than as an error
The Breeze project mapping is set against a product field, and 13.2 flags the part that surprises people: it is one shared file rather than one per team, so an entry added for your team is visible to every team.

Microsoft Teams is outbound only
There is nothing to point at the platform. The platform posts a card into a channel you nominate, using a webhook you create there. No app registration, no inbound path, and strictly opt-in — unset means no notifications and no error.

You cannot approve from inside Teams. The card carries a link; the decision happens on the dashboard, which is where the record of who decided what lives. 13.5 says the same thing because it is the single most common misunderstanding about this integration.

Qase and the test tools
Qase holds the test cases the Acceptance Test agent writes and the QA Agent executes against. The QA Agent chooses its stack once, at setup — Jira with Qase, or Azure Boards with Azure Test Plans — and scaffolds a repository around that choice. It is not a runtime switch, so a team that picks wrong re-scaffolds. Its runbook carries the detail.

Onboarding a team is configuration, not deployment
Worth repeating from 11.1 because it is the most useful fact here for anyone estimating effort: a new team is an entry in one configuration file, its own scoped credentials, and a choice of which agents to enable. Two teams can sit on entirely different Atlassian instances side by side.

The exception is anything local. Cloud agents are switched on for a team; the plugins at 13.2 are installed by each person who runs one, on their own machine, and nobody can do that for them.

Where the deeper detail lives
Per-tool configuration mechanics and the verification steps are in Platform Onboarding — Prerequisites and Configuration, maintained alongside the platform. This section carries what an adopting team needs without opening it, and the same access note as 10.4 applies.

Source: the orchestration platform's own repository documentation, read 29 August 2026.

