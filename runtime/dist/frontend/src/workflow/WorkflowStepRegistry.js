"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowStepRegistry = void 0;
/**
 * WorkflowStepRegistry storing reusable steps with freezing capability.
 */
class WorkflowStepRegistry {
    catalog = new Map();
    isFrozen = false;
    register(step) {
        if (this.isFrozen) {
            throw new Error("WorkflowStepRegistry is frozen");
        }
        this.catalog.set(step.id, step);
    }
    get(id) {
        return this.catalog.get(id);
    }
    freeze() {
        this.isFrozen = true;
    }
}
exports.WorkflowStepRegistry = WorkflowStepRegistry;
