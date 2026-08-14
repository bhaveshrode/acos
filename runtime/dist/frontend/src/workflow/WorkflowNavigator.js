"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowNavigator = void 0;
/**
 * WorkflowNavigator navigating active step indices.
 */
class WorkflowNavigator {
    maxSteps;
    currentStepIndex = 0;
    constructor(maxSteps) {
        this.maxSteps = maxSteps;
    }
    next() {
        if (this.currentStepIndex < this.maxSteps - 1) {
            this.currentStepIndex++;
        }
        return this.currentStepIndex;
    }
    prev() {
        if (this.currentStepIndex > 0) {
            this.currentStepIndex--;
        }
        return this.currentStepIndex;
    }
    getIndex() {
        return this.currentStepIndex;
    }
    reset() {
        this.currentStepIndex = 0;
    }
}
exports.WorkflowNavigator = WorkflowNavigator;
