import { PromptRegistry } from "../prompts/PromptRegistry.js";
export class PromptFactory {
    createPromptRegistry() {
        return new PromptRegistry();
    }
}
