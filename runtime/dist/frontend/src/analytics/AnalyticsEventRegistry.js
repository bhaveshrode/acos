"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsEventRegistry = void 0;
/**
 * AnalyticsEventRegistry cataloging events with post-boot freeze features.
 */
class AnalyticsEventRegistry {
    catalog = new Set();
    isFrozen = false;
    register(eventName) {
        if (this.isFrozen) {
            throw new Error("AnalyticsEventRegistry is frozen");
        }
        this.catalog.add(eventName);
    }
    has(eventName) {
        return this.catalog.has(eventName);
    }
    freeze() {
        this.isFrozen = true;
    }
}
exports.AnalyticsEventRegistry = AnalyticsEventRegistry;
