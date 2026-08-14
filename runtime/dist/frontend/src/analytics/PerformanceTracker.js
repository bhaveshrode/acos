"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceTracker = void 0;
/**
 * PerformanceTracker recording rendering durations and network latencies.
 */
class PerformanceTracker {
    metrics = new Map();
    recordMetric(metricName, durationMs) {
        this.metrics.set(metricName, durationMs);
    }
    getMetric(metricName) {
        return this.metrics.get(metricName);
    }
}
exports.PerformanceTracker = PerformanceTracker;
