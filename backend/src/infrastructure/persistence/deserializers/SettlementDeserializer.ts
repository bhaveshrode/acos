import { SettlementSnapshot } from "../snapshots/SettlementSnapshot.js";
import { SettlementProps } from "../../../business/settlement/aggregates/Settlement.js";
import { OrganizationId } from "../../../business/organization/value-objects/OrganizationId.js";
import { PaymentId } from "../../../business/payment/value-objects/PaymentId.js";
import { SettlementReference } from "../../../business/settlement/value-objects/SettlementReference.js";
import { SettlementAmount } from "../../../business/settlement/value-objects/SettlementAmount.js";
import { Money } from "../../../business/invoice/value-objects/Money.js";
import { SettlementStatus } from "../../../business/settlement/enums/SettlementStatus.js";
import { SettlementMethod } from "../../../business/settlement/enums/SettlementMethod.js";
import { ConfirmationThreshold } from "../../../business/settlement/value-objects/ConfirmationThreshold.js";
import { SettlementConfirmation } from "../../../business/settlement/entities/SettlementConfirmation.js";
import { ConfirmationSource } from "../../../business/settlement/enums/ConfirmationSource.js";
import { ConfirmationCount } from "../../../business/settlement/value-objects/ConfirmationCount.js";
import { TreasuryReceipt } from "../../../business/settlement/entities/TreasuryReceipt.js";
import { TreasuryReference } from "../../../business/settlement/value-objects/TreasuryReference.js";
import { SettlementNote } from "../../../business/settlement/entities/SettlementNote.js";
import { BlockNumber } from "../../../business/settlement/value-objects/BlockNumber.js";
import { TransactionHash } from "../../../business/settlement/value-objects/TransactionHash.js";
import { SettlementMetadata } from "../../../business/settlement/value-objects/SettlementMetadata.js";
import { UserId } from "../../../business/identity/value-objects/UserId.js";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";

/**
 * Reconstructs SettlementProps domain structure from SettlementSnapshot persistence models.
 */
export class SettlementDeserializer {
  public static deserialize(snapshot: SettlementSnapshot): SettlementProps {
    const confirmations = snapshot.confirmations.map(
      (c) =>
        new SettlementConfirmation(new UniqueEntityID(c.id), {
          source: c.source as ConfirmationSource,
          count: ConfirmationCount.create(c.count).value,
          timestamp: c.timestamp
        })
    );

    const treasuryReceipts = snapshot.treasuryReceipts.map(
      (t) =>
        new TreasuryReceipt(new UniqueEntityID(t.id), {
          wallet: t.wallet,
          receivedAmount: SettlementAmount.create(Money.create(t.amount, t.currency).value).value,
          timestamp: t.timestamp,
          treasuryReference: TreasuryReference.create(t.treasuryReference).value
        })
    );

    const notes = snapshot.notes.map(
      (n) =>
        new SettlementNote(new UniqueEntityID(n.id), {
          text: n.content,
          authorId: new UserId(new UniqueEntityID(n.authorId)),
          createdAt: n.createdAt
        })
    );

    return {
      organizationId: new OrganizationId(new UniqueEntityID(snapshot.organizationId)),
      paymentId: new PaymentId(new UniqueEntityID(snapshot.paymentId)),
      reference: SettlementReference.create(snapshot.reference).value,
      amount: SettlementAmount.create(Money.create(snapshot.amount, snapshot.currency).value).value,
      status: snapshot.status as SettlementStatus,
      method: snapshot.method as SettlementMethod,
      confirmationThreshold: ConfirmationThreshold.create(snapshot.confirmationThreshold).value,
      confirmations,
      treasuryReceipts,
      notes,
      blockNumber: snapshot.blockNumber !== null ? BlockNumber.create(snapshot.blockNumber).value : null,
      transactionHash: snapshot.transactionHash ? TransactionHash.create(snapshot.transactionHash).value : null,
      metadata: SettlementMetadata.create(snapshot.metadata).value,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt
    };
  }
}
