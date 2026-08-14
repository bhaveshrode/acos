"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsObserver = void 0;
const SubscriptionToken_js_1 = require("../state/SubscriptionToken.js");
/**
 * AnalyticsObserver subscribing to lifecycle telemetry events.
 */
class AnalyticsObserver {
    dispatcher;
    constructor(dispatcher) {
        this.dispatcher = dispatcher;
    }
    observe(callback) {
        const unsub = this.dispatcher.subscribe(callback);
        return new SubscriptionToken_js_1.SubscriptionToken(unsub);
    }
}
exports.AnalyticsObserver = AnalyticsObserver;
