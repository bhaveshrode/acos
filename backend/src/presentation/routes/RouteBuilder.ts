import { RouteDefinition } from "./RouteDefinition.js";
import { RouteGroup } from "./RouteGroup.js";

/**
 * RouteBuilder compiling prefixes, middleware chains, and endpoint actions.
 */
export class RouteBuilder {
  private prefix = "";
  private routes: RouteDefinition[] = [];
  private middleware: any[] = [];

  /**
   * Assigns route prefix.
   */
  public withPrefix(prefix: string): this {
    this.prefix = prefix;
    return this;
  }

  /**
   * Appends an endpoint definition mapping method, path, and handler.
   */
  public addRoute(
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
    path: string,
    handler: Function,
    middleware: any[] = []
  ): this {
    this.routes.push({ method, path, handler, middleware });
    return this;
  }

  /**
   * Appends shared group-level middlewares.
   */
  public withMiddleware(middleware: any): this {
    this.middleware.push(middleware);
    return this;
  }

  /**
   * Generates RouteGroup.
   */
  public build(): RouteGroup {
    return new RouteGroup(this.prefix, this.routes, this.middleware);
  }
}
