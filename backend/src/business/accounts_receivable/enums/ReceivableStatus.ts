/**
 * Enum representing the status of a customer's receivable account or entry.
 */
export enum ReceivableStatus {
  CURRENT = "CURRENT",
  PARTIALLY_PAID = "PARTIALLY_PAID",
  OVERDUE = "OVERDUE",
  IN_COLLECTIONS = "IN_COLLECTIONS",
  WRITTEN_OFF = "WRITTEN_OFF",
  CLOSED = "CLOSED"
}
