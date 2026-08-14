import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";

/**
 * Domain event emitted when a notification is scheduled for future delivery.
 */
export class NotificationScheduled extends BaseDomainEvent {
  public readonly scheduledAt: Date;

  constructor(notificationId: string, scheduledAt: Date) {
    super(notificationId, "Notification");
    this.scheduledAt = scheduledAt;
  }
}
