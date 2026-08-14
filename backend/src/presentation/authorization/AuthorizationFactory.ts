import { AuthorizationEvaluator } from "./AuthorizationEvaluator.js";
import { RoleResolver } from "./RoleResolver.js";
import { PermissionResolver } from "./PermissionResolver.js";
import { ResourceAuthorizationService } from "./ResourceAuthorizationService.js";
import { RoleAuthorizationHandler, PermissionAuthorizationHandler, OwnerAuthorizationHandler } from "./AuthorizationHandler.js";

/**
 * AuthorizationFactory orchestrating role resolvers, perm resolvers, and evaluator handlers.
 */
export class AuthorizationFactory {
  /**
   * Instantiates evaluator with standard check handlers.
   */
  public static createEvaluator(): AuthorizationEvaluator {
    const handlers = [
      new RoleAuthorizationHandler(),
      new PermissionAuthorizationHandler(),
      new OwnerAuthorizationHandler()
    ];
    return new AuthorizationEvaluator(handlers);
  }

  public static createRoleResolver(): RoleResolver {
    return new RoleResolver();
  }

  public static createPermissionResolver(): PermissionResolver {
    return new PermissionResolver();
  }

  public static createResourceService(): ResourceAuthorizationService {
    return new ResourceAuthorizationService();
  }
}
