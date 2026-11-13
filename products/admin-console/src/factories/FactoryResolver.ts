import { FactoryRegistry } from "./FactoryRegistry.js";
import { FactoryDescriptor } from "./FactoryDescriptor.js";

/**
 * FactoryResolver resolving factory descriptors from registries.
 */
export class FactoryResolver {
  constructor(private readonly registry: FactoryRegistry) {}

  public resolve(id: string): FactoryDescriptor {
    const descriptor = this.registry.get(id);
    if (!descriptor) {
      throw new Error(`Factory with identifier ${id} is not registered`);
    }
    return descriptor;
  }
}
