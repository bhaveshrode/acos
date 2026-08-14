"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowLifecycleEvent = void 0;
/**
 * WorkflowLifecycleEvent capturing runtime execution history details.
 */
class WorkflowLifecycleEvent {
    workflowId;
    type;
    timestamp;
    metadata;
    constructor(workflowId, type, timestamp = Date.now(), metadata) {
        this.workflowId = workflowId;
        this.type = type;
        this.timestamp = timestamp;
        this.metadata = metadata;
        Object.freeze(this);
    }
}
exports.WorkflowLifecycleEvent = WorkflowLifecycleEvent;
