"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationDispatcher = void 0;
/**
 * NotificationDispatcher routing and dispatching notification objects.
 */
class NotificationDispatcher {
    queue;
    constructor(queue) {
        this.queue = queue;
    }
    dispatch(notification, priority = 0) {
        this.queue.enqueue(notification, priority);
    }
}
exports.NotificationDispatcher = NotificationDispatcher;
