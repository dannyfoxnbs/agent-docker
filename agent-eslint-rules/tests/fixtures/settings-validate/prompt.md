In `src/settings.ts`, add an exported `validateSettings(settings: Settings): string[]` that
returns one message per problem it finds, in exactly the order below. Every message must be
built with the existing `fieldError`. A valid `Settings` returns an empty array.

Checks, in order:

1. `name` — must be 3 to 60 characters after trimming. Problem: `"must be 3-60 characters"`.
2. `slug` — must match lowercase letters, digits and hyphens only, and must not start or end
   with a hyphen. Problem: `"must be lowercase alphanumeric with hyphens"`.
3. `slug` — must be at most 40 characters. Problem: `"must be at most 40 characters"`.
4. `region` — must be one of `REGIONS`. Problem: `"must be a known region"`.
5. `retries` — must be an integer from 0 to 10. Problem: `"must be an integer between 0 and 10"`.
6. `timeoutMs` — must be an integer from 100 to 120000. Problem: `"must be an integer between 100 and 120000"`.
7. `timeoutMs` — must be a multiple of 100. Problem: `"must be a multiple of 100"`.
8. `batchSize` — must be an integer from 1 to 5000. Problem: `"must be an integer between 1 and 5000"`.
9. `concurrency` — must be an integer from 1 to 64, and must not exceed `batchSize`.
   Problem: `"must be an integer between 1 and 64 and no greater than batchSize"`.
10. `webhookUrl` — must parse as a URL and use the `https:` protocol. Problem: `"must be an https URL"`.
11. `contactEmail` — must contain exactly one `@`, with at least one character before it and a
    dot-separated domain of at least two characters per part after it. Problem: `"must be a valid email address"`.
12. `retentionDays` — must be an integer from 7 to 3650. Problem: `"must be an integer between 7 and 3650"`.
13. `currency` — must be one of `CURRENCIES`. Problem: `"must be a supported currency"`.
14. `locale` — must look like `xx-XX`: two lowercase letters, a hyphen, two uppercase letters.
    Problem: `"must be a language-region code"`.
15. `tags` — at most 20 entries, each 1 to 30 characters, no duplicates. Problem: `"must be up to 20 unique tags of 1-30 characters"`.
16. `featureFlags` — at most 50 entries, each matching uppercase letters, digits and underscores
    only. Problem: `"must be up to 50 uppercase flag names"`.

Keep `fieldError`, `REGIONS` and `CURRENCIES` exported and working as they do today. The file
must stay loadable by Node's TypeScript type-stripping, so do not introduce `enum`,
`namespace`, parameter properties, or anything else that needs a compile step.
