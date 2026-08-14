/**
 * AnalyticsEventRegistry cataloging events with post-boot freeze features.
 */
export class AnalyticsEventRegistry {
  private readonly catalog = new Set<string>();
  private isFrozen: boolean = false;

  public register(eventName: string): void {
    if (this.isFrozen) {
      throw new Error("AnalyticsEventRegistry is frozen");
    }
    this.catalog.add(eventName);
  }

  public has(eventName: string): boolean {
    return this.catalog.has(eventName);
  }

  public freeze(): void {
    this.isFrozen = true;
  }
}
