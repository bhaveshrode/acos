import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
/**
 * Domain event emitted when payment execution fails.
 */
export class PaymentFailed extends BaseDomainEvent {
    errorCode;
    message;
    constructor(paymentId, errorCode, message) {
        super(paymentId, "Payment");
        this.errorCode = errorCode;
        this.message = message;
    }
}
