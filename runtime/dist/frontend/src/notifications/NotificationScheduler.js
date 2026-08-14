"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationScheduler = void 0;
/**
 * NotificationScheduler handling delayed notifications runs.
 */
class NotificationScheduler {
    dispatcher;
    constructor(dispatcher) {
        this.dispatcher = dispatcher;
    }
    schedule(notification, delayMs, priority = 0) {
        setTimeout(() => {
            this.dispatcher.dispatch(notification, priority);
        }, delayMs);
    }
}
exports.NotificationScheduler = NotificationScheduler;
