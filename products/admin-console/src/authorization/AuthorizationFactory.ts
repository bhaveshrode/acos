import { PolicyRegistry } from "./PolicyRegistry.js";
import { RoleAuthorizationHandler } from "./RoleAuthorizationHandler.js";
import { PermissionAuthorizationHandler } from "./PermissionAuthorizationHandler.js";
import { ClaimAuthorizationHandler } from "./ClaimAuthorizationHandler.js";
import { OwnershipAuthorizationHandler } from "./OwnershipAuthorizationHandler.js";
import { AuthorizationEvaluator } from "./AuthorizationEvaluator.js";
import { IAuthorizationEvaluator } from "./IAuthorizationEvaluator.js";
import { PermissionCache } from "./PermissionCache.js";
import { PermissionProvider } from "./PermissionProvider.js";
import { PermissionCacheInvalidator } from "./PermissionCacheInvalidator.js";
import { AuthorizationGuard } from "./AuthorizationGuard.js";
import { ComponentAuthorizationGuard } from "./ComponentAuthorizationGuard.js";
import { AuthorizationEventDispatcher } from "./AuthorizationEventDispatcher.js";
import { AuthorizationObserver } from "./AuthorizationObserver.js";
import { AuthenticationObserver } from "../authentication/AuthenticationObserver.js";
import { ClaimsPrincipal } from "../authentication/ClaimsPrincipal.js";

/**
 * AuthorizationFactory composing evaluators, handlers, and invalidators lifecycles.
 */
export class AuthorizationFactory {
  public static createPolicyRegistry(): PolicyRegistry {
    return new PolicyRegistry();
  }

  public static createEvaluator(): IAuthorizationEvaluator {
    const handlers = [
      new RoleAuthorizationHandler(),
      new PermissionAuthorizationHandler(),
      new ClaimAuthorizationHandler(),
      new OwnershipAuthorizationHandler()
    ];
    return new AuthorizationEvaluator(handlers);
  }

  public static createPermissionCache(): PermissionCache {
    return new PermissionCache();
  }

  public static createPermissionProvider(cache: PermissionCache): PermissionProvider {
    return new PermissionProvider(cache);
  }

  public static createPermissionCacheInvalidator(
    cache: PermissionCache,
    authObserver: AuthenticationObserver
  ): PermissionCacheInvalidator {
    return new PermissionCacheInvalidator(cache, authObserver);
  }

  public static createGuard(
    evaluator: IAuthorizationEvaluator,
    registry: PolicyRegistry,
    getUserPrincipal: () => ClaimsPrincipal | undefined
  ): AuthorizationGuard {
    return new AuthorizationGuard(evaluator, registry, getUserPrincipal);
  }

  public static createComponentGuard(
    evaluator: IAuthorizationEvaluator,
    registry: PolicyRegistry
  ): ComponentAuthorizationGuard {
    return new ComponentAuthorizationGuard(evaluator, registry);
  }

  public static createEventDispatcher(): AuthorizationEventDispatcher {
    return new AuthorizationEventDispatcher();
  }

  public static createObserver(dispatcher: AuthorizationEventDispatcher): AuthorizationObserver {
    return new AuthorizationObserver(dispatcher);
  }
}
