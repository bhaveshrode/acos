import { RouteDefinition } from "./RouteDefinition.js";
import { ResolvedRoute } from "./ResolvedRoute.js";

/**
 * RouteResolver compiling and outputting a ResolvedRoute snapshot.
 */
export class RouteResolver {
  public async resolve(
    route: RouteDefinition,
    params: Record<string, string> = {}
  ): Promise<ResolvedRoute> {
    let component = route.component;
    if (typeof component === "function") {
      try {
        const result = component();
        if (result && typeof result.then === "function") {
          const module = await result;
          component = module.default || module;
        }
      } catch {
        // preserve as is
      }
    }
    return new ResolvedRoute(
      route,
      component,
      route.layout,
      params,
      route.meta || {}
    );
  }
}
