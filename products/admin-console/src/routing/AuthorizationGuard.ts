import { IRouteGuard } from "./IRouteGuard.js";
import { RouteContext } from "./RouteContext.js";
import { GuardResult } from "./GuardResult.js";

/**
 * AuthorizationGuard enforcing role-based permissions validations returning denials.
 */
export class AuthorizationGuard implements IRouteGuard {
  constructor(
    private readonly checkUserPermissions: (roles: string[], permissions: string[]) => boolean
  ) {}

  public async canActivate(context: RouteContext): Promise<GuardResult> {
    const requiredRoles = context.meta.roles || [];
    const requiredPermissions = context.meta.permissions || [];
    const allowed = this.checkUserPermissions(requiredRoles, requiredPermissions);
    return allowed
      ? GuardResult.allow()
      : GuardResult.deny("User does not have required roles or permissions");
  }
}
