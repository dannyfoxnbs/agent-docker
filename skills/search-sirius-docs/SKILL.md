---
name: search-sirius-docs
description: Answer a question from the Project Sirius documentation.
disable-model-invocation: true
---

# Search Sirius docs

Answer the user's question from `docs/`, citing `file:line` for every claim.

Three corpora, each split into a folder whose `00-contents.md` is its map:

- `docs/sirius-playbook/` — the shape in seven pages, `01-introduction-glossary` … `07-readiness-adoption`.
- `docs/sirius-guidelines/` — the standard, `01-document-overview` … `15-troubleshooting`. `03-glossary` defines the vocabulary.
- `docs/sirius-runbook/` — one file per agent, `01-epic-agent-suite` … `21-design-capture`, fifteen fields each.

Prose exports with no markdown headings — navigate with `grep -rn` then `sed -n` a window around the hit. The Guidelines carries bare numbered markers (`1.2`, `10.2`) on their own line.

## Steps

1. **Grep the corpus** for the question's terms across all files at once. Sirius renames things — search the user's word and the Sirius word. When unsure which is which, read `03-glossary.md`.
2. **Read the range**, not the matched line: `sed -n` from ~30 lines before the hit to the next numbered marker.
3. **Widen once** with different wording if the hits are thin — the Playbook and Guidelines often name one concept differently.
4. **Answer with citations.** Name both sources where they disagree. Say plainly when the answer is absent from the corpus rather than filling the gap from general knowledge.

Done when every part of the question is either answered from a cited passage or reported as absent.
