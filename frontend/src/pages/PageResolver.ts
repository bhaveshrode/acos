import { PageRegistry } from "./PageRegistry.js";
import { PageDescriptor } from "./PageDescriptor.js";

/**
 * PageResolver resolving registered page descriptors by identifier.
 */
export class PageResolver {
  constructor(private readonly registry: PageRegistry) {}

  public resolve(id: string): PageDescriptor {
    const descriptor = this.registry.get(id);
    if (!descriptor) {
      throw new Error(`Page with identifier ${id} is not registered`);
    }
    return descriptor;
  }
}
