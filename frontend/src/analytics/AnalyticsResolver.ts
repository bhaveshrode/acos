import { AnalyticsRegistry } from "./AnalyticsRegistry.js";
import { AnalyticsDescriptor } from "./AnalyticsDescriptor.js";

/**
 * AnalyticsResolver resolving registered provider descriptors by ID.
 */
export class AnalyticsResolver {
  constructor(private readonly registry: AnalyticsRegistry) {}

  public resolve(id: string): AnalyticsDescriptor {
    const descriptor = this.registry.get(id);
    if (!descriptor) {
      throw new Error(`Analytics provider with identifier ${id} is not registered`);
    }
    return descriptor;
  }
}
