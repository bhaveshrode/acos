"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationDescriptor = void 0;
/**
 * NotificationDescriptor encapsulating class constructors, metadata, and templates.
 */
class NotificationDescriptor {
    metadata;
    notificationClass;
    template;
    constructor(metadata, notificationClass, template) {
        this.metadata = metadata;
        this.notificationClass = notificationClass;
        this.template = template;
        Object.freeze(this);
    }
}
exports.NotificationDescriptor = NotificationDescriptor;
