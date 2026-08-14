"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageReceiver = void 0;
/**
 * MessageReceiver processing incoming messages and routing to subscribers.
 */
class MessageReceiver {
    subscribers = new Set();
    receive(message) {
        for (const sub of this.subscribers) {
            sub(message);
        }
    }
    subscribe(callback) {
        this.subscribers.add(callback);
        return () => {
            this.subscribers.delete(callback);
        };
    }
}
exports.MessageReceiver = MessageReceiver;
