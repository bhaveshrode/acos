"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsRegistry = void 0;
/**
 * AnalyticsRegistry cataloging providers with post-boot freeze features.
 */
class AnalyticsRegistry {
    catalog = new Map();
    isFrozen = false;
    register(descriptor) {
        if (this.isFrozen) {
            throw new Error("AnalyticsRegistry is frozen and cannot accept further providers");
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
exports.AnalyticsRegistry = AnalyticsRegistry;
