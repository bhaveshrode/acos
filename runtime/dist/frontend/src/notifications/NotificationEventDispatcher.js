"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationEventDispatcher = void 0;
/**
 * NotificationEventDispatcher publishing events to observers.
 */
class NotificationEventDispatcher {
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
exports.NotificationEventDispatcher = NotificationEventDispatcher;
