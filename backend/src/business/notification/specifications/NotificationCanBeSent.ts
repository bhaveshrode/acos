import { Specification } from "../../../foundation/core/Specification.js";
import { Notification } from "../aggregates/Notification.js";
import { NotificationStatus } from "../enums/NotificationStatus.js";

/**
 * Specification checking if a notification's current state permits delivery dispatches.
 * CANCELLED, EXPIRED, DELIVERED, READ, or FAILED notifications cannot be sent.
 */
export class NotificationCanBeSent extends Specification<Notification> {
  public isSatisfiedBy(candidate: Notification): boolean {
    return (
      candidate.status === NotificationStatus.DRAFT ||
      candidate.status === NotificationStatus.SCHEDULED ||
      candidate.status === NotificationStatus.QUEUED ||
      candidate.status === NotificationStatus.SENDING
    );
  }
}
