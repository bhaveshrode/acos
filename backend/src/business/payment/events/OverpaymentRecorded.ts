import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
import { InvoiceId } from "../../invoice/value-objects/InvoiceId.js";
import { Money } from "../../invoice/value-objects/Money.js";

/**
 * Domain event emitted when payment received exceeds the outstanding invoice total.
 */
export class OverpaymentRecorded extends BaseDomainEvent {
  public readonly invoiceId: InvoiceId;
  public readonly overpaidAmount: Money;

  constructor(paymentId: string, invoiceId: InvoiceId, overpaidAmount: Money) {
    super(paymentId, "Payment");
    this.invoiceId = invoiceId;
    this.overpaidAmount = overpaidAmount;
  }
}
