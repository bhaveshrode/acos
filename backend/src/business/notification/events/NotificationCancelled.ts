import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";

/**
 * Domain event emitted when a notification is cancelled before delivery.
 */
export class NotificationCancelled extends BaseDomainEvent {
  constructor(notificationId: string) {
    super(notificationId, "Notification");
  }
}
