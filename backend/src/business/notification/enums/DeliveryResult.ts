/**
 * Enum representing outcomes of a delivery attempt.
 */
export enum DeliveryResult {
  SUCCESS = "SUCCESS",
  TEMPORARY_FAILURE = "TEMPORARY_FAILURE",
  PERMANENT_FAILURE = "PERMANENT_FAILURE",
  CANCELLED = "CANCELLED"
}
