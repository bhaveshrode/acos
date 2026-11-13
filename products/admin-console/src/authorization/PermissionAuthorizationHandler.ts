import { IAuthorizationHandler } from "./IAuthorizationHandler.js";
import { AuthorizationContext } from "./AuthorizationContext.js";
import { AuthorizationRequirement } from "./AuthorizationRequirement.js";
import { PermissionResolver } from "../authentication/PermissionResolver.js";

/**
 * PermissionAuthorizationHandler validating permission claim matches asynchronously.
 */
export class PermissionAuthorizationHandler implements IAuthorizationHandler {
  public canHandle(requirement: AuthorizationRequirement): boolean {
    return requirement.type === "permission";
  }

  public async evaluate(
    context: AuthorizationContext,
    requirement: AuthorizationRequirement
  ): Promise<boolean> {
    return PermissionResolver.hasPermission(context.user, requirement.value);
  }
}
