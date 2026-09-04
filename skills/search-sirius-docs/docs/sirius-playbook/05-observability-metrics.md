Observability & Metrics
What we measure, and the one line we won't cross.

Everything starts with the Agent Logs
Every agent run is logged: what it did, how long it took, whether the output was accepted or reworked, whether it hallucinated, and how much manual time it saved. Nothing else on this page works without this. If a run isn't logged, it didn't happen as far as the metrics are concerned.

The few numbers that matter
We deliberately track a short list, well, rather than a wall of charts nobody reads.

Agent Acceptance Rate — how often an agent's output is used as-is, first time. The clearest quality signal.
Rework rate — how often it needs another round. Some rework is healthy iteration, not failure.
Time saved — counted only when the output was actually accepted. We don't claim time savings on work that got thrown away.
DORA — our standard delivery health: how often we ship, how fast, how safely, how quickly we recover.
The line we won't cross
A milestone is not a metric, and ticket count is not the measure. Getting the pipeline running is a milestone we celebrate once, not a number we chase. More output is the point, but it is delivered, reviewed work that counts — not tickets moved.

And we watch the people, not just the machines. Here's why that matters, from our own pilot:

Delivery went elite — near-perfect uptime, fast recovery, deploys rebounding — while team engagement fell sharply (8.45 → 7.2 in a month, the biggest single drop on record) and over 100 finished items piled up in a final-check queue. The machines were green. The people were red.

That is exactly the signal this page exists to catch. Strong delivery numbers can hide a tired team. We read both, and pace beats output when they conflict.

