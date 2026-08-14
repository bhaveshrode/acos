import { describe, it, expect } from "vitest";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
import { SettlementId } from "../value-objects/SettlementId.js";
import { SettlementReference } from "../value-objects/SettlementReference.js";
import { ConfirmationCount } from "../value-objects/ConfirmationCount.js";
import { BlockNumber } from "../value-objects/BlockNumber.js";
import { TransactionHash } from "../value-objects/TransactionHash.js";
import { TreasuryReference } from "../value-objects/TreasuryReference.js";
import { SettlementAmount } from "../value-objects/SettlementAmount.js";
import { SettlementTime } from "../value-objects/SettlementTime.js";
import { ConfirmationThreshold } from "../value-objects/ConfirmationThreshold.js";
import { SettlementMetadata } from "../value-objects/SettlementMetadata.js";

import { SettlementConfirmation } from "../entities/SettlementConfirmation.js";
import { TreasuryReceipt } from "../entities/TreasuryReceipt.js";
import { SettlementNote } from "../entities/SettlementNote.js";

import { Settlement } from "../aggregates/Settlement.js";

import { SettlementStatus } from "../enums/SettlementStatus.js";
import { SettlementMethod } from "../enums/SettlementMethod.js";
import { ConfirmationSource } from "../enums/ConfirmationSource.js";
import { ReversalReason } from "../enums/ReversalReason.js";

import { OrganizationId } from "../../organization/value-objects/OrganizationId.js";
import { PaymentId } from "../../payment/value-objects/PaymentId.js";
import { UserId } from "../../identity/value-objects/UserId.js";
import { Money } from "../../invoice/value-objects/Money.js";

import { SettlementReferenceGenerator } from "../services/SettlementReferenceGenerator.js";
import { ConfirmationPolicy } from "../services/ConfirmationPolicy.js";
import { FinalityPolicy } from "../services/FinalityPolicy.js";
import { SettlementPolicy } from "../services/SettlementPolicy.js";

import { SettlementCanBeCancelled } from "../specifications/SettlementCanBeCancelled.js";
import { SettlementCanBeReversed } from "../specifications/SettlementCanBeReversed.js";

describe("Settlement Bounded Context Unit Tests", () => {
  const orgId = OrganizationId.generate();
  const paymentId = PaymentId.generate();
  const setRef = SettlementReference.create("SET-2027-000081").value;
  const setAmount = SettlementAmount.create(Money.create(100, "USDC").value).value;
  const threshold = ConfirmationThreshold.create(12).value;

  describe("Value Objects", () => {
    it("should validate SettlementReference patterns", () => {
      expect(SettlementReference.create("SET-2027-000081").isSuccess).toBe(true);
      expect(SettlementReference.create("BAD-001").isFailure).toBe(true);
      expect(SettlementReference.create("").isFailure).toBe(true);
    });

    it("should validate ConfirmationCount non-negative integer rules", () => {
      expect(ConfirmationCount.create(0).isSuccess).toBe(true);
      expect(ConfirmationCount.create(15).isSuccess).toBe(true);
      expect(ConfirmationCount.create(-1).isFailure).toBe(true);
      expect(ConfirmationCount.create(2.5).isFailure).toBe(true);
    });

    it("should validate BlockNumber non-negative integer rules", () => {
      expect(BlockNumber.create(0).isSuccess).toBe(true);
      expect(BlockNumber.create(102931).isSuccess).toBe(true);
      expect(BlockNumber.create(-5).isFailure).toBe(true);
      expect(BlockNumber.create(4.1).isFailure).toBe(true);
    });

    it("should validate TransactionHash hex formats", () => {
      expect(TransactionHash.create("0x" + "a".repeat(64)).isSuccess).toBe(true);
      expect(TransactionHash.create("0x" + "a".repeat(63)).isFailure).toBe(true);
      expect(TransactionHash.create("").isFailure).toBe(true);
    });

    it("should validate TreasuryReference non-empty rules", () => {
      expect(TreasuryReference.create("TX-TR-9182").isSuccess).toBe(true);
      expect(TreasuryReference.create("").isFailure).toBe(true);
    });

    it("should validate SettlementAmount strictly positive rules", () => {
      expect(SettlementAmount.create(Money.create(0.01, "USDC").value).isSuccess).toBe(true);
      expect(SettlementAmount.create(Money.create(0, "USDC").value).isFailure).toBe(true);
      expect(SettlementAmount.create(Money.create(-5, "USDC").value).isFailure).toBe(true);
    });

    it("should validate SettlementTime valid date rules", () => {
      expect(SettlementTime.create(new Date()).isSuccess).toBe(true);
      expect(SettlementTime.create(new Date("invalid-date-string")).isFailure).toBe(true);
    });

    it("should validate ConfirmationThreshold non-negative rules", () => {
      expect(ConfirmationThreshold.create(12).isSuccess).toBe(true);
      expect(ConfirmationThreshold.create(0).isSuccess).toBe(true);
      expect(ConfirmationThreshold.create(-2).isFailure).toBe(true);
    });
  });

  describe("Settlement Aggregate & Invariants", () => {
    it("should initialize settlement in PENDING status with no confirmations or receipts", () => {
      const settlement = Settlement.create(
        SettlementId.generate(),
        orgId,
        paymentId,
        setRef,
        setAmount,
        SettlementMethod.BLOCKCHAIN,
        threshold
      ).value;

      expect(settlement.status).toBe(SettlementStatus.PENDING);
      expect(settlement.confirmations).toHaveLength(0);
      expect(settlement.treasuryReceipts).toHaveLength(0);
      expect(settlement.notes).toHaveLength(0);
      expect(settlement.domainEvents).toHaveLength(1);
      expect(settlement.domainEvents[0].eventName).toBe("SettlementCreated");
    });

    it("should log confirmations and transition to CONFIRMING", () => {
      const settlement = Settlement.create(
        SettlementId.generate(),
        orgId,
        paymentId,
        setRef,
        setAmount,
        SettlementMethod.BLOCKCHAIN,
        threshold
      ).value;

      const confPolicy = new ConfirmationPolicy();
      const res = settlement.addConfirmation(
        new UniqueEntityID(),
        ConfirmationSource.BLOCKCHAIN,
        ConfirmationCount.create(6).value,
        confPolicy
      );

      expect(res.isSuccess).toBe(true);
      expect(settlement.status).toBe(SettlementStatus.CONFIRMING);
      expect(settlement.confirmations).toHaveLength(1);
      expect(settlement.confirmations[0].count.value).toBe(6);

      // Verify domain events: SettlementCreated (on create), SettlementConfirming (on pending -> confirming), SettlementConfirmationReceived
      expect(settlement.domainEvents.map(e => e.eventName)).toContain("SettlementConfirming");
      expect(settlement.domainEvents.map(e => e.eventName)).toContain("SettlementConfirmationReceived");
    });

    it("should reject confirmations with decreasing counts", () => {
      const settlement = Settlement.create(
        SettlementId.generate(),
        orgId,
        paymentId,
        setRef,
        setAmount,
        SettlementMethod.BLOCKCHAIN,
        threshold
      ).value;

      const confPolicy = new ConfirmationPolicy();
      settlement.addConfirmation(
        new UniqueEntityID(),
        ConfirmationSource.BLOCKCHAIN,
        ConfirmationCount.create(6).value,
        confPolicy
      );

      // Try adding confirmation of 5 (current is 6)
      const res = settlement.addConfirmation(
        new UniqueEntityID(),
        ConfirmationSource.BLOCKCHAIN,
        ConfirmationCount.create(5).value,
        confPolicy
      );

      expect(res.isFailure).toBe(true);
      expect(res.error.message).toContain("Confirmation count cannot decrease");
    });

    it("should record treasury receipts and align currency", () => {
      const settlement = Settlement.create(
        SettlementId.generate(),
        orgId,
        paymentId,
        setRef,
        setAmount,
        SettlementMethod.BLOCKCHAIN,
        threshold
      ).value;

      // Currency alignment success
      const receiptAmount = SettlementAmount.create(Money.create(100, "USDC").value).value;
      const res = settlement.recordTreasuryReceipt(
        new UniqueEntityID(),
        "0xTreasuryWallet",
        receiptAmount,
        TreasuryReference.create("TR-01").value
      );
      expect(res.isSuccess).toBe(true);
      expect(settlement.treasuryReceipts).toHaveLength(1);
      expect(settlement.domainEvents.map(e => e.eventName)).toContain("TreasuryReceiptRecorded");

      // Currency mismatch failure
      const badReceiptAmount = SettlementAmount.create(Money.create(100, "EUR").value).value;
      const res2 = settlement.recordTreasuryReceipt(
        new UniqueEntityID(),
        "0xTreasuryWallet",
        badReceiptAmount,
        TreasuryReference.create("TR-02").value
      );
      expect(res2.isFailure).toBe(true);
      expect(res2.error.message).toContain("currency does not match");
    });

    it("should enforce finality policies before transitioning to SETTLED", () => {
      const settlement = Settlement.create(
        SettlementId.generate(),
        orgId,
        paymentId,
        setRef,
        setAmount,
        SettlementMethod.BLOCKCHAIN,
        threshold
      ).value;

      const confPolicy = new ConfirmationPolicy();
      const finalityPolicy = new FinalityPolicy();

      // Attempt complete with no confirmations and no treasury receipts
      const res1 = settlement.complete(finalityPolicy);
      expect(res1.isFailure).toBe(true);

      // Add confirmation under threshold (6 < 12)
      settlement.addConfirmation(new UniqueEntityID(), ConfirmationSource.BLOCKCHAIN, ConfirmationCount.create(6).value, confPolicy);
      const res2 = settlement.complete(finalityPolicy);
      expect(res2.isFailure).toBe(true);
      expect(res2.error.message).toContain("threshold not met");

      // Reach confirmation threshold (12 >= 12)
      settlement.addConfirmation(new UniqueEntityID(), ConfirmationSource.BLOCKCHAIN, ConfirmationCount.create(12).value, confPolicy);
      // Still fails because of no treasury receipt
      const res3 = settlement.complete(finalityPolicy);
      expect(res3.isFailure).toBe(true);
      expect(res3.error.message).toContain("No treasury receipts recorded");

      // Add partial treasury receipt (40 USDC of 100 USDC)
      settlement.recordTreasuryReceipt(
        new UniqueEntityID(),
        "0xWallet",
        SettlementAmount.create(Money.create(40, "USDC").value).value,
        TreasuryReference.create("TR-40").value
      );
      // Still fails because total received < expected
      const res4 = settlement.complete(finalityPolicy);
      expect(res4.isFailure).toBe(true);
      expect(res4.error.message).toContain("Total received treasury amount");

      // Add remaining treasury receipt (60 USDC)
      settlement.recordTreasuryReceipt(
        new UniqueEntityID(),
        "0xWallet",
        SettlementAmount.create(Money.create(60, "USDC").value).value,
        TreasuryReference.create("TR-60").value
      );

      // Should now succeed
      const res5 = settlement.complete(finalityPolicy);
      expect(res5.isSuccess).toBe(true);
      expect(settlement.status).toBe(SettlementStatus.SETTLED);
      expect(settlement.domainEvents.map(e => e.eventName)).toContain("SettlementCompleted");
      expect(settlement.domainEvents.map(e => e.eventName)).toContain("FinalityReached");
    });

    it("should prevent mutation when settled, failed, cancelled, or reversed", () => {
      const settlement = Settlement.create(
        SettlementId.generate(),
        orgId,
        paymentId,
        setRef,
        setAmount,
        SettlementMethod.BLOCKCHAIN,
        threshold
      ).value;

      const confPolicy = new ConfirmationPolicy();
      const finalityPolicy = new FinalityPolicy();

      settlement.addConfirmation(new UniqueEntityID(), ConfirmationSource.BLOCKCHAIN, ConfirmationCount.create(12).value, confPolicy);
      settlement.recordTreasuryReceipt(
        new UniqueEntityID(),
        "0xWallet",
        SettlementAmount.create(Money.create(100, "USDC").value).value,
        TreasuryReference.create("TR-100").value
      );
      settlement.complete(finalityPolicy);

      // Attempt adding confirmation on Settled record
      const badConf = settlement.addConfirmation(new UniqueEntityID(), ConfirmationSource.BLOCKCHAIN, ConfirmationCount.create(13).value, confPolicy);
      expect(badConf.isFailure).toBe(true);

      // Attempt adding treasury receipt on Settled record
      const badReceipt = settlement.recordTreasuryReceipt(
        new UniqueEntityID(),
        "0xWallet",
        SettlementAmount.create(Money.create(10, "USDC").value).value,
        TreasuryReference.create("TR-10").value
      );
      expect(badReceipt.isFailure).toBe(true);
    });

    it("should support fail, cancel, and close flows", () => {
      const settlement = Settlement.create(
        SettlementId.generate(),
        orgId,
        paymentId,
        setRef,
        setAmount,
        SettlementMethod.BLOCKCHAIN,
        threshold
      ).value;

      const policy = new SettlementPolicy();

      // Test cancel
      expect(settlement.cancel(policy).isSuccess).toBe(true);
      expect(settlement.status).toBe(SettlementStatus.CANCELLED);
      expect(settlement.domainEvents.map(e => e.eventName)).toContain("SettlementCancelled");

      // Cannot fail a cancelled settlement
      expect(settlement.fail("Failed reason").isFailure).toBe(true);

      // Test close
      expect(settlement.close().isSuccess).toBe(true);
      expect(settlement.domainEvents.map(e => e.eventName)).toContain("SettlementClosed");
    });

    it("should support fail from pending", () => {
      const settlement = Settlement.create(
        SettlementId.generate(),
        orgId,
        paymentId,
        setRef,
        setAmount,
        SettlementMethod.BLOCKCHAIN,
        threshold
      ).value;

      expect(settlement.fail("Network timeout").isSuccess).toBe(true);
      expect(settlement.status).toBe(SettlementStatus.FAILED);
      expect(settlement.domainEvents.map(e => e.eventName)).toContain("SettlementFailed");
    });

    it("should support reversal from settled, and block edits once reversed", () => {
      const settlement = Settlement.create(
        SettlementId.generate(),
        orgId,
        paymentId,
        setRef,
        setAmount,
        SettlementMethod.BLOCKCHAIN,
        threshold
      ).value;

      const confPolicy = new ConfirmationPolicy();
      const finalityPolicy = new FinalityPolicy();
      const setPolicy = new SettlementPolicy();

      settlement.addConfirmation(new UniqueEntityID(), ConfirmationSource.BLOCKCHAIN, ConfirmationCount.create(12).value, confPolicy);
      settlement.recordTreasuryReceipt(
        new UniqueEntityID(),
        "0xWallet",
        SettlementAmount.create(Money.create(100, "USDC").value).value,
        TreasuryReference.create("TR-100").value
      );
      settlement.complete(finalityPolicy);

      // Cannot reverse pending/confirming or failed/cancelled
      // Let's reverse settled settlement
      const noteId = new UniqueEntityID();
      const revRes = settlement.reverse(
        ReversalReason.CHAIN_REORGANIZATION,
        noteId,
        "Deep chain reorg occurred",
        UserId.generate(),
        setPolicy
      );
      expect(revRes.isSuccess).toBe(true);
      expect(settlement.status).toBe(SettlementStatus.REVERSED);
      expect(settlement.notes).toHaveLength(1);
      expect(settlement.notes[0].text).toContain("Reversal Reason");
      expect(settlement.domainEvents.map(e => e.eventName)).toContain("SettlementReversed");

      // Cannot edit note after reversal
      const badNote = settlement.addNote(new UniqueEntityID(), "Late audit note", UserId.generate());
      expect(badNote.isFailure).toBe(true);
    });
  });

  describe("Specifications & Policies", () => {
    it("SettlementReferenceGenerator should yield sequential references", () => {
      const gen = new SettlementReferenceGenerator();
      const ref = gen.generate(2027, 81).value;
      expect(ref.value).toBe("SET-2027-000081");
    });

    it("should correctly evaluate SettlementCanBeCancelled spec", () => {
      const spec = new SettlementCanBeCancelled();
      const settlement = Settlement.create(
        SettlementId.generate(),
        orgId,
        paymentId,
        setRef,
        setAmount,
        SettlementMethod.BLOCKCHAIN,
        threshold
      ).value;

      expect(spec.isSatisfiedBy(settlement)).toBe(true); // PENDING

      const confPolicy = new ConfirmationPolicy();
      settlement.addConfirmation(new UniqueEntityID(), ConfirmationSource.BLOCKCHAIN, ConfirmationCount.create(6).value, confPolicy);
      expect(spec.isSatisfiedBy(settlement)).toBe(true); // CONFIRMING

      settlement.fail("Failed");
      expect(spec.isSatisfiedBy(settlement)).toBe(false); // FAILED
    });

    it("should correctly evaluate SettlementCanBeReversed spec", () => {
      const spec = new SettlementCanBeReversed();
      const settlement = Settlement.create(
        SettlementId.generate(),
        orgId,
        paymentId,
        setRef,
        setAmount,
        SettlementMethod.BLOCKCHAIN,
        threshold
      ).value;

      expect(spec.isSatisfiedBy(settlement)).toBe(false); // PENDING

      const confPolicy = new ConfirmationPolicy();
      const finalityPolicy = new FinalityPolicy();
      settlement.addConfirmation(new UniqueEntityID(), ConfirmationSource.BLOCKCHAIN, ConfirmationCount.create(12).value, confPolicy);
      settlement.recordTreasuryReceipt(
        new UniqueEntityID(),
        "0xWallet",
        SettlementAmount.create(Money.create(100, "USDC").value).value,
        TreasuryReference.create("TR-100").value
      );
      settlement.complete(finalityPolicy);

      expect(spec.isSatisfiedBy(settlement)).toBe(true); // SETTLED
    });
  });
});
