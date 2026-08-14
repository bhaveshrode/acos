/**
 * Utility containing helper methods for asynchronous execution, timing, and backoff retries.
 */
export class AsyncUtils {
  /**
   * Returns a promise that resolves after the specified duration in milliseconds.
   */
  public static delay(ms: number): Promise<void> {
    if (ms <= 0) return Promise.resolve();
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Retries an asynchronous operation up to maxAttempts times, supporting delays or exponential backoff.
   * Useful for database reconnects, HTTP retries, or external queue polling.
   * @param operation The asynchronous callback function to execute.
   * @param maxAttempts Maximum attempts before rejecting.
   * @param delayMs Delay duration in milliseconds between attempts.
   * @param exponentialBackoff If true, doubles the delay duration on each successive attempt.
   */
  public static async retry<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3,
    delayMs: number = 100,
    exponentialBackoff: boolean = false
  ): Promise<T> {
    let attempts = 0;
    let currentDelay = delayMs;

    while (attempts < maxAttempts) {
      try {
        attempts++;
        return await operation();
      } catch (err) {
        if (attempts >= maxAttempts) {
          throw err;
        }
        await AsyncUtils.delay(currentDelay);
        if (exponentialBackoff) {
          currentDelay *= 2;
        }
      }
    }
    throw new Error("Retry logic failed due to unexpected flow.");
  }
}
