"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketChannelRegistry = void 0;
/**
 * WebSocketChannelRegistry cataloging channels with post-boot freeze features.
 */
class WebSocketChannelRegistry {
    catalog = new Map();
    isFrozen = false;
    register(channel) {
        if (this.isFrozen) {
            throw new Error("WebSocketChannelRegistry is frozen");
        }
        this.catalog.set(channel.id, channel);
    }
    get(id) {
        return this.catalog.get(id);
    }
    freeze() {
        this.isFrozen = true;
    }
}
exports.WebSocketChannelRegistry = WebSocketChannelRegistry;
