import { IRetryPolicy } from "./IRetryPolicy.js";

/**
 * ExponentialBackoffPolicy defining progressive delays interval parameters.
 */
export class ExponentialBackoffPolicy implements IRetryPolicy {
  constructor(
    private readonly maxRetries: number = 3,
    private readonly baseDelayMs: number = 500
  ) {}

  public shouldRetry(attempt: number, status?: number): boolean {
    if (attempt >= this.maxRetries) return false;
    return status === undefined || status === 502 || status === 503 || status === 504;
  }

  public getDelayMs(attempt: number): number {
    return this.baseDelayMs * Math.pow(2, attempt);
  }
}
