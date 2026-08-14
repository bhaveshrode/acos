"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormRegistry = void 0;
/**
 * FormRegistry cataloging registered FormDescriptors.
 */
class FormRegistry {
    catalog = new Map();
    isFrozen = false;
    register(descriptor) {
        if (this.isFrozen) {
            throw new Error("FormRegistry is frozen and cannot accept further forms");
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
exports.FormRegistry = FormRegistry;
