"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageEventDispatcher = void 0;
/**
 * PageEventDispatcher distributing PageLifecycleEvents to subscribers.
 */
class PageEventDispatcher {
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
exports.PageEventDispatcher = PageEventDispatcher;
