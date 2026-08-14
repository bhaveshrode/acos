import { FormDescriptor } from "./FormDescriptor.js";

/**
 * FormRegistry cataloging registered FormDescriptors.
 */
export class FormRegistry {
  private readonly catalog = new Map<string, FormDescriptor>();
  private isFrozen: boolean = false;

  public register(descriptor: FormDescriptor): void {
    if (this.isFrozen) {
      throw new Error("FormRegistry is frozen and cannot accept further forms");
    }
    this.catalog.set(descriptor.metadata.id, descriptor);
  }

  public get(id: string): FormDescriptor | undefined {
    return this.catalog.get(id);
  }

  public freeze(): void {
    this.isFrozen = true;
  }
}
