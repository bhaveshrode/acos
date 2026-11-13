import { ComponentRegistry } from "./ComponentRegistry.js";
import { ComponentDescriptor } from "./ComponentDescriptor.js";

/**
 * ComponentResolver retrieving registered ComponentDescriptors.
 */
export class ComponentResolver {
  constructor(private readonly registry: ComponentRegistry) {}

  public resolve(id: string): ComponentDescriptor {
    const descriptor = this.registry.get(id);
    if (!descriptor) {
      throw new Error(`Component with identifier ${id} is not registered`);
    }
    return descriptor;
  }
}
