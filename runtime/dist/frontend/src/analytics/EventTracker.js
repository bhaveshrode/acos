"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventTracker = void 0;
const AnalyticsEvent_js_1 = require("./AnalyticsEvent.js");
/**
 * EventTracker capturing interactions, workflows, navigation, and timing telemetry.
 */
class EventTracker {
    dispatcher;
    constructor(dispatcher) {
        this.dispatcher = dispatcher;
    }
    trackInteraction(name, payload = {}) {
        const event = new AnalyticsEvent_js_1.AnalyticsEvent(name, "interaction", payload);
        this.dispatcher.dispatch(event);
    }
    trackNavigation(to, payload = {}) {
        const event = new AnalyticsEvent_js_1.AnalyticsEvent(to, "navigation", payload);
        this.dispatcher.dispatch(event);
    }
    trackWorkflow(wfId, action, payload = {}) {
        const event = new AnalyticsEvent_js_1.AnalyticsEvent(`${wfId}:${action}`, "workflow", payload);
        this.dispatcher.dispatch(event);
    }
    trackApiCall(url, method, durationMs) {
        const event = new AnalyticsEvent_js_1.AnalyticsEvent(`${method}:${url}`, "api", { durationMs });
        this.dispatcher.dispatch(event);
    }
    trackPerformance(metricName, value) {
        const event = new AnalyticsEvent_js_1.AnalyticsEvent(metricName, "performance", { value });
        this.dispatcher.dispatch(event);
    }
}
exports.EventTracker = EventTracker;
