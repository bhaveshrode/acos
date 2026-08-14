import { Payment } from "../../../business/payment/aggregates/Payment.js";
import { PaymentSnapshot } from "../snapshots/PaymentSnapshot.js";

/**
 * Serializes Payment aggregate root into PaymentSnapshot models.
 */
export class PaymentSerializer {
  public static serialize(aggregate: Payment): PaymentSnapshot {
    return {
      id: aggregate.id.value,
      organizationId: aggregate.organizationId.value,
      customerId: aggregate.customerId.value,
      reference: aggregate.reference.value,
      amount: aggregate.amount.amount,
      currency: aggregate.amount.currency,
      status: aggregate.status,
      methodType: aggregate.method.type,
      methodDetails: aggregate.method.details,
      transactionHash: aggregate.transactionHash ? aggregate.transactionHash.value : null,
      gatewayReference: aggregate.gatewayReference ? aggregate.gatewayReference.value : null,
      walletAddress: aggregate.walletAddress ? aggregate.walletAddress.value : null,
      metadata: aggregate.metadata.value,
      confirmations: aggregate.confirmations.value,
      exchangeRate: aggregate.exchangeRate ? aggregate.exchangeRate.rate : null,
      allocations: aggregate.allocations.map((a) => ({
        id: a.id.value,
        invoiceId: a.invoiceId.value,
        amount: a.allocatedAmount.amount,
        currency: a.allocatedAmount.currency,
        status: a.status
      })),
      attempts: aggregate.attempts.map((att) => ({
        id: att.id.value,
        timestamp: att.timestamp,
        status: att.status,
        gatewayResponse: att.gatewayResponse,
        errorCode: att.errorCode
      })),
      refundRequests: aggregate.refundRequests.map((r) => ({
        id: r.id.value,
        amount: r.amount.amount,
        currency: r.amount.currency,
        status: r.status,
        reason: r.reason,
        requestedAt: r.requestedAt
      })),
      createdAt: aggregate.createdAt,
      updatedAt: aggregate.updatedAt
    };
  }
}
