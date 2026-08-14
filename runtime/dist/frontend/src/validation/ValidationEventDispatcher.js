"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationEventDispatcher = void 0;
/**
 * ValidationEventDispatcher publishing events to validation observers.
 */
class ValidationEventDispatcher {
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
exports.ValidationEventDispatcher = ValidationEventDispatcher;
