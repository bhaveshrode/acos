import { IRetryPolicy } from "./IRetryPolicy.js";

/**
 * NoRetryPolicy preventing communication retry attempts.
 */
export class NoRetryPolicy implements IRetryPolicy {
  public shouldRetry(): boolean {
    return false;
  }

  public getDelayMs(): number {
    return 0;
  }
}
