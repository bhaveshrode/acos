"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageBuffer = void 0;
/**
 * MessageBuffer storing outgoing frames while client connection is offline.
 */
class MessageBuffer {
    buffer = [];
    push(message) {
        this.buffer.push(message);
    }
    getBuffered() {
        return [...this.buffer];
    }
    clear() {
        this.buffer = [];
    }
    size() {
        return this.buffer.length;
    }
}
exports.MessageBuffer = MessageBuffer;
