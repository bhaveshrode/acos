"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowStep = void 0;
/**
 * WorkflowStep representing executable step components.
 */
class WorkflowStep {
    id;
    name;
    executeFn;
    constructor(id, name, executeFn) {
        this.id = id;
        this.name = name;
        this.executeFn = executeFn;
    }
    async execute(context) {
        return this.executeFn(context);
    }
}
exports.WorkflowStep = WorkflowStep;
