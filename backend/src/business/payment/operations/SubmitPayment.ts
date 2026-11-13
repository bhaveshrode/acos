import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
import { Result } from "../../../foundation/result/Result.js";
import { Payment } from "../aggregates/Payment.js";

/**
 * Records that the payment was handed to the gateway.
 *
 * Transition: any mutable status -> SUBMITTED, appending a gateway attempt.
 */
export function submitPayment(payment: Payment, attemptId: UniqueEntityID): Result<void> {
  return payment.submit(attemptId);
}
