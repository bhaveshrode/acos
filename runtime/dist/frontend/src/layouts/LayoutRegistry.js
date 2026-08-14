"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LayoutRegistry = void 0;
/**
 * LayoutRegistry storing LayoutDescriptors, preventing modifications after boot.
 */
class LayoutRegistry {
    catalog = new Map();
    isFrozen = false;
    register(descriptor) {
        if (this.isFrozen) {
            throw new Error("LayoutRegistry is frozen and cannot accept further layouts");
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
exports.LayoutRegistry = LayoutRegistry;
