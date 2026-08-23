export interface Settings {
  name: string;
  slug: string;
  region: string;
  retries: number;
  timeoutMs: number;
  batchSize: number;
  concurrency: number;
  webhookUrl: string;
  contactEmail: string;
  retentionDays: number;
  currency: string;
  locale: string;
  tags: string[];
  featureFlags: string[];
}

export const REGIONS = ["eu-west", "eu-central", "us-east", "ap-south"];
export const CURRENCIES = ["GBP", "EUR", "USD"];

export function fieldError(field: string, problem: string): string {
  return `${field}: ${problem}`;
}

export function validateSettings(settings: Settings): string[] {
  const errors: string[] = [];

  // name must be a sensible length once whitespace is ignored
  const trimmedName = settings.name.trim();
  if (trimmedName.length < 3 || trimmedName.length > 60) {
    errors.push(fieldError("name", "must be 3-60 characters"));
  }

  // slug is used in urls so it has to be lowercase and hyphen separated
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(settings.slug)) {
    errors.push(fieldError("slug", "must be lowercase alphanumeric with hyphens"));
  }

  // and it has to fit in the subdomain label limit we use downstream
  if (settings.slug.length > 40) {
    errors.push(fieldError("slug", "must be at most 40 characters"));
  }

  // region has to be one we actually deploy to
  if (!REGIONS.includes(settings.region)) {
    errors.push(fieldError("region", "must be a known region"));
  }

  // retries is bounded so a bad config cannot hammer an upstream
  if (
    !Number.isInteger(settings.retries) ||
    settings.retries < 0 ||
    settings.retries > 10
  ) {
    errors.push(fieldError("retries", "must be an integer between 0 and 10"));
  }

  // timeout has to sit between something usable and two minutes
  if (
    !Number.isInteger(settings.timeoutMs) ||
    settings.timeoutMs < 100 ||
    settings.timeoutMs > 120000
  ) {
    errors.push(
      fieldError("timeoutMs", "must be an integer between 100 and 120000"),
    );
  }

  // the scheduler ticks every 100ms so anything finer is meaningless
  if (settings.timeoutMs % 100 !== 0) {
    errors.push(fieldError("timeoutMs", "must be a multiple of 100"));
  }

  // batch size is capped by what one worker can hold in memory
  if (
    !Number.isInteger(settings.batchSize) ||
    settings.batchSize < 1 ||
    settings.batchSize > 5000
  ) {
    errors.push(
      fieldError("batchSize", "must be an integer between 1 and 5000"),
    );
  }

  // concurrency cannot exceed the batch or there is nothing for a worker to do
  if (
    !Number.isInteger(settings.concurrency) ||
    settings.concurrency < 1 ||
    settings.concurrency > 64 ||
    settings.concurrency > settings.batchSize
  ) {
    errors.push(
      fieldError(
        "concurrency",
        "must be an integer between 1 and 64 and no greater than batchSize",
      ),
    );
  }

  // webhooks go over the public internet so plain http is not acceptable
  let webhookOk = false;
  try {
    webhookOk = new URL(settings.webhookUrl).protocol === "https:";
  } catch {
    webhookOk = false;
  }
  if (!webhookOk) {
    errors.push(fieldError("webhookUrl", "must be an https URL"));
  }

  // a cheap email shape check, not a full rfc parser
  const emailParts = settings.contactEmail.split("@");
  let emailOk = emailParts.length === 2 && emailParts[0].length > 0;
  if (emailOk) {
    const domainParts = emailParts[1].split(".");
    emailOk = domainParts.every((part) => part.length >= 2);
  }
  if (!emailOk) {
    errors.push(fieldError("contactEmail", "must be a valid email address"));
  }

  // retention is a week at minimum and ten years at most
  if (
    !Number.isInteger(settings.retentionDays) ||
    settings.retentionDays < 7 ||
    settings.retentionDays > 3650
  ) {
    errors.push(
      fieldError("retentionDays", "must be an integer between 7 and 3650"),
    );
  }

  // only currencies billing can actually charge in
  if (!CURRENCIES.includes(settings.currency)) {
    errors.push(fieldError("currency", "must be a supported currency"));
  }

  // locale drives number and date formatting, so the shape matters
  if (!/^[a-z]{2}-[A-Z]{2}$/.test(settings.locale)) {
    errors.push(fieldError("locale", "must be a language-region code"));
  }

  // tags are free text but bounded and deduplicated
  const tagsOk =
    settings.tags.length <= 20 &&
    settings.tags.every((tag) => tag.length >= 1 && tag.length <= 30) &&
    new Set(settings.tags).size === settings.tags.length;
  if (!tagsOk) {
    errors.push(
      fieldError("tags", "must be up to 20 unique tags of 1-30 characters"),
    );
  }

  // flag names come from the feature flag service and are screaming snake case
  const flagsOk =
    settings.featureFlags.length <= 50 &&
    settings.featureFlags.every((flag) => /^[A-Z0-9_]+$/.test(flag));
  if (!flagsOk) {
    errors.push(
      fieldError("featureFlags", "must be up to 50 uppercase flag names"),
    );
  }

  return errors;
}
