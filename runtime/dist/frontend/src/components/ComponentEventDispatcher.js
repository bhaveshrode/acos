"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentEventDispatcher = void 0;
/**
 * ComponentEventDispatcher managing callback listeners subscriptions.
 */
class ComponentEventDispatcher {
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
exports.ComponentEventDispatcher = ComponentEventDispatcher;
