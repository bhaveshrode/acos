import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
/**
 * Domain event emitted when a Draft Invoice is finalized and issued.
 */
export class InvoiceIssued extends BaseDomainEvent {
    constructor(invoiceId) {
        super(invoiceId, "Invoice");
    }
}
