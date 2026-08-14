"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsProcessor = void 0;
const AnalyticsEvent_js_1 = require("./AnalyticsEvent.js");
/**
 * AnalyticsProcessor enriching telemetry data payloads.
 */
class AnalyticsProcessor {
    process(event) {
        const enrichedPayload = {
            ...event.payload,
            processedAt: Date.now()
        };
        return new AnalyticsEvent_js_1.AnalyticsEvent(event.name, event.category, enrichedPayload, event.timestamp);
    }
}
exports.AnalyticsProcessor = AnalyticsProcessor;
