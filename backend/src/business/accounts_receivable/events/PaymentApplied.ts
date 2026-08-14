import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
import { SettlementId } from "../../settlement/value-objects/SettlementId.js";
import { InvoiceId } from "../../invoice/value-objects/InvoiceId.js";
import { Money } from "../../invoice/value-objects/Money.js";

/**
 * Domain event emitted when settled funds are applied to a specific invoice.
 */
export class PaymentApplied extends BaseDomainEvent {
  public readonly settlementId: SettlementId;
  public readonly invoiceId: InvoiceId;
  public readonly amount: Money;

  constructor(
    receivableAccountId: string,
    settlementId: SettlementId,
    invoiceId: InvoiceId,
    amount: Money
  ) {
    super(receivableAccountId, "AccountsReceivable");
    this.settlementId = settlementId;
    this.invoiceId = invoiceId;
    this.amount = amount;
  }
}
