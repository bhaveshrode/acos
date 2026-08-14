import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
import { PaymentAmount } from "../value-objects/PaymentAmount.js";

/**
 * Domain event emitted when a payment is successfully confirmed.
 */
export class PaymentConfirmed extends BaseDomainEvent {
  public readonly amount: PaymentAmount;

  constructor(paymentId: string, amount: PaymentAmount) {
    super(paymentId, "Payment");
    this.amount = amount;
  }
}
