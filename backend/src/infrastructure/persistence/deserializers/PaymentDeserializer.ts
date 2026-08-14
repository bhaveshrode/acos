import { PaymentSnapshot } from "../snapshots/PaymentSnapshot.js";
import { PaymentProps } from "../../../business/payment/aggregates/Payment.js";
import { OrganizationId } from "../../../business/organization/value-objects/OrganizationId.js";
import { CustomerId } from "../../../business/customer/value-objects/CustomerId.js";
import { PaymentReference } from "../../../business/payment/value-objects/PaymentReference.js";
import { PaymentAmount } from "../../../business/payment/value-objects/PaymentAmount.js";
import { Money } from "../../../business/invoice/value-objects/Money.js";
import { PaymentStatus } from "../../../business/payment/enums/PaymentStatus.js";
import { PaymentMethod } from "../../../business/payment/value-objects/PaymentMethod.js";
import { PaymentMethodType } from "../../../business/payment/enums/PaymentMethodType.js";
import { TransactionHash } from "../../../business/payment/value-objects/TransactionHash.js";
import { GatewayReference } from "../../../business/payment/value-objects/GatewayReference.js";
import { WalletAddress } from "../../../business/payment/value-objects/WalletAddress.js";
import { PaymentMetadata } from "../../../business/payment/value-objects/PaymentMetadata.js";
import { ConfirmationCount } from "../../../business/payment/value-objects/ConfirmationCount.js";
import { ExchangeRate } from "../../../business/payment/value-objects/ExchangeRate.js";
import { PaymentAllocation } from "../../../business/payment/entities/PaymentAllocation.js";
import { InvoiceId } from "../../../business/invoice/value-objects/InvoiceId.js";
import { AllocationStatus } from "../../../business/payment/enums/AllocationStatus.js";
import { PaymentAttempt } from "../../../business/payment/entities/PaymentAttempt.js";
import { RefundRequest } from "../../../business/payment/entities/RefundRequest.js";
import { RefundStatus } from "../../../business/payment/enums/RefundStatus.js";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";

/**
 * Reconstructs PaymentProps domain structure from PaymentSnapshot persistence models.
 */
export class PaymentDeserializer {
  public static deserialize(snapshot: PaymentSnapshot): PaymentProps {
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
