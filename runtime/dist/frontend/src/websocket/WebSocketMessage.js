"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketMessage = void 0;
/**
 * WebSocketMessage wrapping communication payload packets.
 */
class WebSocketMessage {
    type;
    payload;
    channel;
    timestamp;
    constructor(type, payload = null, channel, timestamp = Date.now()) {
        this.type = type;
        this.payload = payload;
        this.channel = channel;
        this.timestamp = timestamp;
        Object.freeze(this);
    }
}
exports.WebSocketMessage = WebSocketMessage;
