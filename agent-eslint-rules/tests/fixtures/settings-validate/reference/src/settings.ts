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

const NAME_MIN_LENGTH = 3;
const NAME_MAX_LENGTH = 60;
const SLUG_MAX_LENGTH = 40;
const RETRIES_MIN = 0;
const RETRIES_MAX = 10;
const TIMEOUT_MIN_MS = 100;
const TIMEOUT_MAX_MS = 120000;
const TIMEOUT_STEP_MS = 100;
const BATCH_SIZE_MIN = 1;
const BATCH_SIZE_MAX = 5000;
const CONCURRENCY_MIN = 1;
const CONCURRENCY_MAX = 64;
const RETENTION_MIN_DAYS = 7;
const RETENTION_MAX_DAYS = 3650;
const TAGS_MAX = 20;
const TAG_MIN_LENGTH = 1;
const TAG_MAX_LENGTH = 30;
const FLAGS_MAX = 50;
const EMAIL_PART_COUNT = 2;
const DOMAIN_LABEL_MIN_LENGTH = 2;

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const LOCALE_PATTERN = /^[a-z]{2}-[A-Z]{2}$/;
const FLAG_NAME_PATTERN = /^[A-Z0-9_]+$/;

export function fieldError(field: string, problem: string): string {
  return `${field}: ${problem}`;
}

function isIntegerInRange(value: number, min: number, max: number): boolean {
  return Number.isInteger(value) && value >= min && value <= max;
}

function nameError(name: string): string | null {
  const trimmed = name.trim();
  return trimmed.length >= NAME_MIN_LENGTH && trimmed.length <= NAME_MAX_LENGTH
    ? null
    : fieldError("name", `must be ${NAME_MIN_LENGTH}-${NAME_MAX_LENGTH} characters`);
}

function slugShapeError(slug: string): string | null {
  return SLUG_PATTERN.test(slug)
    ? null
    : fieldError("slug", "must be lowercase alphanumeric with hyphens");
}

function slugLengthError(slug: string): string | null {
  return slug.length <= SLUG_MAX_LENGTH
    ? null
    : fieldError("slug", `must be at most ${SLUG_MAX_LENGTH} characters`);
}

function regionError(region: string): string | null {
  return REGIONS.includes(region) ? null : fieldError("region", "must be a known region");
}

function retriesError(retries: number): string | null {
  return isIntegerInRange(retries, RETRIES_MIN, RETRIES_MAX)
    ? null
    : fieldError("retries", `must be an integer between ${RETRIES_MIN} and ${RETRIES_MAX}`);
}

function timeoutRangeError(timeoutMs: number): string | null {
  return isIntegerInRange(timeoutMs, TIMEOUT_MIN_MS, TIMEOUT_MAX_MS)
    ? null
    : fieldError("timeoutMs", `must be an integer between ${TIMEOUT_MIN_MS} and ${TIMEOUT_MAX_MS}`);
}

function timeoutStepError(timeoutMs: number): string | null {
  return timeoutMs % TIMEOUT_STEP_MS === 0
    ? null
    : fieldError("timeoutMs", `must be a multiple of ${TIMEOUT_STEP_MS}`);
}

function batchSizeError(batchSize: number): string | null {
  return isIntegerInRange(batchSize, BATCH_SIZE_MIN, BATCH_SIZE_MAX)
    ? null
    : fieldError("batchSize", `must be an integer between ${BATCH_SIZE_MIN} and ${BATCH_SIZE_MAX}`);
}

function concurrencyError(concurrency: number, batchSize: number): string | null {
  const withinRange = isIntegerInRange(concurrency, CONCURRENCY_MIN, CONCURRENCY_MAX);
  return withinRange && concurrency <= batchSize
    ? null
    : fieldError(
        "concurrency",
        `must be an integer between ${CONCURRENCY_MIN} and ${CONCURRENCY_MAX} and no greater than batchSize`,
      );
}

function isHttpsUrl(candidate: string): boolean {
  try {
    return new URL(candidate).protocol === "https:";
  } catch {
    return false;
  }
}

function webhookUrlError(webhookUrl: string): string | null {
  return isHttpsUrl(webhookUrl) ? null : fieldError("webhookUrl", "must be an https URL");
}

function isEmailShaped(candidate: string): boolean {
  const parts = candidate.split("@");
  if (parts.length !== EMAIL_PART_COUNT || parts[0].length === 0) {
    return false;
  }
  return parts[1].split(".").every((label) => label.length >= DOMAIN_LABEL_MIN_LENGTH);
}

function contactEmailError(contactEmail: string): string | null {
  return isEmailShaped(contactEmail)
    ? null
    : fieldError("contactEmail", "must be a valid email address");
}

function retentionError(retentionDays: number): string | null {
  return isIntegerInRange(retentionDays, RETENTION_MIN_DAYS, RETENTION_MAX_DAYS)
    ? null
    : fieldError(
        "retentionDays",
        `must be an integer between ${RETENTION_MIN_DAYS} and ${RETENTION_MAX_DAYS}`,
      );
}

function currencyError(currency: string): string | null {
  return CURRENCIES.includes(currency)
    ? null
    : fieldError("currency", "must be a supported currency");
}

function localeError(locale: string): string | null {
  return LOCALE_PATTERN.test(locale)
    ? null
    : fieldError("locale", "must be a language-region code");
}

function tagsError(tags: string[]): string | null {
  const sized = tags.every(
    (tag) => tag.length >= TAG_MIN_LENGTH && tag.length <= TAG_MAX_LENGTH,
  );
  const unique = new Set(tags).size === tags.length;
  return tags.length <= TAGS_MAX && sized && unique
    ? null
    : fieldError(
        "tags",
        `must be up to ${TAGS_MAX} unique tags of ${TAG_MIN_LENGTH}-${TAG_MAX_LENGTH} characters`,
      );
}

function featureFlagsError(featureFlags: string[]): string | null {
  return featureFlags.length <= FLAGS_MAX && featureFlags.every((flag) => FLAG_NAME_PATTERN.test(flag))
    ? null
    : fieldError("featureFlags", `must be up to ${FLAGS_MAX} uppercase flag names`);
}

export function validateSettings(settings: Settings): string[] {
  return [
    nameError(settings.name),
    slugShapeError(settings.slug),
    slugLengthError(settings.slug),
    regionError(settings.region),
    retriesError(settings.retries),
    timeoutRangeError(settings.timeoutMs),
    timeoutStepError(settings.timeoutMs),
    batchSizeError(settings.batchSize),
    concurrencyError(settings.concurrency, settings.batchSize),
    webhookUrlError(settings.webhookUrl),
    contactEmailError(settings.contactEmail),
    retentionError(settings.retentionDays),
    currencyError(settings.currency),
    localeError(settings.locale),
    tagsError(settings.tags),
    featureFlagsError(settings.featureFlags),
  ].filter((error): error is string => error !== null);
}
