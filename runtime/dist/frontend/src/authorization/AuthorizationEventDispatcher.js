"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorizationEventDispatcher = void 0;
/**
 * AuthorizationEventDispatcher publishing events to registered listeners.
 */
class AuthorizationEventDispatcher {
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
exports.AuthorizationEventDispatcher = AuthorizationEventDispatcher;
