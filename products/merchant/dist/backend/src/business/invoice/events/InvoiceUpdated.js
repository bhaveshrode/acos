import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
/**
 * Domain event emitted when details of a draft invoice are updated.
 */
export class InvoiceUpdated extends BaseDomainEvent {
    constructor(invoiceId) {
        super(invoiceId, "Invoice");
    }
}
