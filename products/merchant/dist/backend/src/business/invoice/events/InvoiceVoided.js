import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
/**
 * Domain event emitted when an invoice is voided.
 */
export class InvoiceVoided extends BaseDomainEvent {
    constructor(invoiceId) {
        super(invoiceId, "Invoice");
    }
}
