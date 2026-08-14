import { Specification } from "../../../foundation/core/Specification.js";
import { Payment } from "../aggregates/Payment.js";
import { PaymentStatus } from "../enums/PaymentStatus.js";

/**
 * Specification checking if a payment's current state permits confirmation.
 * Confirmed payments are already confirmed (idempotent), but cancelled or failed payments cannot be confirmed.
 */
export class PaymentCanBeConfirmed extends Specification<Payment> {
  public isSatisfiedBy(candidate: Payment): boolean {
    return (
      candidate.status !== PaymentStatus.CANCELLED &&
      candidate.status !== PaymentStatus.FAILED
    );
  }
}
