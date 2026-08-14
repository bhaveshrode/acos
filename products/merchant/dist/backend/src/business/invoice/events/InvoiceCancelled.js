import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
/**
 * Domain event emitted when an invoice is cancelled.
 */
export class InvoiceCancelled extends BaseDomainEvent {
    reason;
    constructor(invoiceId, reason) {
        super(invoiceId, "Invoice");
        this.reason = reason;
    }
}
