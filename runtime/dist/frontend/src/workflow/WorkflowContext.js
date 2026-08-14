"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowContext = void 0;
/**
 * WorkflowContext carrying runtime parameter variables.
 */
class WorkflowContext {
    metadata;
    variables;
    executionMetadata;
    userContext;
    runtimeState;
    constructor(metadata, variables = {}, executionMetadata = {}, userContext = null, runtimeState = null) {
        this.metadata = metadata;
        this.variables = variables;
        this.executionMetadata = executionMetadata;
        this.userContext = userContext;
        this.runtimeState = runtimeState;
        Object.freeze(this.variables);
        Object.freeze(this.executionMetadata);
        Object.freeze(this);
    }
}
exports.WorkflowContext = WorkflowContext;
