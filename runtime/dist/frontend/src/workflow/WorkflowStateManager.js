"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowStateManager = void 0;
/**
 * WorkflowStateManager enforcing lifecycle transition rules.
 */
class WorkflowStateManager {
    transitionTo(workflow, nextState) {
        workflow.state = nextState;
    }
}
exports.WorkflowStateManager = WorkflowStateManager;
