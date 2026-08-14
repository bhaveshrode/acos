import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
import { InvoiceId } from "../../invoice/value-objects/InvoiceId.js";
import { Money } from "../../invoice/value-objects/Money.js";

/**
 * Domain event emitted when a payment is confirmed that only partially covers the target invoice.
 */
export class PartialPaymentRecorded extends BaseDomainEvent {
  public readonly invoiceId: InvoiceId;
  public readonly amount: Money;

  constructor(paymentId: string, invoiceId: InvoiceId, amount: Money) {
    super(paymentId, "Payment");
    this.invoiceId = invoiceId;
    this.amount = amount;
  }
}
