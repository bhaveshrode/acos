import { LayoutRegistry } from "./LayoutRegistry.js";
import { LayoutDescriptor } from "./LayoutDescriptor.js";

/**
 * LayoutResolver resolving registered layout descriptors by identifiers.
 */
export class LayoutResolver {
  constructor(private readonly registry: LayoutRegistry) {}

  public resolve(id: string): LayoutDescriptor {
    const descriptor = this.registry.get(id);
    if (!descriptor) {
      throw new Error(`Layout with identifier ${id} is not registered`);
    }
    return descriptor;
  }
}
