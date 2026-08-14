import { Settlement } from "../../../business/settlement/aggregates/Settlement.js";
import { SettlementSnapshot } from "../snapshots/SettlementSnapshot.js";

/**
 * Serializes Settlement aggregate root into SettlementSnapshot models.
 */
export class SettlementSerializer {
  public static serialize(aggregate: Settlement): SettlementSnapshot {
    return {
      id: aggregate.id.value,
      organizationId: aggregate.organizationId.value,
      paymentId: aggregate.paymentId.value,
      reference: aggregate.reference.value,
      amount: aggregate.amount.amount,
      currency: aggregate.amount.currency,
      status: aggregate.status,
      method: aggregate.method,
      confirmationThreshold: aggregate.confirmationThreshold.value,
      confirmations: aggregate.confirmations.map((c) => ({
        id: c.id.value,
        source: c.source,
        count: c.count.value,
        timestamp: c.timestamp
      })),
      treasuryReceipts: aggregate.treasuryReceipts.map((t) => ({
        id: t.id.value,
        wallet: t.wallet,
        amount: t.receivedAmount.amount,
        currency: t.receivedAmount.currency,
        timestamp: t.timestamp,
        treasuryReference: t.treasuryReference.value
      })),
      notes: aggregate.notes.map((n) => ({
        id: n.id.value,
        content: n.text,
        authorId: n.authorId.value,
        createdAt: n.createdAt
      })),
      blockNumber: aggregate.blockNumber ? aggregate.blockNumber.value : null,
      transactionHash: aggregate.transactionHash ? aggregate.transactionHash.value : null,
      metadata: aggregate.metadata.value,
      createdAt: aggregate.createdAt,
      updatedAt: aggregate.updatedAt
    };
  }
}
