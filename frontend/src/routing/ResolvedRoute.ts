import { RouteDefinition } from "./RouteDefinition.js";

/**
 * ResolvedRoute representing the complete resolved routing layout, metadata, and dynamic component properties.
 */
export class ResolvedRoute {
  constructor(
    public readonly route: RouteDefinition,
    public readonly component: any,
    public readonly layout?: string,
    public readonly params: Readonly<Record<string, string>> = {},
    public readonly meta: Readonly<Record<string, any>> = {}
  ) {
    Object.freeze(this.params);
    Object.freeze(this.meta);
    Object.freeze(this);
  }
}
