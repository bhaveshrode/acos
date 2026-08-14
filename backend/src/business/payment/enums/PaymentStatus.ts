/**
 * Enum representing the processing state of a Payment.
 */
export enum PaymentStatus {
  PENDING = "PENDING",
  SUBMITTED = "SUBMITTED",
  PROCESSING = "PROCESSING",
  CONFIRMED = "CONFIRMED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
  REFUND_REQUESTED = "REFUND_REQUESTED",
  REFUNDED = "REFUNDED"
}
