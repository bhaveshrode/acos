import { IRetryPolicy } from "./IRetryPolicy.js";

/**
 * FixedRetryPolicy defining static interval retry parameters.
 */
export class FixedRetryPolicy implements IRetryPolicy {
  constructor(
    private readonly maxRetries: number = 3,
    private readonly delayMs: number = 1000
  ) {}

  public shouldRetry(attempt: number, status?: number): boolean {
    if (attempt >= this.maxRetries) return false;
    return status === undefined || status === 502 || status === 503 || status === 504;
  }

  public getDelayMs(): number {
    return this.delayMs;
  }
}
