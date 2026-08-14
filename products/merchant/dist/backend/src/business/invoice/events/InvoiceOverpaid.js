import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
/**
 * Domain event emitted when payments received exceed the invoice total.
 */
export class InvoiceOverpaid extends BaseDomainEvent {
    amountPaid;
    constructor(invoiceId, amountPaid) {
        super(invoiceId, "Invoice");
        this.amountPaid = amountPaid;
    }
}
