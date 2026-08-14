"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowExecutor = void 0;
/**
 * WorkflowExecutor coordinating sequential and parallel execution outputs.
 */
class WorkflowExecutor {
    async executeSequential(steps, context) {
        const results = [];
        for (const step of steps) {
            results.push(await step.execute(context));
        }
        return results;
    }
}
exports.WorkflowExecutor = WorkflowExecutor;
