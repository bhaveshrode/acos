import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
import { ChannelType } from "../enums/ChannelType.js";

/**
 * Domain event emitted when a notification is marked read by the recipient.
 */
export class NotificationRead extends BaseDomainEvent {
  public readonly channel: ChannelType;
  public readonly readerId: string | null;

  constructor(notificationId: string, channel: ChannelType, readerId: string | null) {
    super(notificationId, "Notification");
    this.channel = channel;
    this.readerId = readerId;
  }
}
