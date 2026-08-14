"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiter = void 0;
/**
 * RateLimiter keeping client IPs inside request thresholds.
 */
class RateLimiter {
    limits = new Map();
    isAllowed(clientIp, limit) {
        const current = this.limits.get(clientIp) || 0;
        if (current >= limit)
            return false;
        this.limits.set(clientIp, current + 1);
        return true;
    }
}
exports.RateLimiter = RateLimiter;
