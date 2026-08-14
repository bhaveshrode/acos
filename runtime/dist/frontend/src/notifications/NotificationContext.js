"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationContext = void 0;
/**
 * NotificationContext grouping metadata collections and channel listings.
 */
class NotificationContext {
    metadata;
    activeNotifications;
    displayQueue;
    channels;
    constructor(metadata, activeNotifications = [], displayQueue = [], channels = []) {
        this.metadata = metadata;
        this.activeNotifications = activeNotifications;
        this.displayQueue = displayQueue;
        this.channels = channels;
        Object.freeze(this.activeNotifications);
        Object.freeze(this.displayQueue);
        Object.freeze(this.channels);
        Object.freeze(this);
    }
}
exports.NotificationContext = NotificationContext;
