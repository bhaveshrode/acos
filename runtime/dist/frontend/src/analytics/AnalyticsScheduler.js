"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsScheduler = void 0;
/**
 * AnalyticsScheduler triggering periodic telemetry flushes.
 */
class AnalyticsScheduler {
    intervalId;
    startFlushLoop(flushFn, intervalMs) {
        this.intervalId = setInterval(flushFn, intervalMs);
    }
    stopFlushLoop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }
}
exports.AnalyticsScheduler = AnalyticsScheduler;
