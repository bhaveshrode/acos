"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRegistry = void 0;
/**
 * NotificationRegistry cataloging registered descriptors.
 */
class NotificationRegistry {
    catalog = new Map();
    isFrozen = false;
    register(descriptor) {
        if (this.isFrozen) {
            throw new Error("NotificationRegistry is frozen and cannot accept further notifications");
        }
        this.catalog.set(descriptor.metadata.id, descriptor);
    }
    get(id) {
        return this.catalog.get(id);
    }
    freeze() {
        this.isFrozen = true;
    }
}
exports.NotificationRegistry = NotificationRegistry;
