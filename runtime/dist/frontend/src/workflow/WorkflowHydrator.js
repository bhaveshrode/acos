"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowHydrator = void 0;
/**
 * WorkflowHydrator restoring persisted execution contexts back onto workflows.
 */
class WorkflowHydrator {
    checkpointManager;
    constructor(checkpointManager) {
        this.checkpointManager = checkpointManager;
    }
    hydrate(workflow) {
        const snapshot = this.checkpointManager.getCheckpoint(workflow.context.metadata.id);
        if (snapshot) {
            if (typeof workflow.hydrateState === "function") {
                workflow.hydrateState(snapshot);
            }
            return true;
        }
        return false;
    }
}
exports.WorkflowHydrator = WorkflowHydrator;
