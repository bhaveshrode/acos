"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageSynchronizer = void 0;
/**
 * MessageSynchronizer filtering duplicate frames to sync states.
 */
class MessageSynchronizer {
    processedIds = new Set();
    synchronize(message) {
        const msgId = (message.payload && message.payload.id) || `${message.type}:${message.timestamp}`;
        if (this.processedIds.has(msgId)) {
            return false;
        }
        this.processedIds.add(msgId);
        return true;
    }
}
exports.MessageSynchronizer = MessageSynchronizer;
