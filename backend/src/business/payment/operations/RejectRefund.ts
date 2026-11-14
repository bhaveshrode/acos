import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
import { Result } from "../../../foundation/result/Result.js";
import { Payment } from "../aggregates/Payment.js";

/**
 * Marks a refund request rejected, e.g. when the gateway declines an
 * asynchronous refund. Rejected amounts stop counting against the refund cap
 * and the payment returns to CONFIRMED once no other refund is open.
 */
export function rejectRefund(payment: Payment, requestId: UniqueEntityID): Result<void> {
  return payment.rejectRefund(requestId);
}
