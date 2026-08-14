import { Specification } from "../../../foundation/core/Specification.js";
import { PaymentStatus } from "../enums/PaymentStatus.js";
/**
 * Specification checking if a payment's current state permits cancellation.
 * Only PENDING and SUBMITTED payments can be cancelled.
 */
export class PaymentCanBeCancelled extends Specification {
    isSatisfiedBy(candidate) {
        return (candidate.status === PaymentStatus.PENDING ||
            candidate.status === PaymentStatus.SUBMITTED);
    }
}
