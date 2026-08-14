import { Result } from "../../result/Result.js";

export interface StepExecutionContext {
  instanceId: string;
  stepId: string;
  variables: Record<string, any>;
}

/**
 * Interface representing a task executor bound to a single workflow step.
 */
export interface IStepExecutor {
  /**
   * Executes a step logic and returns updated context variables.
   */
  executeStep(context: StepExecutionContext): Promise<Result<Record<string, any>>>;
}
