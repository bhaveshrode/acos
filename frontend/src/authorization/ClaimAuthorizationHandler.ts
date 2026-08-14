import { IAuthorizationHandler } from "./IAuthorizationHandler.js";
import { AuthorizationContext } from "./AuthorizationContext.js";
import { AuthorizationRequirement } from "./AuthorizationRequirement.js";

/**
 * ClaimAuthorizationHandler validating user claim values presence asynchronously.
 */
export class ClaimAuthorizationHandler implements IAuthorizationHandler {
  public canHandle(requirement: AuthorizationRequirement): boolean {
    return requirement.type === "claim";
  }

  public async evaluate(
    context: AuthorizationContext,
    requirement: AuthorizationRequirement
  ): Promise<boolean> {
    const { type, value } = requirement.value || {};
    if (!type) return false;
    return context.user.hasClaim(type, value);
  }
}
