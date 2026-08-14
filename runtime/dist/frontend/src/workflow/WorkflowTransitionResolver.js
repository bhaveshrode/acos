"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowTransitionResolver = void 0;
/**
 * WorkflowTransitionResolver evaluating next step transitions.
 */
class WorkflowTransitionResolver {
    resolveNextStep(currentStepIndex, outcome) {
        if (outcome === "approve") {
            return currentStepIndex + 2;
        }
        return currentStepIndex + 1;
    }
}
exports.WorkflowTransitionResolver = WorkflowTransitionResolver;
