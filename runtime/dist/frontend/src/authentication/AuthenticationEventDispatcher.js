"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationEventDispatcher = void 0;
/**
 * AuthenticationEventDispatcher broadcasting authentication events to subscribers.
 */
class AuthenticationEventDispatcher {
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
exports.AuthenticationEventDispatcher = AuthenticationEventDispatcher;
