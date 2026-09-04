---
name: search-sirius-docs
description: Answer a question from the Project Sirius documentation.
disable-model-invocation: true
---

# Search Sirius docs

Answer the user's question from `docs/`, citing `file:line` for every claim.

- `docs/sirius-playbook.md` — the shape in seven pages.
- `docs/sirius-guidelines/` — the standard, split by section: `00-contents` (the map), then `01-document-overview` … `15-troubleshooting`. `03-glossary` defines the vocabulary.
- `docs/sirius-runbook.md` — fifteen fields per agent, per lane.

Prose exports with no markdown headings — navigate with `grep -rn` then `sed -n` a window around the hit. The Guidelines carries bare numbered markers (`1.2`, `10.2`) on their own line.

## Steps

1. **Grep the corpus** for the question's terms across all files at once. Sirius renames things — search the user's word and the Sirius word. When unsure which is which, read `03-glossary.md`.
2. **Read the range**, not the matched line: `sed -n` from ~30 lines before the hit to the next numbered marker.
3. **Widen once** with different wording if the hits are thin — the Playbook and Guidelines often name one concept differently.
4. **Answer with citations.** Name both sources where they disagree. Say plainly when the answer is absent from the corpus rather than filling the gap from general knowledge.

Done when every part of the question is either answered from a cited passage or reported as absent.
