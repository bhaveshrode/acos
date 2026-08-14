import { FormRegistry } from "./FormRegistry.js";
import { FormDescriptor } from "./FormDescriptor.js";

/**
 * FormResolver resolving registered FormDescriptors by identifier.
 */
export class FormResolver {
  constructor(private readonly registry: FormRegistry) {}

  public resolve(id: string): FormDescriptor {
    const descriptor = this.registry.get(id);
    if (!descriptor) {
      throw new Error(`Form with identifier ${id} is not registered`);
    }
    return descriptor;
  }
}
