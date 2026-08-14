"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowDescriptor = void 0;
/**
 * WorkflowDescriptor pairing workflow constructors with step metadata definitions.
 */
class WorkflowDescriptor {
    metadata;
    workflowClass;
    stepDefinitions;
    constructor(metadata, workflowClass, stepDefinitions = []) {
        this.metadata = metadata;
        this.workflowClass = workflowClass;
        this.stepDefinitions = stepDefinitions;
        Object.freeze(this.stepDefinitions);
        Object.freeze(this);
    }
}
exports.WorkflowDescriptor = WorkflowDescriptor;
