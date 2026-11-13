import { AnalyticsDescriptor } from "./AnalyticsDescriptor.js";

/**
 * AnalyticsRegistry cataloging providers with post-boot freeze features.
 */
export class AnalyticsRegistry {
  private readonly catalog = new Map<string, AnalyticsDescriptor>();
  private isFrozen: boolean = false;

  public register(descriptor: AnalyticsDescriptor): void {
    if (this.isFrozen) {
      throw new Error("AnalyticsRegistry is frozen and cannot accept further providers");
    }
    this.catalog.set(descriptor.metadata.id, descriptor);
  }

  public get(id: string): AnalyticsDescriptor | undefined {
    return this.catalog.get(id);
  }

  public freeze(): void {
    this.isFrozen = true;
  }
}
