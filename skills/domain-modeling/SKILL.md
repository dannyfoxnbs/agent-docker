---
name: domain-modeling
description: Build and sharpen a project's domain model. Use when the user wants to define domain terminology, record an architectural decision, or when another skill needs to maintain the domain model.
---

# Domain Modeling

Build and sharpen the project's domain model as decisions are made. Challenge ambiguous terms, test them with edge cases, and record resolved language and significant decisions immediately.

## File structure

Most repositories have one context with a root `CONTEXT.md` and ADRs in `docs/adr/`. If a root `CONTEXT-MAP.md` exists, use it to locate multiple contexts and their own `CONTEXT.md` files. Create these files lazily, only when there is something worth recording.

## During the session

- Challenge language that conflicts with an existing glossary.
- Propose precise canonical terms for vague or overloaded words.
- Use concrete scenarios to test domain relationships and boundaries.
- Check stated behaviour against the code and surface contradictions.
- Update `CONTEXT.md` as each domain term is resolved; it is a glossary, not a spec or implementation notebook.

Offer an ADR only when the decision is hard to reverse, surprising without context, and the result of a genuine trade-off. Number ADRs sequentially in `docs/adr/`.
