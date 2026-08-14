import { Specification } from "../../../foundation/core/Specification.js";
import { Payment } from "../aggregates/Payment.js";
import { PaymentStatus } from "../enums/PaymentStatus.js";

/**
 * Specification checking if a payment's current state permits cancellation.
 * Only PENDING and SUBMITTED payments can be cancelled.
 */
export class PaymentCanBeCancelled extends Specification<Payment> {
  public isSatisfiedBy(candidate: Payment): boolean {
    return (
      candidate.status === PaymentStatus.PENDING ||
      candidate.status === PaymentStatus.SUBMITTED
    );
  }
}
