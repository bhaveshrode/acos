import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
/**
 * Domain event emitted when a payment is submitted to the gateway/provider.
 */
export class PaymentSubmitted extends BaseDomainEvent {
    constructor(paymentId) {
        super(paymentId, "Payment");
    }
}
