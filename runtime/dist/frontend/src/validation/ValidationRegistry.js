"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationRegistry = void 0;
/**
 * ValidationRegistry cataloging validation descriptors with freezing capabilities.
 */
class ValidationRegistry {
    catalog = new Map();
    isFrozen = false;
    register(descriptor) {
        if (this.isFrozen) {
            throw new Error("ValidationRegistry is frozen and cannot accept further validation schemas");
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
exports.ValidationRegistry = ValidationRegistry;
