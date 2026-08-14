"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationQueue = void 0;
/**
 * NotificationQueue prioritizing alert items.
 */
class NotificationQueue {
    queue = [];
    enqueue(notification, priority = 0) {
        this.queue.push({ notification, priority });
        this.queue.sort((a, b) => b.priority - a.priority);
    }
    dequeue() {
        const item = this.queue.shift();
        return item?.notification;
    }
    size() {
        return this.queue.length;
    }
}
exports.NotificationQueue = NotificationQueue;
