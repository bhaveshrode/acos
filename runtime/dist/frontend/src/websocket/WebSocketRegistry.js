"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketRegistry = void 0;
/**
 * WebSocketRegistry cataloging sockets with post-boot freeze features.
 */
class WebSocketRegistry {
    catalog = new Map();
    isFrozen = false;
    register(descriptor) {
        if (this.isFrozen) {
            throw new Error("WebSocketRegistry is frozen and cannot accept further clients");
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
exports.WebSocketRegistry = WebSocketRegistry;
