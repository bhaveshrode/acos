import { RouteDefinition } from "./RouteDefinition.js";

/**
 * RouteGroup mapping prefix paths to bounded route selections.
 */
export class RouteGroup {
  constructor(
    public readonly prefix: string,
    public readonly routes: RouteDefinition[]
  ) {}

  public getRouteDefinitions(): RouteDefinition[] {
    return this.routes.map((route) => ({
      ...route,
      path: `${this.prefix}${route.path === "/" ? "" : route.path}`
    }));
  }
}
