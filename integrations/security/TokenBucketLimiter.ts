import { IRateLimiter } from "./IRateLimiter.js";

/**
 * TokenBucketLimiter tracking rate checks with token refill algorithms.
 */
export class TokenBucketLimiter implements IRateLimiter {
  private tokens: number;
  private lastRefill: number;

  constructor(
    public readonly maxTokens: number = 10,
    public readonly refillRatePerSec: number = 1
  ) {
    this.tokens = maxTokens;
    this.lastRefill = Date.now();
  }

  public allowRequest(): boolean {
    this.refill();
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }
    return false;
  }

  private refill(): void {
    const now = Date.now();
    const delta = (now - this.lastRefill) / 1000;
    const amount = delta * this.refillRatePerSec;
    if (amount > 0) {
      this.tokens = Math.min(this.maxTokens, this.tokens + amount);
      this.lastRefill = now;
    }
  }
}
