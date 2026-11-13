import { RouteDefinition } from "./RouteDefinition.js";

/**
 * RouteMatcher resolving dynamic segment parameters and URL paths.
 */
export class RouteMatcher {
  public match(
    routes: RouteDefinition[],
    path: string
  ): { route: RouteDefinition; params: Record<string, string> } | null {
    for (const route of routes) {
      const result = this.matchRoute(route, path);
      if (result) return result;
    }
    return null;
  }

  private matchRoute(
    route: RouteDefinition,
    path: string
  ): { route: RouteDefinition; params: Record<string, string> } | null {
    const paramNames: string[] = [];
    const regexPath = route.path.replace(/:([^/]+)/g, (_, name) => {
      paramNames.push(name);
      return "([^/]+)";
    });
    const regex = new RegExp(`^${regexPath}$`);
    const match = path.match(regex);

    if (match) {
      const params: Record<string, string> = {};
      paramNames.forEach((name, index) => {
        params[name] = match[index + 1];
      });
      return { route, params };
    }

    if (route.children) {
      for (const child of route.children) {
        const fullPath = `${route.path === "/" ? "" : route.path}/${child.path}`.replace(/\/+/g, "/");
        const childResult = this.matchRoute({ ...child, path: fullPath }, path);
        if (childResult) return childResult;
      }
    }

    return null;
  }
}
