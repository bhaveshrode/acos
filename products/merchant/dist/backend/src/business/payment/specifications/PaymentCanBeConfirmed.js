import { Specification } from "../../../foundation/core/Specification.js";
import { PaymentStatus } from "../enums/PaymentStatus.js";
/**
 * Specification checking if a payment's current state permits confirmation.
 * Confirmed payments are already confirmed (idempotent), but cancelled or failed payments cannot be confirmed.
 */
export class PaymentCanBeConfirmed extends Specification {
    isSatisfiedBy(candidate) {
        return (candidate.status !== PaymentStatus.CANCELLED &&
            candidate.status !== PaymentStatus.FAILED);
    }
}
