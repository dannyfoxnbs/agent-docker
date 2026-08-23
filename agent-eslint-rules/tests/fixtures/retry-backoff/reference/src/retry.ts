export interface RetryDeps {
  sleep: (ms: number) => Promise<void>;
}

export async function callOnce<T>(
  operation: () => Promise<T>,
): Promise<T> {
  return operation();
}

const MAX_ATTEMPTS = 4;
const FIRST_BACKOFF_MS = 100;
const BACKOFF_MULTIPLIER = 2;

export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  deps: RetryDeps,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    if (attempt > 0) {
      await deps.sleep(FIRST_BACKOFF_MS * BACKOFF_MULTIPLIER ** (attempt - 1));
    }
    try {
      return await operation();
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}
