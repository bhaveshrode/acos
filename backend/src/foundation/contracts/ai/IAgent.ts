import { Result } from "../../result/Result.js";

export interface AgentExecutionRequest {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
}

export interface AgentExecutionResult {
  responseText: string;
  tokensUsed?: number;
}

/**
 * Interface representing a core generative AI model executor.
 */
export interface IAgent {
  /**
   * Executes a prompt request and returns structured text or tokens metadata.
   */
  execute(request: AgentExecutionRequest): Promise<Result<AgentExecutionResult>>;
}
