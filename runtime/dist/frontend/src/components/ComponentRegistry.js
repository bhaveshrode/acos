"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentRegistry = void 0;
/**
 * ComponentRegistry cataloging ComponentDescriptors with freezing capability.
 */
class ComponentRegistry {
    catalog = new Map();
    isFrozen = false;
    register(descriptor) {
        if (this.isFrozen) {
            throw new Error("ComponentRegistry is frozen and cannot accept further components");
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
exports.ComponentRegistry = ComponentRegistry;
