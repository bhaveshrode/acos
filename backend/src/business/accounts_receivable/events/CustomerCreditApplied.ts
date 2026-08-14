import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
import { InvoiceId } from "../../invoice/value-objects/InvoiceId.js";
import { Money } from "../../invoice/value-objects/Money.js";

/**
 * Domain event emitted when a customer credit is applied to pay off an invoice.
 */
export class CustomerCreditApplied extends BaseDomainEvent {
  public readonly invoiceId: InvoiceId;
  public readonly amount: Money;

  constructor(
    receivableAccountId: string,
    invoiceId: InvoiceId,
    amount: Money
  ) {
    super(receivableAccountId, "AccountsReceivable");
    this.invoiceId = invoiceId;
    this.amount = amount;
  }
}
