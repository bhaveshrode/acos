import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
/**
 * Domain event emitted when an invoice transitions to partially paid.
 */
export class InvoicePartiallyPaid extends BaseDomainEvent {
    amountPaid;
    constructor(invoiceId, amountPaid) {
        super(invoiceId, "Invoice");
        this.amountPaid = amountPaid;
    }
}
