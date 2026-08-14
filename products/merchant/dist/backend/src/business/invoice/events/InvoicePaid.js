import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
/**
 * Domain event emitted when an invoice transitions to paid.
 */
export class InvoicePaid extends BaseDomainEvent {
    amountPaid;
    constructor(invoiceId, amountPaid) {
        super(invoiceId, "Invoice");
        this.amountPaid = amountPaid;
    }
}
