import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
import { Money } from "../../invoice/value-objects/Money.js";

/**
 * Domain event emitted when a refund request is initiated.
 */
export class RefundRequested extends BaseDomainEvent {
  public readonly amount: Money;
  public readonly reason: string;

  constructor(paymentId: string, amount: Money, reason: string) {
    super(paymentId, "Payment");
    this.amount = amount;
    this.reason = reason;
  }
}
