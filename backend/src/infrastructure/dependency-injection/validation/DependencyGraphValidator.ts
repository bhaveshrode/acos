import { ServiceContainer } from "../container/ServiceContainer.js";

/**
 * Validates the registered dependencies in the container graph to detect missing services or circular chains.
 */
export class DependencyGraphValidator {
  /**
   * Performs validation by executing a dry-run resolution of all registered tokens.
   * Propagates resolution circularity or missing service exceptions if encountered.
   */
  public static validate(container: ServiceContainer): void {
    const tokens = container.getRegisteredTokens();
    for (const token of tokens) {
      try {
        container.resolve(token);
      } catch (err: any) {
        if (err.message.includes("Circular dependency")) {
          throw err;
        }
        throw new Error(
          `Dependency graph validation failed for token '${token}': ${err.message}`
        );
      }
    }
  }
}
