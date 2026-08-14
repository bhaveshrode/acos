import { RouteDefinition } from "./RouteDefinition.js";

/**
 * RouteGroup wrapping context-specific endpoint definitions and middlewares.
 */
export class RouteGroup {
  constructor(
    public readonly prefix: string,
    public readonly routes: RouteDefinition[] = [],
    public readonly middleware: any[] = []
  ) {}
}
