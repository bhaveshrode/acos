"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageRegistry = void 0;
/**
 * PageRegistry storing page descriptor instances.
 */
class PageRegistry {
    catalog = new Map();
    isFrozen = false;
    register(descriptor) {
        if (this.isFrozen) {
            throw new Error("PageRegistry is frozen and cannot accept further pages");
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
exports.PageRegistry = PageRegistry;
