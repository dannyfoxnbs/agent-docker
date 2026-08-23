export interface RetryDeps {
  sleep: (ms: number) => Promise<void>;
}

export async function callOnce<T>(
  operation: () => Promise<T>,
): Promise<T> {
  return operation();
}
