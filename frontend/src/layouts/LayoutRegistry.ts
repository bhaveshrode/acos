import { LayoutDescriptor } from "./LayoutDescriptor.js";

/**
 * LayoutRegistry storing LayoutDescriptors, preventing modifications after boot.
 */
export class LayoutRegistry {
  private readonly catalog = new Map<string, LayoutDescriptor>();
  private isFrozen: boolean = false;

  public register(descriptor: LayoutDescriptor): void {
    if (this.isFrozen) {
      throw new Error("LayoutRegistry is frozen and cannot accept further layouts");
    }
    this.catalog.set(descriptor.metadata.id, descriptor);
  }

  public get(id: string): LayoutDescriptor | undefined {
    return this.catalog.get(id);
  }

  public freeze(): void {
    this.isFrozen = true;
  }
}
