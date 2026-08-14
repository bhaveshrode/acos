import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";

/**
 * Domain event emitted when a notification expires.
 */
export class NotificationExpired extends BaseDomainEvent {
  constructor(notificationId: string) {
    super(notificationId, "Notification");
  }
}
