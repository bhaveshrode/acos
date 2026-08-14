import { Result } from "../../result/Result.js";

/**
 * Interface representing expression condition evaluators.
 */
export interface IConditionEvaluator {
  /**
   * Evaluates a conditional expression string against variable values.
   */
  evaluate(conditionExpression: string, variables: Record<string, any>): Promise<Result<boolean>>;
}
