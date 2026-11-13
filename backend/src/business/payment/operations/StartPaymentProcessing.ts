import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
import { Result } from "../../../foundation/result/Result.js";
import { Payment } from "../aggregates/Payment.js";
import { GatewayReference } from "../value-objects/GatewayReference.js";

/**
 * Records the gateway acknowledging the transaction.
 *
 * Transition: mutable status -> PROCESSING, storing the gateway reference the
 * webhook flow later resolves back to this payment.
 */
export function startPaymentProcessing(
  payment: Payment,
  attemptId: UniqueEntityID,
  gatewayReference: GatewayReference
): Result<void> {
  return payment.startProcessing(attemptId, gatewayReference);
}
