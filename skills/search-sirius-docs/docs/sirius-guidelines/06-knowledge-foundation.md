6
Sirius Knowledge Foundation
If an agent seems to be answering from nothing, this section is where to look first. Most knowledge problems present as a quality problem somewhere else — a vague draft, an analysis that misses half the repository — and are read as a bad agent rather than an empty lookup.

6.1 Why knowledge matters
An agent is only as good as what it can look up. Two fact libraries serve different halves of the lifecycle, and the split matters because citing the wrong one produces confident nonsense.

Library	Holds	Used
Crux	Product signals and insights, each checked by a person before an agent may cite it. Fed by what shipped: product analytics and usage measurement after release	Before the Epic. Product evidence
Breeze	The system model: Functional, Design, Architecture, Code	From the Epic onward. System truth
6.2 Organizational knowledge
Breeze is read and written, and four agents share one record per ticket. This is a correction: until the 28 July platform audit, the position here was that nothing wrote into Breeze. It does now, and the sequence matters because each step depends on the one before.

When	Agent	Effect on the graph
Before work starts	Impact Analysis	Writes the ticket's ontology record — which functional, design, code and architecture nodes the change should touch, each classified new, existing, update or delete.
While work is planned	Task Context, Design Context, Task Creation	Read it as their scope source, via the Breeze Scope Manifest field on the ticket.
On every push	PR Validation	Checks the diff against it and marks the nodes the pull request actually delivered as ready to merge.
After the merge	Pre-Merge	Reconciles: remaps nodes that turned out to be duplicates onto existing graph ids, records what shipped, and re-indexes the repository's code ontology.
Two consequences follow. The per-ticket Breeze record is the longest-lived shared object in the pipeline, so a bad impact analysis is not a bad document, it is a bad foundation that three later agents build on. And Breeze behaves as a System of Record, not a read-only reference, which is why the Human-Driven principle applies to it: what an agent writes there should be reviewable.

One rule worth generalising. Component and token names are checked against real Breeze and repository data, never taken from the model’s memory, because a model can confidently invent names that do not exist. Any agent that names things should be built this way.

6.3 Ontologies
An ontology is the schema — what kinds of thing exist in a product, and how they relate to each other. It says that a page contains components, that a function lives in a file, that a scenario is made of steps. It holds no facts about any particular product; it is the shape those facts will take.

It matters here for one reason: an agent can only reason about relationships the schema knows how to express. Where the schema has no way to say that two things are connected, no amount of scanning will find the connection.

6.4 Knowledge graphs
A knowledge graph is that schema filled with one product's facts. The same ontology, populated: these pages, these components, these files, these functions, and the real links between them.

Four graphs exist per product, and they answer different questions.

Graph	What it holds	Who reads it
Functional	Personas, outcomes, scenarios, steps and actions — what the product does for someone	Impact Analysis, Feasibility, the Epic Agent Suite on a deep run
Design	Journeys, flows, pages and components — how it is put together on screen	Impact Analysis, Design Context, Acceptance Test
Code	Files, classes and functions	Impact Analysis, Task Context, PR Validation
Architecture	Services, gateways, queues and data schemas	Impact Analysis, Feasibility, Architecture Implementation
A graph is a claim about the product as it is, not as it was designed. It is rebuilt from the real repository and the real screens, which is why a graph that has not been reindexed after a merge quietly answers yesterday's question.

6.5 Breeze
Breeze is the system that builds and serves the graphs. One product's four graphs live behind one project, and an agent reaches them with a key that has to be entitled to every project it might touch.

Two agents call Breeze at runtime, and knowing which two explains a lot. Feasibility scans it to size a ticket, and Impact Analysis scans it to produce the impact report. Everything downstream reads that report, through the Breeze Scope Manifest field on the ticket, not through Breeze itself.

So the live dependency is narrow and the derived one is wide. A team whose Breeze access is broken does not see nine agents fail; it sees two agents produce nothing useful and seven more build confidently on what they produced. 5.7 shows which agent reads which graph, and what it leaves behind.

The failure mode is silence, and it is the one to know. A team whose Breeze access is not connected will find Impact Analysis, Task Context and Feasibility running with nothing to read — and reporting success anyway. Worse, a stale connection makes the tools invisible to the agent rather than returning an error, so a deep run produces confident, ungrounded drafts and nothing anywhere says so. If output quality drops suddenly across several agents at once, check the connection before you check the prompts.

How to tell whether a graph is current. Compare the Breeze project's last index time against the last merge to main. If indexing is behind, Impact Analysis is scoping against a codebase that no longer exists and every agent downstream inherits it. Worth checking before a Spec Sprint rather than during one.

Crux is where the loop closes. Product analytics and usage measurement on a release feed it, a person checks each signal, and the next idea is argued from what the last one did. That is why the phases are a cycle rather than a line: Strategic does not start from nothing, it starts from the measurement of the previous release. A team with no analytics reaching Crux still runs the workflow, and runs it on opinion.

Crux is a second graph, and it is not Breeze. It is also more than a store: a discovery agent gathers the evidence and a separate query engine serves it, which is why what lands there is proposed by a machine and approved by a person rather than typed in by hand. It holds product evidence upstream of an Epic — the signals a claim is validated against — and the Epic Agent Suite queries it before its discovery context. Breeze holds the system; Crux holds the evidence for wanting to change it.

6.6 Relationship with AI agents
A scan runs in two passes: search all four graphs in parallel, then re-query to bridge design, code and architecture using what the first pass found. One bias is built in: prefer updating an existing thing over creating a new one. If a layer fails, that layer degrades to limited visibility rather than failing the whole scan. Worth knowing when reading a confident-looking analysis.

