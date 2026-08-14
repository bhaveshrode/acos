import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
/**
 * Domain event emitted when payment funds are allocated to an invoice.
 */
export class PaymentAllocated extends BaseDomainEvent {
    invoiceId;
    allocatedAmount;
    constructor(paymentId, invoiceId, allocatedAmount) {
        super(paymentId, "Payment");
        this.invoiceId = invoiceId;
        this.allocatedAmount = allocatedAmount;
    }
}
