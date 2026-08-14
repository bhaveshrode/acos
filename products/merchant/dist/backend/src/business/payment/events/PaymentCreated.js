import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
/**
 * Domain event emitted when a new Payment aggregate root is created.
 */
export class PaymentCreated extends BaseDomainEvent {
    organizationId;
    customerId;
    amount;
    constructor(paymentId, organizationId, customerId, amount) {
        super(paymentId, "Payment");
        this.organizationId = organizationId;
        this.customerId = customerId;
        this.amount = amount;
    }
}
