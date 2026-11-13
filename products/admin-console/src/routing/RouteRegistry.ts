import { RouteDefinition } from "./RouteDefinition.js";

/**
 * RouteRegistry maintaining lists of registered client routes, supporting frozen states.
 */
export class RouteRegistry {
  private readonly routes: RouteDefinition[] = [];
  private isFrozen: boolean = false;

  public register(route: RouteDefinition): void {
    if (this.isFrozen) {
      throw new Error("RouteRegistry is frozen and cannot accept further route registrations");
    }
    this.routes.push(route);
  }

  public getRoutes(): RouteDefinition[] {
    return [...this.routes];
  }

  public freeze(): void {
    this.isFrozen = true;
    Object.freeze(this.routes);
    Object.freeze(this);
  }
}
