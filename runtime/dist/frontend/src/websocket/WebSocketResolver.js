"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketResolver = void 0;
/**
 * WebSocketResolver resolving client constructors by catalog ID.
 */
class WebSocketResolver {
    registry;
    constructor(registry) {
        this.registry = registry;
    }
    resolve(id) {
        const descriptor = this.registry.get(id);
        if (!descriptor) {
            throw new Error(`WebSocket client with identifier ${id} is not registered`);
        }
        return descriptor;
    }
}
exports.WebSocketResolver = WebSocketResolver;
