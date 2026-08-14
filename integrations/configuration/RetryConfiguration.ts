/**
 * RetryConfiguration containing max retries and backoff limits.
 */
export class RetryConfiguration {
  constructor(
    public readonly maxRetries: number = 3,
    public readonly backoffMs: number = 500
  ) {
    Object.freeze(this);
  }
}
