import { ValidationRegistry } from "./ValidationRegistry.js";
import { ValidationDescriptor } from "./ValidationDescriptor.js";

/**
 * ValidationResolver resolving registered validation descriptors.
 */
export class ValidationResolver {
  constructor(private readonly registry: ValidationRegistry) {}

  public resolve(id: string): ValidationDescriptor {
    const descriptor = this.registry.get(id);
    if (!descriptor) {
      throw new Error(`Validation schema with identifier ${id} is not registered`);
    }
    return descriptor;
  }
}
