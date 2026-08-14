import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
import { InvoiceId } from "../../invoice/value-objects/InvoiceId.js";
import { Money } from "../../invoice/value-objects/Money.js";

/**
 * Domain event emitted when payment funds are allocated to an invoice.
 */
export class PaymentAllocated extends BaseDomainEvent {
  public readonly invoiceId: InvoiceId;
  public readonly allocatedAmount: Money;

  constructor(paymentId: string, invoiceId: InvoiceId, allocatedAmount: Money) {
    super(paymentId, "Payment");
    this.invoiceId = invoiceId;
    this.allocatedAmount = allocatedAmount;
  }
}
