"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationResolver = void 0;
/**
 * NotificationResolver resolving registered descriptors by identifier.
 */
class NotificationResolver {
    registry;
    constructor(registry) {
        this.registry = registry;
    }
    resolve(id) {
        const descriptor = this.registry.get(id);
        if (!descriptor) {
            throw new Error(`Notification schema with identifier ${id} is not registered`);
        }
        return descriptor;
    }
}
exports.NotificationResolver = NotificationResolver;
