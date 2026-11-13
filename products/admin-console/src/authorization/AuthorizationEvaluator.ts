import { IAuthorizationEvaluator } from "./IAuthorizationEvaluator.js";
import { IAuthorizationHandler } from "./IAuthorizationHandler.js";
import { AuthorizationContext } from "./AuthorizationContext.js";
import { CompiledPolicy } from "./CompiledPolicy.js";
import { AuthorizationDecision } from "./AuthorizationDecision.js";

/**
 * AuthorizationEvaluator coordinating handlers checks against compiled policies requirements.
 */
export class AuthorizationEvaluator implements IAuthorizationEvaluator {
  constructor(private readonly handlers: IAuthorizationHandler[]) {}

  public async evaluate(
    context: AuthorizationContext,
    policy: CompiledPolicy
  ): Promise<AuthorizationDecision> {
    const failedRequirements = [];

    for (const requirement of policy.requirements) {
      const handler = this.handlers.find((h) => h.canHandle(requirement));
      if (!handler) {
        return AuthorizationDecision.deny(
          policy.name,
          [requirement],
          `No registered authorization handler found for requirement type ${requirement.type}`
        );
      }
      const succeeded = await handler.evaluate(context, requirement);
      if (!succeeded) {
        failedRequirements.push(requirement);
      }
    }

    if (failedRequirements.length > 0) {
      return AuthorizationDecision.deny(
        policy.name,
        failedRequirements,
        `Policy check failed on one or more requirements`
      );
    }

    return AuthorizationDecision.allow(policy.name);
  }
}
