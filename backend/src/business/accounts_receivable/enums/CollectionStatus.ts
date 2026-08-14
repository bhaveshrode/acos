/**
 * Enum representing steps in the collections lifecycle.
 */
export enum CollectionStatus {
  NONE = "NONE",
  REMINDER_SENT = "REMINDER_SENT",
  ESCALATED = "ESCALATED",
  LEGAL_REVIEW = "LEGAL_REVIEW",
  RESOLVED = "RESOLVED"
}
