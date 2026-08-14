/**
 * Enum representing the lifecycle states of a Settlement.
 */
export enum SettlementStatus {
  PENDING = "PENDING",
  CONFIRMING = "CONFIRMING",
  SETTLED = "SETTLED",
  FAILED = "FAILED",
  REVERSED = "REVERSED",
  CANCELLED = "CANCELLED"
}
