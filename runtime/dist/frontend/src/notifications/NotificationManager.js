"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationManager = void 0;
const NotificationState_js_1 = require("./NotificationState.js");
/**
 * NotificationManager coordinating visible active notifications list updates.
 */
class NotificationManager {
    queue;
    active = new Set();
    constructor(queue) {
        this.queue = queue;
    }
    processQueue() {
        const next = this.queue.dequeue();
        if (next) {
            next.state = NotificationState_js_1.NotificationState.Displaying;
            this.active.add(next);
        }
        return next;
    }
    dismiss(notification) {
        notification.dismiss();
        this.active.delete(notification);
    }
    getActiveNotifications() {
        return Array.from(this.active);
    }
}
exports.NotificationManager = NotificationManager;
