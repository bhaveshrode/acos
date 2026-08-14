/**
 * ReconnectionPolicy defining backoff delays and maximum retry attempts.
 */
export class ReconnectionPolicy {
  constructor(
    public readonly maxAttempts: number = 5,
    public readonly initialDelayMs: number = 1000
  ) {}

  public shouldRetry(attempt: number): boolean {
    return attempt < this.maxAttempts;
  }

  public getDelay(attempt: number): number {
    return this.initialDelayMs * Math.pow(2, attempt);
  }
}
