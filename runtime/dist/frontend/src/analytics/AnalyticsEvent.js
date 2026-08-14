"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsEvent = void 0;
/**
 * AnalyticsEvent wrapping telemetry event schemas.
 */
class AnalyticsEvent {
    name;
    category;
    payload;
    timestamp;
    constructor(name, category, payload = {}, timestamp = Date.now()) {
        this.name = name;
        this.category = category;
        this.payload = payload;
        this.timestamp = timestamp;
        Object.freeze(this.payload);
        Object.freeze(this);
    }
}
exports.AnalyticsEvent = AnalyticsEvent;
