"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowRegistry = void 0;
/**
 * WorkflowRegistry cataloging workflows with freezing capabilities.
 */
class WorkflowRegistry {
    catalog = new Map();
    isFrozen = false;
    register(descriptor) {
        if (this.isFrozen) {
            throw new Error("WorkflowRegistry is frozen and cannot accept further workflows");
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
exports.WorkflowRegistry = WorkflowRegistry;
