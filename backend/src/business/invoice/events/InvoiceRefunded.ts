import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
import { Money } from "../value-objects/Money.js";

/**
 * Domain event emitted when money paid against an invoice is returned to the payer.
 */
export class InvoiceRefunded extends BaseDomainEvent {
  public readonly amountRefunded: Money;

  constructor(invoiceId: string, amountRefunded: Money) {
    super(invoiceId, "Invoice");
    this.amountRefunded = amountRefunded;
  }
}
