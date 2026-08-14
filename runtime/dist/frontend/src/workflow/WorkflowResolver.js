"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowResolver = void 0;
/**
 * WorkflowResolver resolving registered descriptors by identifier.
 */
class WorkflowResolver {
    registry;
    constructor(registry) {
        this.registry = registry;
    }
    resolve(id) {
        const descriptor = this.registry.get(id);
        if (!descriptor) {
            throw new Error(`Workflow with identifier ${id} is not registered`);
        }
        return descriptor;
    }
}
exports.WorkflowResolver = WorkflowResolver;
