import { AuthorizationContext } from "./AuthorizationContext.js";
import { AuthorizationPolicy } from "./AuthorizationPolicy.js";
import { AuthorizationHandler } from "./AuthorizationHandler.js";

/**
 * AuthorizationEvaluator coordinating requirement evaluations.
 */
export class AuthorizationEvaluator {
  constructor(private readonly handlers: AuthorizationHandler[]) {}

  /**
   * Asserts whether all requirements of a policy pass.
   */
  public async evaluate(policy: AuthorizationPolicy, context: AuthorizationContext): Promise<boolean> {
    for (const req of policy.requirements) {
      const handler = this.handlers.find((h) => h.canHandle(req));
      if (!handler) {
        return false;
      }
      const success = await handler.handle(req, context);
      if (!success) {
        return false;
      }
    }
    return true;
  }
}
