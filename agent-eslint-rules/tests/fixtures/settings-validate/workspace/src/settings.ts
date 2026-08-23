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
