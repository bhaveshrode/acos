"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketLifecycleEvent = void 0;
/**
 * WebSocketLifecycleEvent tracking connection states changes.
 */
class WebSocketLifecycleEvent {
    clientId;
    type;
    timestamp;
    metadata;
    constructor(clientId, type, timestamp = Date.now(), metadata) {
        this.clientId = clientId;
        this.type = type;
        this.timestamp = timestamp;
        this.metadata = metadata;
        Object.freeze(this);
    }
}
exports.WebSocketLifecycleEvent = WebSocketLifecycleEvent;
