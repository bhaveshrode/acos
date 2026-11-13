import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
import { Result } from "../../../foundation/result/Result.js";
import { Payment } from "../aggregates/Payment.js";

/**
 * Records a gateway decline.
 *
 * Rejected once the payment is already confirmed; the error code and message
 * are kept on the attempt for reconciliation.
 */
export function failPayment(
  payment: Payment,
  attemptId: UniqueEntityID,
  errorCode: string,
  errorMessage: string
): Result<void> {
  return payment.fail(attemptId, errorCode, errorMessage);
}
