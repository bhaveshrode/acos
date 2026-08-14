"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowCheckpointManager = void 0;
/**
 * WorkflowCheckpointManager logging checkpoints snapshots.
 */
class WorkflowCheckpointManager {
    checkpoints = new Map();
    saveCheckpoint(workflowId, stateSnapshot) {
        this.checkpoints.set(workflowId, stateSnapshot);
    }
    getCheckpoint(workflowId) {
        return this.checkpoints.get(workflowId);
    }
    clearCheckpoint(workflowId) {
        this.checkpoints.delete(workflowId);
    }
}
exports.WorkflowCheckpointManager = WorkflowCheckpointManager;
