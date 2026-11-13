import { IRouteGuard } from "../routing/IRouteGuard.js";
import { RouteContext } from "../routing/RouteContext.js";
import { GuardResult } from "../routing/GuardResult.js";
import { IAuthorizationEvaluator } from "./IAuthorizationEvaluator.js";
import { PolicyRegistry } from "./PolicyRegistry.js";
import { AuthorizationContext } from "./AuthorizationContext.js";
import { ClaimsPrincipal } from "../authentication/ClaimsPrincipal.js";
import { PermissionResolver } from "../authentication/PermissionResolver.js";

/**
 * AuthorizationGuard implementing IRouteGuard for route navigation checks.
 */
export class AuthorizationGuard implements IRouteGuard {
  constructor(
    private readonly evaluator: IAuthorizationEvaluator,
    private readonly policyRegistry: PolicyRegistry,
    private readonly getUserPrincipal: () => ClaimsPrincipal | undefined
  ) {}

  public async canActivate(context: RouteContext): Promise<GuardResult> {
    const policyName = context.meta?.authorizationPolicy;
    if (!policyName) {
      return GuardResult.allow();
    }

    const policy = this.policyRegistry.getPolicy(policyName);
    if (!policy) {
      return GuardResult.deny(`Authorization policy ${policyName} not registered`);
    }

    const user = this.getUserPrincipal();
    if (!user) {
      return GuardResult.redirect("/login", "User is not authenticated");
    }

    const permissions = PermissionResolver.resolvePermissions(user);
    const authCtx = new AuthorizationContext(user, permissions, context.meta || {});

    const result = await this.evaluator.evaluate(authCtx, policy);
    if (result.allowed) {
      return GuardResult.allow();
    }

    if (result.redirectPath) {
      return GuardResult.redirect(result.redirectPath, result.reason);
    }

    return GuardResult.deny(result.reason || "Access denied by policy check");
  }
}
