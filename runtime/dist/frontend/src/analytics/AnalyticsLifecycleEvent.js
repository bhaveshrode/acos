"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsLifecycleEvent = void 0;
/**
 * AnalyticsLifecycleEvent capturing provider changes.
 */
class AnalyticsLifecycleEvent {
    providerId;
    type;
    timestamp;
    metadata;
    constructor(providerId, type, timestamp = Date.now(), metadata) {
        this.providerId = providerId;
        this.type = type;
        this.timestamp = timestamp;
        this.metadata = metadata;
        Object.freeze(this);
    }
}
exports.AnalyticsLifecycleEvent = AnalyticsLifecycleEvent;
