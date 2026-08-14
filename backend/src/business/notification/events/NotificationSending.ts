import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
import { ChannelType } from "../enums/ChannelType.js";

/**
 * Domain event emitted when a notification delivery attempt begins on a channel.
 */
export class NotificationSending extends BaseDomainEvent {
  public readonly channel: ChannelType;

  constructor(notificationId: string, channel: ChannelType) {
    super(notificationId, "Notification");
    this.channel = channel;
  }
}
