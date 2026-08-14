"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationContainer = void 0;
/**
 * NotificationContainer hosting visible notifications collections.
 */
class NotificationContainer {
    notifications = [];
    add(notification) {
        this.notifications.push(notification);
    }
    remove(notification) {
        const index = this.notifications.indexOf(notification);
        if (index > -1) {
            this.notifications.splice(index, 1);
        }
    }
    getNotifications() {
        return [...this.notifications];
    }
}
exports.NotificationContainer = NotificationContainer;
