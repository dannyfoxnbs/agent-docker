---
description: Open a native diff review window and feed the composed feedback to Claude. Optional: /diff-review <base-branch>
disable-model-invocation: true
argument-hint: [base-branch]
---

Address the code review feedback that was injected into context by the `/diff-review` hook. For each comment:

- Apply the requested change to the codebase, or
- Explain why you disagree with the point.

Work through every comment in the feedback. Do not edit files outside the scope of the review.
