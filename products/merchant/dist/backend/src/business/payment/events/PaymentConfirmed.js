import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
/**
 * Domain event emitted when a payment is successfully confirmed.
 */
export class PaymentConfirmed extends BaseDomainEvent {
    amount;
    constructor(paymentId, amount) {
        super(paymentId, "Payment");
        this.amount = amount;
    }
}
