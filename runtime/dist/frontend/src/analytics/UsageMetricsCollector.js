"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsageMetricsCollector = void 0;
/**
 * UsageMetricsCollector aggregating click and interaction counts.
 */
class UsageMetricsCollector {
    clickCount = 0;
    recordClick() {
        this.clickCount++;
    }
    getClickCount() {
        return this.clickCount;
    }
}
exports.UsageMetricsCollector = UsageMetricsCollector;
