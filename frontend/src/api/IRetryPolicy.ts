/**
 * IRetryPolicy contract interface defining retries logic.
 */
export interface IRetryPolicy {
  shouldRetry(attempt: number, status?: number, error?: Error): boolean;
  getDelayMs(attempt: number): number;
}
