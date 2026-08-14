"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LayoutEventDispatcher = void 0;
/**
 * LayoutEventDispatcher publishing events to subscribers.
 */
class LayoutEventDispatcher {
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
exports.LayoutEventDispatcher = LayoutEventDispatcher;
