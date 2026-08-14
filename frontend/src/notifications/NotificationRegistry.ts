import { NotificationDescriptor } from "./NotificationDescriptor.js";

/**
 * NotificationRegistry cataloging registered descriptors.
 */
export class NotificationRegistry {
  private readonly catalog = new Map<string, NotificationDescriptor>();
  private isFrozen: boolean = false;

  public register(descriptor: NotificationDescriptor): void {
    if (this.isFrozen) {
      throw new Error("NotificationRegistry is frozen and cannot accept further notifications");
    }
    this.catalog.set(descriptor.metadata.id, descriptor);
  }

  public get(id: string): NotificationDescriptor | undefined {
    return this.catalog.get(id);
  }

  public freeze(): void {
    this.isFrozen = true;
  }
}
