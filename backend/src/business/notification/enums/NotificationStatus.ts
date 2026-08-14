/**
 * Enum representing lifecycle states of a Notification.
 */
export enum NotificationStatus {
  DRAFT = "DRAFT",
  SCHEDULED = "SCHEDULED",
  QUEUED = "QUEUED",
  SENDING = "SENDING",
  DELIVERED = "DELIVERED",
  READ = "READ",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED"
}
