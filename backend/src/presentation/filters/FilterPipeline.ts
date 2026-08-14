import { IFilter } from "./IFilter.js";

/**
 * FilterPipeline coordinating sequential execution layouts.
 */
export class FilterPipeline {
  private filters: { filter: IFilter; order: number }[] = [];

  public register(filter: IFilter, order: number = 0): void {
    this.filters.push({ filter, order });
    this.filters.sort((a, b) => a.order - b.order);
  }

  public getFilters(): IFilter[] {
    return this.filters.map((f) => f.filter);
  }

  /**
   * Resets registered filters.
   */
  public clear(): void {
    this.filters = [];
  }
}
