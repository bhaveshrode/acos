import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
/**
 * Domain event emitted when settled funds are applied to a specific invoice.
 */
export class PaymentApplied extends BaseDomainEvent {
    settlementId;
    invoiceId;
    amount;
    constructor(receivableAccountId, settlementId, invoiceId, amount) {
        super(receivableAccountId, "AccountsReceivable");
        this.settlementId = settlementId;
        this.invoiceId = invoiceId;
        this.amount = amount;
    }
}
