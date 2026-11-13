import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
import { Result } from "../../../foundation/result/Result.js";
import { Payment } from "../aggregates/Payment.js";

/**
 * Marks a refund request completed. The payment becomes REFUNDED once the
 * completed refunds cover it, and returns to CONFIRMED when they do not.
 */
export function completeRefund(payment: Payment, requestId: UniqueEntityID): Result<void> {
  return payment.completeRefund(requestId);
}
