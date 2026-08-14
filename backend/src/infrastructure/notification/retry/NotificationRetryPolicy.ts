import { Result } from "../../../foundation/result/Result.js";

/**
 * Retry execution runner handling transient network or carrier delivery errors.
 */
export class NotificationRetryPolicy {
  /**
   * Executes a sending operation with fixed delays if failures occur.
   */
  public static async execute<T>(
    operation: () => Promise<Result<T>>,
    maxAttempts: number = 3,
    delayMs: number = 100
  ): Promise<Result<T>> {
    let lastError: any;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const result = await operation();
      if (result.isSuccess) {
        return result;
      }
      lastError = result.error;
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
    return Result.fail(lastError);
  }
}
