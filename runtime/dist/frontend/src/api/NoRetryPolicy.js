"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoRetryPolicy = void 0;
/**
 * NoRetryPolicy preventing communication retry attempts.
 */
class NoRetryPolicy {
    shouldRetry() {
        return false;
    }
    getDelayMs() {
        return 0;
    }
}
exports.NoRetryPolicy = NoRetryPolicy;
