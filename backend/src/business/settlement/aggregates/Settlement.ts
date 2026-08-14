import { AggregateRoot } from "../../../foundation/core/AggregateRoot.js";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

import { SettlementId } from "../value-objects/SettlementId.js";
import { SettlementReference } from "../value-objects/SettlementReference.js";
import { ConfirmationCount } from "../value-objects/ConfirmationCount.js";
import { BlockNumber } from "../value-objects/BlockNumber.js";
import { TransactionHash } from "../value-objects/TransactionHash.js";
import { TreasuryReference } from "../value-objects/TreasuryReference.js";
import { SettlementAmount } from "../value-objects/SettlementAmount.js";
import { ConfirmationThreshold } from "../value-objects/ConfirmationThreshold.js";
import { SettlementMetadata } from "../value-objects/SettlementMetadata.js";

import { SettlementConfirmation } from "../entities/SettlementConfirmation.js";
import { TreasuryReceipt } from "../entities/TreasuryReceipt.js";
import { SettlementNote } from "../entities/SettlementNote.js";

import { SettlementStatus } from "../enums/SettlementStatus.js";
import { SettlementMethod } from "../enums/SettlementMethod.js";
import { ConfirmationSource } from "../enums/ConfirmationSource.js";
import { ReversalReason } from "../enums/ReversalReason.js";

import { OrganizationId } from "../../organization/value-objects/OrganizationId.js";
import { PaymentId } from "../../payment/value-objects/PaymentId.js";
import { UserId } from "../../identity/value-objects/UserId.js";

import { SettlementCreated } from "../events/SettlementCreated.js";
import { SettlementConfirmationReceived } from "../events/SettlementConfirmationReceived.js";
import { SettlementConfirming } from "../events/SettlementConfirming.js";
import { SettlementCompleted } from "../events/SettlementCompleted.js";
import { SettlementFailed } from "../events/SettlementFailed.js";
import { SettlementReversed } from "../events/SettlementReversed.js";
import { TreasuryReceiptRecorded } from "../events/TreasuryReceiptRecorded.js";
import { SettlementCancelled } from "../events/SettlementCancelled.js";
import { FinalityReached } from "../events/FinalityReached.js";
import { SettlementClosed } from "../events/SettlementClosed.js";

import { FinalityPolicy } from "../services/FinalityPolicy.js";
import { ConfirmationPolicy } from "../services/ConfirmationPolicy.js";
import { SettlementPolicy } from "../services/SettlementPolicy.js";

export interface SettlementProps {
  organizationId: OrganizationId;
  paymentId: PaymentId;
  reference: SettlementReference;
  amount: SettlementAmount;
  status: SettlementStatus;
  method: SettlementMethod;
  confirmationThreshold: ConfirmationThreshold;
  confirmations: SettlementConfirmation[];
  treasuryReceipts: TreasuryReceipt[];
  notes: SettlementNote[];
  blockNumber: BlockNumber | null;
  transactionHash: TransactionHash | null;
  metadata: SettlementMetadata;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Aggregate Root guarding settlement transitions, confirmation thresholds, and treasury receipts.
 */
export class Settlement extends AggregateRoot<SettlementId> {
  private readonly props: SettlementProps;

  private constructor(id: SettlementId, props: SettlementProps) {
    super(id);
    this.props = props;
  }

  /**
   * Factory constructor to initialize a Settlement in PENDING status.
   */
  public static create(
    id: SettlementId,
    organizationId: OrganizationId,
    paymentId: PaymentId,
    reference: SettlementReference,
    amount: SettlementAmount,
    method: SettlementMethod,
    confirmationThreshold: ConfirmationThreshold,
    optional?: {
      blockNumber?: BlockNumber;
      transactionHash?: TransactionHash;
      metadata?: SettlementMetadata;
      confirmations?: SettlementConfirmation[];
      treasuryReceipts?: TreasuryReceipt[];
      notes?: SettlementNote[];
      createdAt?: Date;
      updatedAt?: Date;
    }
  ): Result<Settlement> {
    const settlement = new Settlement(id, {
      organizationId,
      paymentId,
      reference,
      amount,
      status: SettlementStatus.PENDING,
      method,
      confirmationThreshold,
      confirmations: optional?.confirmations || [],
      treasuryReceipts: optional?.treasuryReceipts || [],
      notes: optional?.notes || [],
      blockNumber: optional?.blockNumber || null,
      transactionHash: optional?.transactionHash || null,
      metadata: optional?.metadata || SettlementMetadata.create().value,
      createdAt: optional?.createdAt || new Date(),
      updatedAt: optional?.updatedAt || new Date()
    });

    settlement.addDomainEvent(new SettlementCreated(id.value, organizationId, paymentId, amount));
    return Result.ok(settlement);
  }

  // Getters
  public get organizationId(): OrganizationId { return this.props.organizationId; }
  public get paymentId(): PaymentId { return this.props.paymentId; }
  public get reference(): SettlementReference { return this.props.reference; }
  public get amount(): SettlementAmount { return this.props.amount; }
  public get status(): SettlementStatus { return this.props.status; }
  public get method(): SettlementMethod { return this.props.method; }
  public get confirmationThreshold(): ConfirmationThreshold { return this.props.confirmationThreshold; }
  public get confirmations(): readonly SettlementConfirmation[] { return Object.freeze([...this.props.confirmations]); }
  public get treasuryReceipts(): readonly TreasuryReceipt[] { return Object.freeze([...this.props.treasuryReceipts]); }
  public get notes(): readonly SettlementNote[] { return Object.freeze([...this.props.notes]); }
  public get blockNumber(): BlockNumber | null { return this.props.blockNumber; }
  public get transactionHash(): TransactionHash | null { return this.props.transactionHash; }
  public get metadata(): SettlementMetadata { return this.props.metadata; }
  public get createdAt(): Date { return this.props.createdAt; }
  public get updatedAt(): Date { return this.props.updatedAt; }

  private ensureMutable(): Result<void> {
    if (this.status === SettlementStatus.SETTLED) {
      return Result.fail(ResultError.conflict("Settled settlements are immutable except through reversal."));
    }
    if (this.status === SettlementStatus.FAILED) {
      return Result.fail(ResultError.conflict("Failed settlements are locked."));
    }
    if (this.status === SettlementStatus.CANCELLED) {
      return Result.fail(ResultError.conflict("Cancelled settlements are locked."));
    }
    if (this.status === SettlementStatus.REVERSED) {
      return Result.fail(ResultError.conflict("Reversed settlements remain immutable historical records."));
    }
    return Result.ok();
  }

  /**
   * Logs a block/bank/gateway/treasury confirmation signal.
   */
  public addConfirmation(
    confirmationId: UniqueEntityID,
    source: ConfirmationSource,
    count: ConfirmationCount,
    confirmationPolicy: ConfirmationPolicy
  ): Result<void> {
    const editCheck = this.ensureMutable();
    if (editCheck.isFailure) return Result.fail(editCheck.error);

    // Get current confirmation count (highest count recorded among confirmations)
    let highestCount = 0;
    this.props.confirmations.forEach((conf) => {
      if (conf.count.value > highestCount) {
        highestCount = conf.count.value;
      }
    });
    const currentCount = ConfirmationCount.create(highestCount).value;

    // Validate confirmation count progression
    const progressionCheck = confirmationPolicy.validateConfirmationProgression(count, currentCount);
    if (progressionCheck.isFailure) return Result.fail(progressionCheck.error);

    const confirmation = new SettlementConfirmation(confirmationId, {
      source,
      count,
      timestamp: new Date()
    });
    this.props.confirmations.push(confirmation);

    if (this.status === SettlementStatus.PENDING) {
      this.props.status = SettlementStatus.CONFIRMING;
      this.addDomainEvent(new SettlementConfirming(this.id.value));
    }

    this.props.updatedAt = new Date();
    this.addDomainEvent(new SettlementConfirmationReceived(this.id.value, source, count));

    return Result.ok();
  }

  /**
   * Records a treasury deposit receipt.
   */
  public recordTreasuryReceipt(
    receiptId: UniqueEntityID,
    wallet: string,
    receivedAmount: SettlementAmount,
    treasuryReference: TreasuryReference
  ): Result<void> {
    const editCheck = this.ensureMutable();
    if (editCheck.isFailure) return Result.fail(editCheck.error);

    if (receivedAmount.currency !== this.amount.currency) {
      return Result.fail(ResultError.conflict("Treasury receipt currency does not match settlement currency."));
    }

    const receipt = new TreasuryReceipt(receiptId, {
      wallet,
      receivedAmount,
      timestamp: new Date(),
      treasuryReference
    });
    this.props.treasuryReceipts.push(receipt);

    this.props.updatedAt = new Date();
    this.addDomainEvent(new TreasuryReceiptRecorded(this.id.value, wallet, receivedAmount));

    return Result.ok();
  }

  /**
   * Finalizes the settlement if all finality rules are met.
   */
  public complete(finalityPolicy: FinalityPolicy): Result<void> {
    if (this.status === SettlementStatus.SETTLED) return Result.ok();

    if (this.status === SettlementStatus.FAILED || this.status === SettlementStatus.CANCELLED || this.status === SettlementStatus.REVERSED) {
      return Result.fail(ResultError.conflict(`Cannot complete a settlement in state ${this.status}.`));
    }

    const finalityCheck = finalityPolicy.isFinalityReached(this);
    if (finalityCheck.isFailure) return Result.fail(finalityCheck.error);

    this.props.status = SettlementStatus.SETTLED;
    this.props.updatedAt = new Date();

    this.addDomainEvent(new SettlementCompleted(this.id.value));
    this.addDomainEvent(new FinalityReached(this.id.value));

    return Result.ok();
  }

  /**
   * Registers a settlement processing failure.
   */
  public fail(reason: string): Result<void> {
    if (this.status === SettlementStatus.SETTLED) {
      return Result.fail(ResultError.conflict("Cannot fail a settled settlement. Use reversal instead."));
    }
    if (this.status === SettlementStatus.CANCELLED || this.status === SettlementStatus.REVERSED) {
      return Result.fail(ResultError.conflict(`Cannot fail a settlement in state ${this.status}.`));
    }

    this.props.status = SettlementStatus.FAILED;
    this.props.updatedAt = new Date();

    this.addDomainEvent(new SettlementFailed(this.id.value, reason));
    return Result.ok();
  }

  /**
   * Cancels a pending or confirming settlement.
   */
  public cancel(settlementPolicy: SettlementPolicy): Result<void> {
    const policyCheck = settlementPolicy.validateCancellationRules(this);
    if (policyCheck.isFailure) return Result.fail(policyCheck.error);

    this.props.status = SettlementStatus.CANCELLED;
    this.props.updatedAt = new Date();

    this.addDomainEvent(new SettlementCancelled(this.id.value));
    return Result.ok();
  }

  /**
   * Reverses a completed settlement in exceptional cases.
   */
  public reverse(
    reason: ReversalReason,
    noteId: UniqueEntityID,
    noteText: string,
    authorId: UserId,
    settlementPolicy: SettlementPolicy
  ): Result<void> {
    const policyCheck = settlementPolicy.validateReversalPermissions(this, reason);
    if (policyCheck.isFailure) return Result.fail(policyCheck.error);

    this.props.status = SettlementStatus.REVERSED;
    
    const note = new SettlementNote(noteId, {
      text: `Reversal Reason: ${reason}. Details: ${noteText}`,
      authorId,
      createdAt: new Date()
    });
    this.props.notes.push(note);

    this.props.updatedAt = new Date();

    this.addDomainEvent(new SettlementReversed(this.id.value, reason, noteText));
    return Result.ok();
  }

  /**
   * Adds an internal audit note to the settlement.
   */
  public addNote(noteId: UniqueEntityID, text: string, authorId: UserId): Result<void> {
    if (this.status === SettlementStatus.REVERSED) {
      return Result.fail(ResultError.conflict("Cannot add notes to reversed settlements."));
    }

    const note = new SettlementNote(noteId, {
      text,
      authorId,
      createdAt: new Date()
    });
    this.props.notes.push(note);
    this.props.updatedAt = new Date();

    return Result.ok();
  }

  /**
   * Closes a terminated settlement.
   */
  public close(): Result<void> {
    if (this.status === SettlementStatus.PENDING || this.status === SettlementStatus.CONFIRMING) {
      return Result.fail(ResultError.conflict("Cannot close a pending or confirming settlement."));
    }

    this.props.updatedAt = new Date();
    this.addDomainEvent(new SettlementClosed(this.id.value));

    return Result.ok();
  }
}
