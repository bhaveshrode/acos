import { RouteGroup } from "./RouteGroup.js";

/**
 * RouteRegistry tracking the complete set of registered context endpoint route groups.
 */
export class RouteRegistry {
  private static groups: RouteGroup[] = [];

  /**
   * Registers a RouteGroup.
   */
  public static registerGroup(group: RouteGroup): void {
    this.groups.push(group);
  }

  /**
   * Returns registered route groups list.
   */
  public static getGroups(): RouteGroup[] {
    return this.groups;
  }

  /**
   * Clears registry storage ledger.
   */
  public static clear(): void {
    this.groups = [];
  }
}
