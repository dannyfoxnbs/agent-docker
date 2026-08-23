export interface RetryDeps {
  sleep: (ms: number) => Promise<void>;
}

export async function callOnce<T>(
  operation: () => Promise<T>,
): Promise<T> {
  return operation();
}

// Retries the operation up to 4 times with exponential backoff.
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  deps: RetryDeps,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= 4; attempt++) {
    if (attempt > 1) {
      // 100ms, then 200ms, then 400ms
      await deps.sleep(100 * 2 ** (attempt - 2));
    }
    try {
      return await operation();
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}
