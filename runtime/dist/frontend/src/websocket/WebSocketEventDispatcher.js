"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketEventDispatcher = void 0;
/**
 * WebSocketEventDispatcher distributing events to websocket observers.
 */
class WebSocketEventDispatcher {
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
exports.WebSocketEventDispatcher = WebSocketEventDispatcher;
