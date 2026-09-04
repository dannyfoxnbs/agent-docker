1
Document Overview
1.1 Purpose
This document is the single reference for how Hubexo delivers software with AI agents. It states what has been agreed, who governs each part, and what a tribe must do to adopt it. It is not a tool manual and not a project report.

After reading it, a tribe should be able to say what changes for each role, which agents apply to them, where a person must sign off, and what they need in place before they start.

1.2 Intended audience
Reader	Read this
Tribe lead adopting Sirius	1, 2, 13, then 9 for what you are agreeing to
Engineer, QA, designer	4, 5, your role in 2.5, then 10 for the agents you will use and 8 for how to record a verdict
Product Manager	7, the whole phase, and 7.4 for the doors themselves
Delivery Manager	5, 8, 9, 12, 13
Leadership	2.1, 2.2, 12
Anyone, once something is running	14 for the questions people actually ask, 15 when a run goes wrong
Then read the runbook for the agent in front of you, in the companion Runbooks document. The sections above explain the system; a runbook explains one component, including what it is known not to do yet.

Written for the people doing the work, not only for the people approving it. If a section cannot be understood by someone new to AI tools, that is a defect in the section.

1.3 How to use this documentation
Sections 1 to 6 are preparation: what this is, who does what, the words we use, how work moves. Sections 7 to 15 are execution detail. Section 13 is the adoption path once you understand the rest.

Where a section needs technical depth, it links into the Operations Reference rather than growing. Follow the link when you need it and ignore it when you do not.

1.4 Document ownership and governance
This layer	GDH Delivery Lead (Fiesta Rasyid)
Operations Reference	Solution Architect, Forever Promise (Andri Ferinata)
Source of truth	Markdown in hubexo/hd-ai-sdlc. Confluence publishes for readers. The assembled HTML is generated output, never edited by hand
Change control	One pull request per section. A merge is an approval. Every decision recorded in decisions/ with what was rejected and why
Vocabulary	Fixed to the Glossarium. A new term needs a decision, not a paragraph
Every section must carry an owner, a sources-verified date, what a tribe should be able to do after reading it, and a variance path saying who to ask for an exception and on what grounds. A rule with no exception path becomes either bureaucracy or shelfware.

Who to check each section with, and when it was last checked
The GDH Delivery Lead owns the whole set. That is not the same as knowing whether it is still true. Most sections describe something somebody else builds and changes, so freshness is a conversation with that person rather than a proofread. This register says who that person is.

Roles, not names. The two roles are held by the people named in the table above, and a role outlasts whoever holds it. Sources verified is the day someone last compared the section against the thing it describes — not the day it was last edited. A section can be edited into better prose and become less true on the same afternoon.

Section	Check with	Because they own	Sources verified
1 Document Overview	GDH Delivery Lead	This set	29 Aug 2026
2 Introduction	GDH Delivery Lead	The programme narrative	not recorded
3 Glossary	GDH Delivery Lead	The Glossarium, and the vocabulary here that tracks it. Drift is machine-checked on every build	29 Aug 2026
4 Four Building Blocks	GDH Delivery Lead	The model	not recorded
5 Workflow	GDH Delivery Lead, with the workflow diagram owner	The end-to-end shape. The phase steps at 5.2 follow the workflow diagram, which has its own owner and moves independently of this document	not recorded
6 Knowledge Foundation	Solution Architect, Forever Promise	Breeze, and what agents read	29 Aug 2026
7 Strategic	Epic Agent Suite owner	The Epic Agent Suite, which is the machinery of this whole phase	29 Aug 2026
8 Recording Feedback	Solution Architect, Forever Promise	The Run Logger and the verdict grammar	29 Aug 2026
9 Governance	AI Governance Team	The gates and the promotion criteria	29 Aug 2026
10 Agent Catalogue	Each agent's owner, per 10.1	Their own agent. The roster itself is the GDH Delivery Lead's	29 Aug 2026
11 Tools Catalogue	Solution Architect, Forever Promise	The platform and its integrations	29 Aug 2026
12 Metrics	GDH Delivery Lead	The measures and the floors	29 Aug 2026
13 Adoption Path	GDH Delivery Lead	Readiness, enablement and hypercare	29 Aug 2026
14 FAQ	GDH Delivery Lead	Questions actually asked. Fed by the service desk queue	29 Aug 2026
15 Troubleshooting	Solution Architect, Forever Promise	The operations troubleshooting record this section carries	29 Aug 2026
Runbooks	The named owner of that agent, per 10.1	Their agent's behaviour, failures and gaps	Per runbook, in its Source row
Playbook	GDH Delivery Lead	The seven-page introduction	29 Aug 2026
Three entries above have never been checked against a source. Two, four and five describe the model rather than the platform, which is why they have drifted least and been checked least. That is a reason to look, not a reason to relax.

A runbook carries its own date in its Source row, because runbooks go stale faster than sections and each one has a different owner. 10.3 says the same thing: a runbook is accurate on its stated date, not today.

How this stays honest. tools/check-owners.py runs with the other checkers. It fails if a section has no entry here, if a runbook's owner disagrees with the catalogue, or if a verified date is missing or older than ninety days. A stale date is meant to be visible rather than tidy.

