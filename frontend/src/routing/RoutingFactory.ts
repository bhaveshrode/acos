import { RouteRegistry } from "./RouteRegistry.js";
import { RouteMatcher } from "./RouteMatcher.js";
import { RouteResolver } from "./RouteResolver.js";
import { INavigationManager } from "./INavigationManager.js";
import { NavigationManager } from "./NavigationManager.js";
import { GuardPipeline } from "./GuardPipeline.js";
import { IRouter } from "./IRouter.js";
import { Router } from "./Router.js";
import { NavigationStateManager } from "./NavigationStateManager.js";

/**
 * RoutingFactory building registries, matchers, resolvers, managers, and routers.
 */
export class RoutingFactory {
  public static createRegistry(): RouteRegistry {
    return new RouteRegistry();
  }

  public static createMatcher(): RouteMatcher {
    return new RouteMatcher();
  }

  public static createResolver(): RouteResolver {
    return new RouteResolver();
  }

  public static createNavigationManager(): INavigationManager {
    return new NavigationManager();
  }

  public static createGuardPipeline(): GuardPipeline {
    return new GuardPipeline();
  }

  public static createStateManager(): NavigationStateManager {
    return new NavigationStateManager();
  }

  public static createRouter(
    registry: RouteRegistry,
    matcher: RouteMatcher,
    resolver: RouteResolver,
    navigationManager: INavigationManager,
    guardPipeline: GuardPipeline
  ): IRouter {
    return new Router(registry, matcher, resolver, navigationManager, guardPipeline);
  }
}
