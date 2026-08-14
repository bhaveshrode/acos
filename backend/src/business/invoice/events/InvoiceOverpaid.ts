import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
import { Money } from "../value-objects/Money.js";

/**
 * Domain event emitted when payments received exceed the invoice total.
 */
export class InvoiceOverpaid extends BaseDomainEvent {
  public readonly amountPaid: Money;

  constructor(invoiceId: string, amountPaid: Money) {
    super(invoiceId, "Invoice");
    this.amountPaid = amountPaid;
  }
}
