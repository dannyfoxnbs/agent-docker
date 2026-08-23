---
name: read-azure-devops-ticket
description: Read an Azure DevOps ticket / work item (PBI, bug, task) from the Nimbus org. Use when the user references a PBI or work-item id, an Azure DevOps ticket, or asks to look up / summarize / pull in a ticket.
---

# Read Azure DevOps Ticket

Read work items from the `thenbs` org, `Nimbus` project.

```bash
python3 <skill-dir>/scripts/workitem.py <id>
```

Prints type, title, state, assignee, iteration, tags, description, acceptance
criteria / repro steps, and parent/child/related links. Setup and troubleshooting
are in `README.md`.
