import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
import { ChannelType } from "../enums/ChannelType.js";

/**
 * Domain event emitted when a notification delivery attempt fails temporarily and is retried.
 */
export class NotificationRetried extends BaseDomainEvent {
  public readonly channel: ChannelType;
  public readonly retryCount: number;

  constructor(notificationId: string, channel: ChannelType, retryCount: number) {
    super(notificationId, "Notification");
    this.channel = channel;
    this.retryCount = retryCount;
  }
}
