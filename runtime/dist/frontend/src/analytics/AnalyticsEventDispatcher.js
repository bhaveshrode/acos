"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsEventDispatcher = void 0;
/**
 * AnalyticsEventDispatcher distributing lifecycle status updates.
 */
class AnalyticsEventDispatcher {
    listeners = new Set();
    dispatch(event) {
        for (const listener of this.listeners) {
            listener(event);
        }
    }
    subscribe(listener) {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }
}
exports.AnalyticsEventDispatcher = AnalyticsEventDispatcher;
