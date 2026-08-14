"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowCoordinator = void 0;
/**
 * WorkflowCoordinator orchestrating complete workflow executions.
 */
class WorkflowCoordinator {
    executor;
    constructor(executor) {
        this.executor = executor;
    }
    async coordinate(workflow, steps) {
        return this.executor.executeSequential(steps, workflow.context);
    }
}
exports.WorkflowCoordinator = WorkflowCoordinator;
