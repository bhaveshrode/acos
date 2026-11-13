import { PaymentSnapshot } from "../snapshots/PaymentSnapshot.js";
import {
  OrganizationId,
  CustomerId,
  PaymentReference,
  PaymentAmount,
  Money,
  PaymentStatus,
  PaymentMethod,
  PaymentMethodType,
  TransactionHash,
  GatewayReference,
  WalletAddress,
  PaymentMetadata,
  ConfirmationCount,
  ExchangeRate,
  PaymentAllocation,
  InvoiceId,
  AllocationStatus,
  PaymentAttempt,
  RefundRequest,
  RefundStatus,
  UniqueEntityID
} from "acos-backend";

/**
 * Rebuilds the aggregate state from a persisted snapshot.
 */
export class PaymentDeserializer {
  public static deserialize(snapshot: PaymentSnapshot) {
    const allocations = new Map<string, PaymentAllocation>();
    for (const alloc of snapshot.allocations) {
      allocations.set(
        alloc.id,
        new PaymentAllocation(new UniqueEntityID(alloc.id), {
          invoiceId: new InvoiceId(alloc.invoiceId),
          allocatedAmount: Money.create(alloc.amount, alloc.currency).value,
          status: alloc.status as AllocationStatus
        })
      );
    }

    const attempts = snapshot.attempts.map(
      (att) =>
        new PaymentAttempt(new UniqueEntityID(att.id), {
          timestamp: att.timestamp,
          status: att.status as PaymentStatus,
          gatewayResponse: att.gatewayResponse,
          errorCode: att.errorCode
        })
    );

    const refundRequests = new Map<string, RefundRequest>();
    for (const ref of snapshot.refundRequests) {
      refundRequests.set(
        ref.id,
        new RefundRequest(new UniqueEntityID(ref.id), {
          amount: Money.create(ref.amount, ref.currency).value,
          reason: ref.reason,
          status: ref.status as RefundStatus,
          requestedAt: ref.requestedAt
        })
      );
    }

    return {
      organizationId: new OrganizationId(snapshot.organizationId),
      customerId: new CustomerId(snapshot.customerId),
      reference: PaymentReference.create(snapshot.reference).value,
      amount: PaymentAmount.create(Money.create(snapshot.amount, snapshot.currency).value).value,
      status: snapshot.status as PaymentStatus,
      method: PaymentMethod.create(
        snapshot.methodType as PaymentMethodType,
        snapshot.methodDetails
      ).value,
      transactionHash: snapshot.transactionHash ? TransactionHash.create(snapshot.transactionHash).value : null,
      gatewayReference: snapshot.gatewayReference ? GatewayReference.create(snapshot.gatewayReference).value : null,
      walletAddress: snapshot.walletAddress ? WalletAddress.create(snapshot.walletAddress).value : null,
      metadata: PaymentMetadata.create(snapshot.metadata).value,
      confirmations: ConfirmationCount.create(snapshot.confirmations).value,
      exchangeRate: snapshot.exchangeRate ? ExchangeRate.create(snapshot.exchangeRate).value : null,
      allocations,
      attempts,
      refundRequests,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt
    };
  }
}
