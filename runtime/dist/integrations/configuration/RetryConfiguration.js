"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetryConfiguration = void 0;
/**
 * RetryConfiguration containing max retries and backoff limits.
 */
class RetryConfiguration {
    maxRetries;
    backoffMs;
    constructor(maxRetries = 3, backoffMs = 500) {
        this.maxRetries = maxRetries;
        this.backoffMs = backoffMs;
        Object.freeze(this);
    }
}
exports.RetryConfiguration = RetryConfiguration;
