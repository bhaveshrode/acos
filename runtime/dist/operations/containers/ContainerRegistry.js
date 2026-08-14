"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContainerRegistry = void 0;
/**
 * ContainerRegistry cataloging containers with freezing capability.
 */
class ContainerRegistry {
    catalog = new Map();
    isFrozen = false;
    register(descriptor) {
        if (this.isFrozen) {
            throw new Error("ContainerRegistry is frozen");
        }
        this.catalog.set(descriptor.id, descriptor);
    }
    get(id) {
        return this.catalog.get(id);
    }
    freeze() {
        this.isFrozen = true;
    }
}
exports.ContainerRegistry = ContainerRegistry;
