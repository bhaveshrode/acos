"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateRegistry = void 0;
/**
 * StateRegistry cataloging all registered feature stores, preventing mutations after boot.
 */
class StateRegistry {
    stores = new Map();
    isFrozen = false;
    register(name, store) {
        if (this.isFrozen) {
            throw new Error("StateRegistry is frozen and cannot accept further stores");
        }
        this.stores.set(name, store);
    }
    getStore(name) {
        return this.stores.get(name);
    }
    freeze() {
        this.isFrozen = true;
    }
    clear() {
        if (this.isFrozen) {
            throw new Error("StateRegistry is frozen and cannot be cleared");
        }
        this.stores.clear();
    }
}
exports.StateRegistry = StateRegistry;
