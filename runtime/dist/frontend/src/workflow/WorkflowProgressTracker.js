"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowProgressTracker = void 0;
/**
 * WorkflowProgressTracker computing progress percentages from step indices.
 */
class WorkflowProgressTracker {
    getProgressPercent(currentStepIndex, maxSteps) {
        if (maxSteps <= 0)
            return 0;
        return Math.round((currentStepIndex / maxSteps) * 100);
    }
}
exports.WorkflowProgressTracker = WorkflowProgressTracker;
