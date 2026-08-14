import { Result } from "../../result/Result.js";

export interface ToolDefinition {
  name: string;
  description: string;
  parametersSchema: Record<string, any>;
}

/**
 * Interface representing a tool capability that can be bound and executed by an AI agent.
 */
export interface ITool {
  /**
   * Defines the tool schema and parameters, structured for LLM functions specs.
   */
  readonly definition: ToolDefinition;

  /**
   * Executes the tool function logic.
   * @param args The input arguments parsed by the LLM.
   */
  execute(args: Record<string, any>): Promise<Result<Record<string, any>>>;
}
