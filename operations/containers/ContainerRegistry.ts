import { ContainerDescriptor } from "./ContainerDescriptor.js";

/**
 * ContainerRegistry cataloging containers with freezing capability.
 */
export class ContainerRegistry {
  private readonly catalog = new Map<string, ContainerDescriptor>();
  private isFrozen: boolean = false;

  public register(descriptor: ContainerDescriptor): void {
    if (this.isFrozen) {
      throw new Error("ContainerRegistry is frozen");
    }
    this.catalog.set(descriptor.id, descriptor);
  }

  public get(id: string): ContainerDescriptor | undefined {
    return this.catalog.get(id);
  }

  public freeze(): void {
    this.isFrozen = true;
  }
}
