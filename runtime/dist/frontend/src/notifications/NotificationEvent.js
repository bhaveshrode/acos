"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationEvent = void 0;
/**
 * NotificationEvent carrying detail information.
 */
class NotificationEvent {
    notificationId;
    type;
    timestamp;
    metadata;
    constructor(notificationId, type, timestamp = Date.now(), metadata) {
        this.notificationId = notificationId;
        this.type = type;
        this.timestamp = timestamp;
        this.metadata = metadata;
        Object.freeze(this);
    }
}
exports.NotificationEvent = NotificationEvent;
