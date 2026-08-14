import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";

/**
 * Domain event emitted when a notification is queued for delivery.
 */
export class NotificationQueued extends BaseDomainEvent {
  constructor(notificationId: string) {
    super(notificationId, "Notification");
  }
}
