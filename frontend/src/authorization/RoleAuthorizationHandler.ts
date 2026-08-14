import { IAuthorizationHandler } from "./IAuthorizationHandler.js";
import { AuthorizationContext } from "./AuthorizationContext.js";
import { AuthorizationRequirement } from "./AuthorizationRequirement.js";

/**
 * RoleAuthorizationHandler validating role claim rules asynchronously.
 */
export class RoleAuthorizationHandler implements IAuthorizationHandler {
  public canHandle(requirement: AuthorizationRequirement): boolean {
    return requirement.type === "role";
  }

  public async evaluate(
    context: AuthorizationContext,
    requirement: AuthorizationRequirement
  ): Promise<boolean> {
    const userRole = context.user.getClaim("role") || context.user.getClaim("roles");
    const requiredRole = requirement.value;

    if (Array.isArray(userRole)) {
      return userRole.map((r) => r.toLowerCase()).includes(requiredRole.toLowerCase());
    }
    if (typeof userRole === "string") {
      return userRole.toLowerCase() === requiredRole.toLowerCase();
    }
    return false;
  }
}
