import { ValidationDescriptor } from "./ValidationDescriptor.js";

/**
 * ValidationRegistry cataloging validation descriptors with freezing capabilities.
 */
export class ValidationRegistry {
  private readonly catalog = new Map<string, ValidationDescriptor>();
  private isFrozen: boolean = false;

  public register(descriptor: ValidationDescriptor): void {
    if (this.isFrozen) {
      throw new Error("ValidationRegistry is frozen and cannot accept further validation schemas");
    }
    this.catalog.set(descriptor.id, descriptor);
  }

  public get(id: string): ValidationDescriptor | undefined {
    return this.catalog.get(id);
  }

  public freeze(): void {
    this.isFrozen = true;
  }
}
