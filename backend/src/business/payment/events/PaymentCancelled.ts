import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";

/**
 * Domain event emitted when a pending payment is cancelled.
 */
export class PaymentCancelled extends BaseDomainEvent {
  constructor(paymentId: string) {
    super(paymentId, "Payment");
  }
}
