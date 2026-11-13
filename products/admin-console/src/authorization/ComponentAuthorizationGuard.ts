import { IAuthorizationEvaluator } from "./IAuthorizationEvaluator.js";
import { PolicyRegistry } from "./PolicyRegistry.js";
import { AuthorizationContext } from "./AuthorizationContext.js";
import { ClaimsPrincipal } from "../authentication/ClaimsPrincipal.js";
import { PermissionResolver } from "../authentication/PermissionResolver.js";

/**
 * ComponentAuthorizationGuard controlling components layouts rendering asynchronously.
 */
export class ComponentAuthorizationGuard {
  constructor(
    private readonly evaluator: IAuthorizationEvaluator,
    private readonly policyRegistry: PolicyRegistry
  ) {}

  public async isAuthorized(
    user: ClaimsPrincipal,
    policyName: string,
    resourceMetadata?: Record<string, any>
  ): Promise<boolean> {
    const policy = this.policyRegistry.getPolicy(policyName);
    if (!policy) return false;

    const permissions = PermissionResolver.resolvePermissions(user);
    const context = new AuthorizationContext(user, permissions, resourceMetadata || {});
    const result = await this.evaluator.evaluate(context, policy);
    return result.allowed;
  }
}
