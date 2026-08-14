import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";

/**
 * Domain event emitted when an invoice is cancelled.
 */
export class InvoiceCancelled extends BaseDomainEvent {
  public readonly reason: string;

  constructor(invoiceId: string, reason: string) {
    super(invoiceId, "Invoice");
    this.reason = reason;
  }
}
