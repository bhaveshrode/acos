import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
/**
 * Domain event emitted when an invoice is closed administratively.
 */
export class InvoiceClosed extends BaseDomainEvent {
    constructor(invoiceId) {
        super(invoiceId, "Invoice");
    }
}
