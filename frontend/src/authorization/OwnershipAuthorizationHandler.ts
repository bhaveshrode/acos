import { IAuthorizationHandler } from "./IAuthorizationHandler.js";
import { AuthorizationContext } from "./AuthorizationContext.js";
import { AuthorizationRequirement } from "./AuthorizationRequirement.js";

/**
 * OwnershipAuthorizationHandler validating owner relationships rules asynchronously.
 */
export class OwnershipAuthorizationHandler implements IAuthorizationHandler {
  public canHandle(requirement: AuthorizationRequirement): boolean {
    return requirement.type === "ownership";
  }

  public async evaluate(
    context: AuthorizationContext,
    requirement: AuthorizationRequirement
  ): Promise<boolean> {
    const ownerId = context.resourceMetadata.ownerId || context.resourceMetadata.userId;
    if (!ownerId) return false;
    return context.user.userId === ownerId;
  }
}
