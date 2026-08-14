"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenBucketLimiter = void 0;
/**
 * TokenBucketLimiter tracking rate checks with token refill algorithms.
 */
class TokenBucketLimiter {
    maxTokens;
    refillRatePerSec;
    tokens;
    lastRefill;
    constructor(maxTokens = 10, refillRatePerSec = 1) {
        this.maxTokens = maxTokens;
        this.refillRatePerSec = refillRatePerSec;
        this.tokens = maxTokens;
        this.lastRefill = Date.now();
    }
    allowRequest() {
        this.refill();
        if (this.tokens >= 1) {
            this.tokens -= 1;
            return true;
        }
        return false;
    }
    refill() {
        const now = Date.now();
        const delta = (now - this.lastRefill) / 1000;
        const amount = delta * this.refillRatePerSec;
        if (amount > 0) {
            this.tokens = Math.min(this.maxTokens, this.tokens + amount);
            this.lastRefill = now;
        }
    }
}
exports.TokenBucketLimiter = TokenBucketLimiter;
