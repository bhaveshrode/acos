import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";

/**
 * Domain event emitted when payment execution fails.
 */
export class PaymentFailed extends BaseDomainEvent {
  public readonly errorCode: string;
  public readonly message: string;

  constructor(paymentId: string, errorCode: string, message: string) {
    super(paymentId, "Payment");
    this.errorCode = errorCode;
    this.message = message;
  }
}
