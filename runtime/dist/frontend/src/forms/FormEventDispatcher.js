"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormEventDispatcher = void 0;
/**
 * FormEventDispatcher publishing FormLifecycleEvents to subscribers.
 */
class FormEventDispatcher {
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
exports.FormEventDispatcher = FormEventDispatcher;
