Infrastructure
What the agents run on. You won't operate most of this, but knowing the parts helps when something breaks.

The short version
Agents run in the cloud, think using Claude, reach your everyday tools through a standard connector, and ship code through GitHub. Credentials are locked in a vault and every run's cost is tracked. That's the whole picture.

The parts, in plain terms
Part	What it is	Why you care
Cloud (AWS)	Where agents run. Some wake up on demand and stop when idle; a few run continuously.	Agents are available when you trigger them, and we only pay for what runs.
The model (Claude, via AWS Bedrock)	The reasoning engine behind every agent.	This is the "brain" doing the drafting.
MCP connectors	A standard plug that lets an agent securely read and write a tool.	It's how an agent can open a Jira ticket or a Figma frame without a person copying things across.
GitHub	Where code lives and how it ships (build and deploy are automated).	One home for agent code and product code, moved off the old BitBucket setup.
Secrets vault + least-privilege access	Credentials stored centrally; each agent gets only the access it needs.	Keeps the keys safe and limits what any single agent can touch.
Cost tracking	Token use and cost logged per agent.	We can see which agents are expensive and tune them.
The tools agents connect to today: Aha!, Jira, Qase.io, GitHub, Breeze (the knowledge graph), BrainGrid, and PostHog.

Design does not go through Figma. Page designs are HTML using shared Tailwind tokens, authored with Claude, and they live in one design repository alongside the design systems and a per-sprint record of what shipped. Worth saying plainly, because most people assume a design agent means Figma.

One coordinator, not many
Earlier the design had several coordinators, one per track. It has since simplified to one Main Orchestrator that runs the whole pipeline. Fewer moving parts to operate, one place to look when a handoff goes wrong.

If you are on call, go to the agent runbook, not this page. The exact AWS settings, scaling rules and alarms change too often to copy here.

