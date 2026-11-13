import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
import { Result } from "../../../foundation/result/Result.js";
import { Payment } from "../aggregates/Payment.js";
import { Money } from "../../invoice/value-objects/Money.js";

/**
 * Requests a refund against a confirmed payment. Requests are additive: the
 * live refund total, rejections excluded, can never exceed the payment.
 */
export function requestRefund(
  payment: Payment,
  requestId: UniqueEntityID,
  amount: Money,
  reason: string
): Result<void> {
  return payment.requestRefund(requestId, amount, reason);
}
