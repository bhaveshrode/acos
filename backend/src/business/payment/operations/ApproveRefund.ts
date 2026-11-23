import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
import { Result } from "../../../foundation/result/Result.js";
import { Payment } from "../aggregates/Payment.js";

/**
 * Marks a refund request approved, i.e. submitted to the gateway. Approved
 * amounts still count against the refund cap until the refund completes or
 * is rejected.
 */
export function approveRefund(payment: Payment, requestId: UniqueEntityID): Result<void> {
  return payment.approveRefund(requestId);
}
