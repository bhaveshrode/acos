import { PromptRegistry } from "../prompts/PromptRegistry.js";

export class PromptFactory {
  public createPromptRegistry(): PromptRegistry {
    return new PromptRegistry();
  }
}
