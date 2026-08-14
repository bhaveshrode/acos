"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowEventDispatcher = void 0;
/**
 * WorkflowEventDispatcher distributing events to workflow observers.
 */
class WorkflowEventDispatcher {
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
exports.WorkflowEventDispatcher = WorkflowEventDispatcher;
