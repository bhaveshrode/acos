/**
 * Enum representing the operational state of an Invoice.
 */
export enum InvoiceStatus {
  DRAFT = "DRAFT",
  ISSUED = "ISSUED",
  PARTIALLY_PAID = "PARTIALLY_PAID",
  PAID = "PAID",
  OVERPAID = "OVERPAID",
  VOID = "VOID",
  CANCELLED = "CANCELLED",
  CLOSED = "CLOSED"
}
