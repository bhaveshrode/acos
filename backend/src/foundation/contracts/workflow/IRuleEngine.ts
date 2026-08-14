import { Result } from "../../result/Result.js";

export interface RuleDefinition {
  ruleId: string;
  name: string;
  conditions: Record<string, any>;
  actions: Record<string, any>;
}

/**
 * Interface representing a business rule processor.
 */
export interface IRuleEngine {
  /**
   * Evaluates facts against a collection of rules, returning updated outcomes.
   */
  evaluateRules(
    facts: Record<string, any>,
    rules: RuleDefinition[]
  ): Promise<Result<Record<string, any>>>;
}
