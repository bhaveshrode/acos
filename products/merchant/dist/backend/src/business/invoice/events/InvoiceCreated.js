import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
/**
 * Domain event emitted when a new Invoice is initialized.
 */
export class InvoiceCreated extends BaseDomainEvent {
    organizationId;
    customerId;
    invoiceNumber;
    constructor(invoiceId, organizationId, customerId, invoiceNumber) {
        super(invoiceId, "Invoice");
        this.organizationId = organizationId;
        this.customerId = customerId;
        this.invoiceNumber = invoiceNumber;
    }
}
