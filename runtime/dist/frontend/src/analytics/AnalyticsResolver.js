"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsResolver = void 0;
/**
 * AnalyticsResolver resolving registered provider descriptors by ID.
 */
class AnalyticsResolver {
    registry;
    constructor(registry) {
        this.registry = registry;
    }
    resolve(id) {
        const descriptor = this.registry.get(id);
        if (!descriptor) {
            throw new Error(`Analytics provider with identifier ${id} is not registered`);
        }
        return descriptor;
    }
}
exports.AnalyticsResolver = AnalyticsResolver;
