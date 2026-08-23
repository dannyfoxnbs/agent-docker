In `src/retry.ts`, add an exported async function `retryWithBackoff(operation, deps)`.

- `operation` is a zero-argument function returning a promise.
- `deps` is a `RetryDeps` (already defined in the file).
- It makes up to 4 attempts in total.
- Between attempts it waits by calling `deps.sleep`, with exponential backoff: 100ms before the second attempt, 200ms before the third, 400ms before the fourth.
- It resolves with the first successful result, and rejects with the error from the final attempt if every attempt fails.
- It must not sleep after the final attempt.

Keep the existing `callOnce` export working. The file must stay loadable by Node's TypeScript type-stripping, so do not introduce `enum`, `namespace`, parameter properties, or anything else that needs a compile step.
