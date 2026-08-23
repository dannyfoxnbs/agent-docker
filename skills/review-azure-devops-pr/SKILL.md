---
name: review-azure-devops-pr
description: Risk-review an Azure DevOps PR from its diff — post a few terse inline comments for HIGH-RISK findings only, plus one summary line, skipping anything already commented.
disable-model-invocation: true
---

# Review Azure DevOps PR

Leave a **minimal, high-signal** review on a PR: a few inline comments for
high-risk issues only, and always exactly one summary line.

**The scripts do all Azure DevOps and git work. Never call the API, curl, or git
yourself — run the script and use its output.** Review the **diff only**; do not
open files. Your only job is step 3, the risk judgment.

`<sk>` = the directory holding this skill; its siblings sit beside it.

1. **Read the diff** — run, use the output as-is:
   ```
   python3 <sk>/read-azure-devops-pr-diff/scripts/pr_diff.py <pr-id>
   ```

2. **Read prior comments** — so you don't repeat yourself:
   ```
   python3 <sk>/read-azure-devops-pr-comments/scripts/pr_comments.py <pr-id>
   ```

3. **Review for HIGH-RISK issues only.** In scope — nothing else:
   - **Correctness** — logic errors, off-by-one, wrong conditionals, unhandled
     null/undefined, bad async/await, races.
   - **Security** — injection, committed secrets, missing authz, unsafe
     deserialization.
   - **Data / state loss** — unguarded mutations, missing transactions, errors
     silently swallowed.
   - **Breaking contracts** — API/interface/schema changes that break callers.

   **OUT of scope — never comment** (the human reviewer's job): naming,
   formatting, duplication, "could be cleaner", complexity/nesting, magic
   numbers, missing tests, style/SCSS conventions.

   Form inline findings as `{file, line, message}` — `line` is the **new-file**
   line from the diff hunk. Drop any finding already covered by a
   `🤖 AI review:` thread from step 2 (judge by meaning, not wording). Keep only
   what clears the bar below.

4. **Post** — always one summary; inline comments only if any survive. Write the
   findings JSON and the one-line summary to scratch paths, then:
   ```
   python3 <sk>/write-azure-devops-pr-comment/scripts/post_comment.py <pr-id> \
       --json <findings.json> --summary <summary.txt>
   ```
   When clean, pass `--summary` only. Summary text is one line —
   `no high-risk issues found.` or
   `N high-risk issue(s) flagged inline — 2 correctness, 1 security.`
   The summary thread is idempotent (updated in place on re-runs). Then report
   what you posted and what you skipped as already-made.

## Bar for a comment

State the **concrete failure in one sentence** + at most one short fix. No
preamble, no "consider", no restating the code, no severity labels. If you can't
name the specific bad outcome in one sentence, it isn't high-risk — drop it. A
clean PR with just the summary line is a good result; over-commenting is what
gets the tool muted.
