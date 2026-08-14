import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
/**
 * Domain event emitted when an invoice's due date is updated.
 */
export class InvoiceDueDateChanged extends BaseDomainEvent {
    newDueDate;
    constructor(invoiceId, newDueDate) {
        super(invoiceId, "Invoice");
        this.newDueDate = newDueDate;
    }
}
