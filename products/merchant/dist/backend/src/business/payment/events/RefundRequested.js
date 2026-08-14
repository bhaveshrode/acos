import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
/**
 * Domain event emitted when a refund request is initiated.
 */
export class RefundRequested extends BaseDomainEvent {
    amount;
    reason;
    constructor(paymentId, amount, reason) {
        super(paymentId, "Payment");
        this.amount = amount;
        this.reason = reason;
    }
}
