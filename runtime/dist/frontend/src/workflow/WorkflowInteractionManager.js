"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowInteractionManager = void 0;
/**
 * WorkflowInteractionManager handling user inputs.
 */
class WorkflowInteractionManager {
    lastInteraction;
    handleInteraction(interaction) {
        this.lastInteraction = interaction;
    }
    getLastInteraction() {
        return this.lastInteraction;
    }
}
exports.WorkflowInteractionManager = WorkflowInteractionManager;
