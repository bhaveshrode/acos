"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowConditionEvaluator = void 0;
/**
 * WorkflowConditionEvaluator resolving conditional expressions outcomes.
 */
class WorkflowConditionEvaluator {
    evaluate(expression, contextVariables) {
        if (expression === "isApproved") {
            return contextVariables.approved === true;
        }
        return false;
    }
}
exports.WorkflowConditionEvaluator = WorkflowConditionEvaluator;
