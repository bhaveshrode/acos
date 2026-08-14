import { FactoryDescriptor } from "./FactoryDescriptor.js";

/**
 * FactoryRegistry cataloging factories with post-boot freeze features.
 */
export class FactoryRegistry {
  private readonly catalog = new Map<string, FactoryDescriptor>();
  private isFrozen: boolean = false;

  public register(descriptor: FactoryDescriptor): void {
    if (this.isFrozen) {
      throw new Error("FactoryRegistry is frozen and cannot accept further factories");
    }
    this.catalog.set(descriptor.id, descriptor);
  }

  public get(id: string): FactoryDescriptor | undefined {
    return this.catalog.get(id);
  }

  public freeze(): void {
    this.isFrozen = true;
  }
}
