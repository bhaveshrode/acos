import { PageDescriptor } from "./PageDescriptor.js";

/**
 * PageRegistry storing page descriptor instances.
 */
export class PageRegistry {
  private readonly catalog = new Map<string, PageDescriptor>();
  private isFrozen: boolean = false;

  public register(descriptor: PageDescriptor): void {
    if (this.isFrozen) {
      throw new Error("PageRegistry is frozen and cannot accept further pages");
    }
    this.catalog.set(descriptor.metadata.id, descriptor);
  }

  public get(id: string): PageDescriptor | undefined {
    return this.catalog.get(id);
  }

  public freeze(): void {
    this.isFrozen = true;
  }
}
