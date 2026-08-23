---
name: write-local-azure-devops-ticket
description: Write up a local version of a PBI or bug in our team's Azure DevOps format as a markdown file. Use when the user wants to draft / write / format a PBI, product backlog item or bug ticket for Azure DevOps.
---

# Write Azure DevOps Ticket

Draft a work item in our team format and write it to a markdown file within the current directory.

1. Decide the type from the request — **PBI** or **bug** — and read the matching
   template: `<skill-dir>/templates/pbi.md` or `<skill-dir>/templates/bug.md`.
2. Fill every section, following the template's layout and its inline rules. Ask
   the user for anything a section needs that wasn't provided — don't invent it.
3. Write the result to `<title>.md` (kebab-cased title) in the working directory,
   with the guidance comments stripped. Done when every template section is present
   or explicitly marked N/A.
