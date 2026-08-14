import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
import { Money } from "../value-objects/Money.js";

/**
 * Domain event emitted when an invoice transitions to paid.
 */
export class InvoicePaid extends BaseDomainEvent {
  public readonly amountPaid: Money;

  constructor(invoiceId: string, amountPaid: Money) {
    super(invoiceId, "Invoice");
    this.amountPaid = amountPaid;
  }
}
