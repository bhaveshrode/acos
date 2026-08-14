"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowTimeline = void 0;
/**
 * WorkflowTimeline logging workflow execution steps chronologically.
 */
class WorkflowTimeline {
    historyNodes = [];
    addNode(stepId) {
        this.historyNodes.push(stepId);
    }
    getNodes() {
        return [...this.historyNodes];
    }
}
exports.WorkflowTimeline = WorkflowTimeline;
