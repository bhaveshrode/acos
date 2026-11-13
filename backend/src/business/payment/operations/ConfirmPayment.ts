import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
import { Result } from "../../../foundation/result/Result.js";
import { Payment } from "../aggregates/Payment.js";
import { ConfirmationCount } from "../value-objects/ConfirmationCount.js";
import { TransactionHash } from "../value-objects/TransactionHash.js";

/**
 * Confirms the payment on-chain and allocates every recorded allocation.
 *
 * Idempotent: an already confirmed payment returns success without
 * duplicating events.
 */
export function confirmPayment(
  payment: Payment,
  attemptId: UniqueEntityID,
  transactionHash: TransactionHash,
  confirmationCount: ConfirmationCount
): Result<void> {
  return payment.confirm(attemptId, transactionHash, confirmationCount);
}
