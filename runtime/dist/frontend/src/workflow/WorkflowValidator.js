"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowValidator = void 0;
/**
 * WorkflowValidator evaluating workflow validation rules.
 */
class WorkflowValidator {
    validate(workflow) {
        const errors = [];
        if (!workflow.context.metadata.id) {
            errors.push("Workflow ID is required");
        }
        return errors;
    }
}
exports.WorkflowValidator = WorkflowValidator;
