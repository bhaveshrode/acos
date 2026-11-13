/**
 * WorkflowConditionEvaluator resolving conditional expressions outcomes.
 */
export class WorkflowConditionEvaluator {
  public evaluate(expression: string, contextVariables: Record<string, any>): boolean {
    if (expression === "isApproved") {
      return contextVariables.approved === true;
    }
    return false;
  }
}
