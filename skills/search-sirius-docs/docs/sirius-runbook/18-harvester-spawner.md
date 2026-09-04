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
