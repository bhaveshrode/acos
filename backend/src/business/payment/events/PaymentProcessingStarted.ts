import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";

/**
 * Domain event emitted when processing starts at the provider gateway.
 */
export class PaymentProcessingStarted extends BaseDomainEvent {
  constructor(paymentId: string) {
    super(paymentId, "Payment");
  }
}
