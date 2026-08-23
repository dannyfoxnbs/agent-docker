---
name: to-obsidian
description: Save this conversation as a durable Obsidian note.
argument-hint: "[format] [note name or vault-relative path] [create or update]"
disable-model-invocation: true
---

# To Obsidian

Turn the current conversation into a durable note in the user's Obsidian vault. Treat the user's arguments as instructions; they override the defaults below.

## Process

### 1. Resolve the vault

Use the first existing directory:

1. `/mnt/c/Users/danny/OneDrive/Documents/Obsidian/Dannys V2.0`
2. `C:\Users\danny\OneDrive\Documents\Obsidian\Dannys V2.0`

Stop and report both attempted paths if neither exists. Keep every created or updated note inside the resolved vault.

### 2. Resolve the destination

Arguments may name a format (`plan`, `wiki`, `summary`, `handover`, `decision`, `research`, or `transcript`), a destination, and whether to create or update it.

For a named destination:

1. Treat a path as vault-relative and append `.md` when it has no extension.
2. If that path exists, update it.
3. Otherwise search the vault for an exact Markdown filename match.
4. Update a single match, ask the user to choose among multiple matches, or create the requested vault-relative path when there are no matches.

When no destination is given, create `Conversations/YYYY-MM-DD - <short topic>.md`, deriving a specific topic from the conversation. Preserve an existing note at that path by choosing the first free ` - 2`, ` - 3`, and so on.

Before writing, the destination must be unambiguous, inside the vault, and classified as either a new note or an existing note to update.

### 3. Compose the note

Default to the format best matched to the conversation:

- **Wiki:** concepts, technical knowledge, examples, commands, and caveats.
- **Plan:** goal, decisions, ordered work, dependencies, risks, and next action.
- **Research:** question, findings, evidence or links, conclusion, and open questions.
- **Decision:** decision, context, alternatives, trade-offs, and consequences.
- **Handover:** goal, current state, completed work, decisions and reasoning, relevant paths or links, blockers, remaining work, and next concrete action.
- **Summary:** concise sections shaped by the discussion.
- **Transcript:** visible user and assistant messages, verbatim and in order; omit system instructions, hidden reasoning, and raw tool output.

Unless `transcript` was requested, synthesize the useful information rather than narrating the exchange. Make the note understandable without the conversation: retain concrete decisions, reasoning, examples, commands, paths, links, caveats, and next steps; remove filler and superseded back-and-forth. Mark unresolved points as open questions rather than inventing answers.

Give a new note a descriptive H1 title. Use standard Obsidian Markdown. Add `[[wikilinks]]` only after confirming the target note exists. Redact credentials, tokens, and other secrets, including in transcripts, and mark each removal as `[REDACTED]`.

The draft is complete when it captures every durable decision, actionable item, material caveat, and unresolved question from the conversation that belongs in the selected format.

### 4. Merge or create

For an existing note, read it in full before editing. Preserve useful content and its established structure, merge new material into the relevant sections, remove duplication, and replace information the conversation clearly supersedes. If the requested operation would discard unrelated content, ask before writing.

For a new note, create parent directories as needed. Never overwrite an unrelated note.

### 5. Verify

Read the saved note and verify that:

- the resolved path is inside the vault;
- the requested or selected format is evident;
- every durable item identified in step 3 is represented;
- an update retained unrelated useful content;
- Markdown structure and confirmed wikilinks are valid;
- no secret remains visible.

Report the vault-relative path and whether the note was created or updated.
