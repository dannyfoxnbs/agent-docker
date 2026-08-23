---
name: share-transcript
description: Render the current conversation as a styled, terminal-look HTML page and publish it as a claude.ai share link. Use when the user wants to share, export, or publish a conversation as a readable transcript / HTML page / Claude share link for a team.
---

Turn a conversation into a single self-contained HTML transcript and publish it with the `Artifact` tool, returning the share link. The look is fixed by [`template.html`](template.html) so every transcript a team produces is consistent.

## Steps

1. **Get the transcript source.** Prefer a verbatim export: if the user ran `/export`, read the most recent `*.txt` it wrote (often in the cwd, long filename). If none exists, reconstruct from the conversation already in your context — do not ask the user to re-run anything you can already see. Either way you need: the model/version/cwd for the masthead, and every user turn and assistant turn in order.

2. **Copy the template.** Read [`template.html`](template.html) and copy its `<title>` + `<style>` block and the `.wrap`/masthead skeleton verbatim into a new file in the scratchpad dir. Do not restyle — the CSS is the point. Only edit the masthead text (model, version, cwd) and the footer.

3. **Map each turn to a component.** Walk the conversation start to finish and emit, in order:
   - User turn → `.msg.user` block with a `❯ <Name>` label.
   - Assistant turn → `.msg.claude` block. If it poses a numbered question or has a clear topic, add the `· <suffix>` to the label.
   - Tool calls (reads, searches, writes, skill loads, agent launches) → condense to `.tool` lines with the `●` head and `⎿` sub — never reproduce raw tool output, just a one-line recap.
   - A finished background agent → `.agent-done` line (green `●`) with its duration.
   - A recommendation/verdict inside an assistant turn → `.rec` rail.
   - Tables, lists, and a final decisions summary use the `.table-wrap`, `.msg ul`, and `.outcome` components.
   The component cheatsheet is the commented examples in `template.html`.

   Fidelity rule: keep the substance of every turn; you may condense long assistant prose, but never drop a turn, invert order, or invent exchanges that did not happen.

4. **Publish.** Call `Artifact` with the file path, a one-emoji `favicon` matching the topic, and a one-sentence `description`. To update an existing transcript, re-run with the **same file path** so it redeploys to the same URL. Return the link to the user and note it is private until they choose to share it.

## Notes

- Self-contained only: the Artifact CSP blocks external fonts/scripts/images, so the template uses a monospace system stack and an inline ASCII logo — keep it that way.
- This skill already encodes the design, so you need not separately load `artifact-design`.
