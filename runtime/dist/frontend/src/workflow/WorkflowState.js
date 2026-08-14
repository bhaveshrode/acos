"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowState = void 0;
/**
 * WorkflowState enum capturing workflow lifecycles.
 */
var WorkflowState;
(function (WorkflowState) {
    WorkflowState["Created"] = "Created";
    WorkflowState["Running"] = "Running";
    WorkflowState["Suspended"] = "Suspended";
    WorkflowState["Completed"] = "Completed";
    WorkflowState["Cancelled"] = "Cancelled";
    WorkflowState["Failed"] = "Failed";
})(WorkflowState || (exports.WorkflowState = WorkflowState = {}));
