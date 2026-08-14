import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
import { ChannelType } from "../enums/ChannelType.js";

/**
 * Domain event emitted when a notification delivery attempt fails permanently.
 */
export class NotificationFailed extends BaseDomainEvent {
  public readonly channel: ChannelType;
  public readonly reason: string;

  constructor(notificationId: string, channel: ChannelType, reason: string) {
    super(notificationId, "Notification");
    this.channel = channel;
    this.reason = reason;
  }
}
