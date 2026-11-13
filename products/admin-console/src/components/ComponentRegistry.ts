import { ComponentDescriptor } from "./ComponentDescriptor.js";

/**
 * ComponentRegistry cataloging ComponentDescriptors with freezing capability.
 */
export class ComponentRegistry {
  private readonly catalog = new Map<string, ComponentDescriptor>();
  private isFrozen: boolean = false;

  public register(descriptor: ComponentDescriptor): void {
    if (this.isFrozen) {
      throw new Error("ComponentRegistry is frozen and cannot accept further components");
    }
    this.catalog.set(descriptor.metadata.id, descriptor);
  }

  public get(id: string): ComponentDescriptor | undefined {
    return this.catalog.get(id);
  }

  public freeze(): void {
    this.isFrozen = true;
  }
}
