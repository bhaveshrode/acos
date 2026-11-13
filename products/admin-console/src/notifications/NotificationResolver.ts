import { NotificationRegistry } from "./NotificationRegistry.js";
import { NotificationDescriptor } from "./NotificationDescriptor.js";

/**
 * NotificationResolver resolving registered descriptors by identifier.
 */
export class NotificationResolver {
  constructor(private readonly registry: NotificationRegistry) {}

  public resolve(id: string): NotificationDescriptor {
    const descriptor = this.registry.get(id);
    if (!descriptor) {
      throw new Error(`Notification schema with identifier ${id} is not registered`);
    }
    return descriptor;
  }
}
