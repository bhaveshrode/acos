import { Result } from "../../result/Result.js";

/**
 * Interface representing a compiler for compiling agent prompts and instructions from templates.
 */
export interface IPromptProvider {
  /**
   * Compiles template strings with replacement context variables.
   * @param templateName Identifier key of the prompt template file or string.
   * @param variables Token replacement dictionary.
   */
  compile(templateName: string, variables: Record<string, any>): Result<string>;
}
