import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
/**
 * Domain event emitted when a customer credit is applied to pay off an invoice.
 */
export class CustomerCreditApplied extends BaseDomainEvent {
    invoiceId;
    amount;
    constructor(receivableAccountId, invoiceId, amount) {
        super(receivableAccountId, "AccountsReceivable");
        this.invoiceId = invoiceId;
        this.amount = amount;
    }
}
