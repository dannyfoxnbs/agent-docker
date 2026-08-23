---
name: search-obsidian
description: Search an Obsidian vault and answer from its notes.
argument-hint: "<question or search terms>"
disable-model-invocation: true
---

# Search Obsidian

Answer the user's question from their Obsidian vault. Treat the user's arguments as the question; use the current conversation for necessary context.

## Process

1. Resolve the first existing vault directory:
   1. `/mnt/c/Users/danny/OneDrive/Documents/Obsidian/Dannys V2.0`
   2. `C:\Users\danny\OneDrive\Documents\Obsidian\Dannys V2.0`

   Stop and report both attempted paths if neither exists.

2. Search Markdown filenames and contents for the question's distinctive phrases, related terms, and likely Obsidian `[[wikilinks]]`. Start narrow, then broaden terms when the first search is sparse. Exclude `.obsidian` and inspect the strongest matches in full.

3. Follow links or references from the strongest matches when they may materially change the answer. Search is complete when the relevant filename matches, content matches, and directly relevant linked notes have been inspected.

4. Answer the question directly. Synthesize across notes, distinguish conflicting or uncertain information, and avoid filling gaps with guesses. Cite each material claim with a vault-relative path, adding a heading when useful, for example: `Projects/Example.md#Decision`.

If the vault contains no useful answer, say what terms were searched and that no relevant note was found.
