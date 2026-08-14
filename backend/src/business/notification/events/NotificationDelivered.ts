import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
import { ChannelType } from "../enums/ChannelType.js";

/**
 * Domain event emitted when a notification is successfully delivered.
 */
export class NotificationDelivered extends BaseDomainEvent {
  public readonly channel: ChannelType;

  constructor(notificationId: string, channel: ChannelType) {
    super(notificationId, "Notification");
    this.channel = channel;
  }
}
