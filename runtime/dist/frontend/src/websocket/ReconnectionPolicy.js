"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReconnectionPolicy = void 0;
/**
 * ReconnectionPolicy defining backoff delays and maximum retry attempts.
 */
class ReconnectionPolicy {
    maxAttempts;
    initialDelayMs;
    constructor(maxAttempts = 5, initialDelayMs = 1000) {
        this.maxAttempts = maxAttempts;
        this.initialDelayMs = initialDelayMs;
    }
    shouldRetry(attempt) {
        return attempt < this.maxAttempts;
    }
    getDelay(attempt) {
        return this.initialDelayMs * Math.pow(2, attempt);
    }
}
exports.ReconnectionPolicy = ReconnectionPolicy;
