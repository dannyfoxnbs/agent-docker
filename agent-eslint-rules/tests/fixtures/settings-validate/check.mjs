import assert from "node:assert/strict";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const module = await import(pathToFileURL(resolve(process.cwd(), "src/settings.ts")).href);
const { validateSettings, fieldError, REGIONS, CURRENCIES } = module;

assert.equal(typeof validateSettings, "function", "validateSettings must be exported");
assert.equal(typeof fieldError, "function", "fieldError must stay exported");
assert.deepEqual(REGIONS, ["eu-west", "eu-central", "us-east", "ap-south"], "REGIONS unchanged");
assert.deepEqual(CURRENCIES, ["GBP", "EUR", "USD"], "CURRENCIES unchanged");

const valid = {
  name: "Acme Ltd",
  slug: "acme-ltd",
  region: "eu-west",
  retries: 3,
  timeoutMs: 30000,
  batchSize: 500,
  concurrency: 8,
  webhookUrl: "https://example.com/hook",
  contactEmail: "ops@example.com",
  retentionDays: 90,
  currency: "GBP",
  locale: "en-GB",
  tags: ["prod", "billing"],
  featureFlags: ["NEW_UI", "FAST_PATH"],
};

assert.deepEqual(validateSettings(valid), [], "a valid settings object produces no messages");

// Each case changes one thing and must produce exactly the one documented message,
// so a check that fires on the wrong field or swallows a problem is caught here.
const cases = [
  ["name", { name: "ab" }, "must be 3-60 characters"],
  ["name", { name: "a".repeat(61) }, "must be 3-60 characters"],
  ["name", { name: "   ab   " }, "must be 3-60 characters"],
  ["slug", { slug: "Acme-Ltd" }, "must be lowercase alphanumeric with hyphens"],
  ["slug", { slug: "-acme" }, "must be lowercase alphanumeric with hyphens"],
  ["slug", { slug: "acme-" }, "must be lowercase alphanumeric with hyphens"],
  ["slug", { slug: "acme_ltd" }, "must be lowercase alphanumeric with hyphens"],
  ["slug", { slug: `a${"b".repeat(40)}` }, "must be at most 40 characters"],
  ["region", { region: "mars-north" }, "must be a known region"],
  ["retries", { retries: 11 }, "must be an integer between 0 and 10"],
  ["retries", { retries: -1 }, "must be an integer between 0 and 10"],
  ["retries", { retries: 2.5 }, "must be an integer between 0 and 10"],
  ["timeoutMs", { timeoutMs: 0 }, "must be an integer between 100 and 120000"],
  ["timeoutMs", { timeoutMs: 130000 }, "must be an integer between 100 and 120000"],
  ["timeoutMs", { timeoutMs: 150 }, "must be a multiple of 100"],
  ["batchSize", { batchSize: 5001 }, "must be an integer between 1 and 5000"],
  ["concurrency", { concurrency: 65 }, "must be an integer between 1 and 64 and no greater than batchSize"],
  ["concurrency", { concurrency: 0 }, "must be an integer between 1 and 64 and no greater than batchSize"],
  ["concurrency", { batchSize: 4, concurrency: 8 }, "must be an integer between 1 and 64 and no greater than batchSize"],
  ["webhookUrl", { webhookUrl: "http://example.com/hook" }, "must be an https URL"],
  ["webhookUrl", { webhookUrl: "not a url" }, "must be an https URL"],
  ["contactEmail", { contactEmail: "ops-at-example.com" }, "must be a valid email address"],
  ["contactEmail", { contactEmail: "ops@@example.com" }, "must be a valid email address"],
  ["contactEmail", { contactEmail: "@example.com" }, "must be a valid email address"],
  ["contactEmail", { contactEmail: "ops@example.c" }, "must be a valid email address"],
  ["retentionDays", { retentionDays: 6 }, "must be an integer between 7 and 3650"],
  ["retentionDays", { retentionDays: 4000 }, "must be an integer between 7 and 3650"],
  ["currency", { currency: "JPY" }, "must be a supported currency"],
  ["locale", { locale: "en_GB" }, "must be a language-region code"],
  ["locale", { locale: "EN-GB" }, "must be a language-region code"],
  ["locale", { locale: "en-gb" }, "must be a language-region code"],
  ["tags", { tags: Array.from({ length: 21 }, (_, index) => `tag${index}`) }, "must be up to 20 unique tags of 1-30 characters"],
  ["tags", { tags: ["prod", "prod"] }, "must be up to 20 unique tags of 1-30 characters"],
  ["tags", { tags: [""] }, "must be up to 20 unique tags of 1-30 characters"],
  ["tags", { tags: ["t".repeat(31)] }, "must be up to 20 unique tags of 1-30 characters"],
  ["featureFlags", { featureFlags: Array.from({ length: 51 }, (_, index) => `FLAG_${index}`) }, "must be up to 50 uppercase flag names"],
  ["featureFlags", { featureFlags: ["new_ui"] }, "must be up to 50 uppercase flag names"],
  ["featureFlags", { featureFlags: ["NEW-UI"] }, "must be up to 50 uppercase flag names"],
];

for (const [field, patch, problem] of cases) {
  const actual = validateSettings({ ...valid, ...patch });
  assert.deepEqual(
    actual,
    [fieldError(field, problem)],
    `${field} = ${JSON.stringify(Object.values(patch)[0])} should report exactly ${JSON.stringify(problem)}`,
  );
}

// No positive concurrency can be within a zero batch, so these two always travel
// together. Asserted explicitly rather than left out, because an implementation
// that suppresses the second one is wrong.
assert.deepEqual(
  validateSettings({ ...valid, batchSize: 0 }),
  [
    fieldError("batchSize", "must be an integer between 1 and 5000"),
    fieldError("concurrency", "must be an integer between 1 and 64 and no greater than batchSize"),
  ],
  "a zero batch fails its own check and drags concurrency down with it",
);

// Order is part of the contract, so an implementation cannot collect problems in
// whatever sequence happens to be convenient.
assert.deepEqual(
  validateSettings({ ...valid, name: "ab", region: "mars-north", locale: "en_GB" }),
  [
    fieldError("name", "must be 3-60 characters"),
    fieldError("region", "must be a known region"),
    fieldError("locale", "must be a language-region code"),
  ],
  "messages come back in the documented order",
);

assert.equal(fieldError("a", "b"), "a: b", "fieldError unchanged");
