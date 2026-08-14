import { IFilter } from "./IFilter.js";

/**
 * FilterRegistry cataloging global filters.
 */
export class FilterRegistry {
  private static globalFilters: { filter: IFilter; order: number }[] = [];

  public static registerGlobal(filter: IFilter, order: number = 0): void {
    this.globalFilters.push({ filter, order });
    this.globalFilters.sort((a, b) => a.order - b.order);
  }

  public static getGlobal(): IFilter[] {
    return this.globalFilters.map((f) => f.filter);
  }

  /**
   * Resets registry records.
   */
  public static clear(): void {
    this.globalFilters = [];
  }
}
