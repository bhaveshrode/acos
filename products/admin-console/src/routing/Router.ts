import { IRouter } from "./IRouter.js";
import { INavigationManager } from "./INavigationManager.js";
import { RouteRegistry } from "./RouteRegistry.js";
import { RouteMatcher } from "./RouteMatcher.js";
import { RouteResolver } from "./RouteResolver.js";
import { GuardPipeline } from "./GuardPipeline.js";
import { RouteContext } from "./RouteContext.js";
import { NavigationOptions } from "./NavigationOptions.js";
import { QueryParameterParser } from "./QueryParameterParser.js";

/**
 * Router driving application routing lifecycle states, implementing IRouter.
 */
export class Router implements IRouter {
  private currentContext?: RouteContext;
  private readonly listeners: ((context: RouteContext) => void)[] = [];

  constructor(
    private readonly registry: RouteRegistry,
    private readonly matcher: RouteMatcher,
    private readonly resolver: RouteResolver,
    private readonly navigationManager: INavigationManager,
    private readonly guardPipeline: GuardPipeline
  ) {
    this.navigationManager.onPopState(async (path) => {
      await this.handleNavigation(path);
    });
  }

  public async start(initialPath: string = "/"): Promise<void> {
    await this.handleNavigation(initialPath);
  }

  public async navigate(path: string, options?: NavigationOptions): Promise<void> {
    const [pathname, search] = path.split("?");
    const match = this.matcher.match(this.registry.getRoutes(), pathname);
    if (!match) {
      throw new Error(`No route matches path: ${pathname}`);
    }

    const query = QueryParameterParser.parse(search || "");
    const context = new RouteContext(
      pathname,
      match.params,
      query,
      match.route.meta || {}
    );

    const guards = match.route.guards || [];
    const guardResult = await this.guardPipeline.execute(guards, context);

    if (!guardResult.allowed) {
      if (guardResult.redirectUrl) {
        await this.navigate(guardResult.redirectUrl, options);
      }
      return;
    }

    this.navigationManager.navigate(path, options);
    this.currentContext = context;
    this.notify(context);
  }

  public getCurrentContext(): RouteContext | undefined {
    return this.currentContext;
  }

  public onRouteChanged(callback: (context: RouteContext) => void): void {
    this.listeners.push(callback);
  }

  private async handleNavigation(path: string): Promise<void> {
    const [pathname, search] = path.split("?");
    const match = this.matcher.match(this.registry.getRoutes(), pathname);
    if (!match) return;

    const query = QueryParameterParser.parse(search || "");
    const context = new RouteContext(pathname, match.params, query, match.route.meta || {});

    const guards = match.route.guards || [];
    const guardResult = await this.guardPipeline.execute(guards, context);
    if (!guardResult.allowed) {
      if (guardResult.redirectUrl) {
        await this.handleNavigation(guardResult.redirectUrl);
      }
      return;
    }

    this.currentContext = context;
    this.notify(context);
  }

  private notify(context: RouteContext): void {
    for (const listener of this.listeners) {
      listener(context);
    }
  }
}
