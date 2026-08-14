import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
/**
 * Domain event emitted when an invoice due date is missed and enters overdue status.
 */
export class InvoiceOverdue extends BaseDomainEvent {
    invoiceId;
    constructor(receivableAccountId, invoiceId) {
        super(receivableAccountId, "AccountsReceivable");
        this.invoiceId = invoiceId;
    }
}
