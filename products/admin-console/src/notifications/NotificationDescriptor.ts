import { NotificationMetadata } from "./NotificationMetadata.js";

/**
 * NotificationDescriptor encapsulating class constructors, metadata, and templates.
 */
export class NotificationDescriptor {
  constructor(
    public readonly metadata: NotificationMetadata,
    public readonly notificationClass: any,
    public readonly template?: string
  ) {
    Object.freeze(this);
  }
}
