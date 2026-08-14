import { describe, it, expect } from "vitest";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
import { PaymentId } from "../value-objects/PaymentId.js";
import { PaymentReference } from "../value-objects/PaymentReference.js";
import { PaymentAmount } from "../value-objects/PaymentAmount.js";
import { TransactionHash } from "../value-objects/TransactionHash.js";
import { PaymentMethod } from "../value-objects/PaymentMethod.js";
import { WalletAddress } from "../value-objects/WalletAddress.js";
import { ExchangeRate } from "../value-objects/ExchangeRate.js";
import { ConfirmationCount } from "../value-objects/ConfirmationCount.js";
import { PaymentAllocation } from "../entities/PaymentAllocation.js";
import { PaymentAttempt } from "../entities/PaymentAttempt.js";
import { RefundRequest } from "../entities/RefundRequest.js";
import { Payment } from "../aggregates/Payment.js";
import { PaymentStatus } from "../enums/PaymentStatus.js";
import { PaymentMethodType } from "../enums/PaymentMethodType.js";
import { AllocationStatus } from "../enums/AllocationStatus.js";
import { RefundStatus } from "../enums/RefundStatus.js";
import { OrganizationId } from "../../organization/value-objects/OrganizationId.js";
import { CustomerId } from "../../customer/value-objects/CustomerId.js";
import { InvoiceId } from "../../invoice/value-objects/InvoiceId.js";
import { Money } from "../../invoice/value-objects/Money.js";

import { PaymentReferenceGenerator } from "../services/PaymentReferenceGenerator.js";
import { AllocationPolicy } from "../services/AllocationPolicy.js";
import { PaymentPolicy } from "../services/PaymentPolicy.js";
import { GatewayValidationPolicy } from "../services/GatewayValidationPolicy.js";
import { PaymentCanBeCancelled } from "../specifications/PaymentCanBeCancelled.js";
import { PaymentCanBeConfirmed } from "../specifications/PaymentCanBeConfirmed.js";

describe("Payment Bounded Context Unit Tests (Tasks 15.2 - 15.5)", () => {
  const orgId = OrganizationId.generate();
  const custId = CustomerId.generate();
  const payRef = PaymentReference.create("PAY-2027-000001").value;
  const payAmount = PaymentAmount.create(Money.create(100, "USDC").value).value;
  const payMethod = PaymentMethod.create(PaymentMethodType.USDC, "0x1234567890123456789012345678901234567890").value;
  const invId = InvoiceId.generate();
  const allocAmount = Money.create(100, "USDC").value;

  describe("Value Objects", () => {
    it("should validate PaymentReference patterns", () => {
      expect(PaymentReference.create("pay-001").isSuccess).toBe(true);
      expect(PaymentReference.create("BAD-001").isFailure).toBe(true);
    });

    it("should validate TransactionHash hex formats", () => {
      expect(TransactionHash.create("0x" + "a".repeat(64)).isSuccess).toBe(true);
      expect(TransactionHash.create("0x" + "a".repeat(63)).isFailure).toBe(true);
    });

    it("should validate ExchangeRate bounds", () => {
      expect(ExchangeRate.create(1.05).isSuccess).toBe(true);
      expect(ExchangeRate.create(-0.1).isFailure).toBe(true);
    });
  });

  describe("Payment Aggregate & Allocation Invariants", () => {
    it("should initialize payment in PENDING status with one allocation", () => {
      const payment = Payment.create(
        PaymentId.generate(),
        orgId,
        custId,
        payRef,
        payAmount,
        payMethod,
        invId,
        allocAmount
      ).value;

      expect(payment.status).toBe(PaymentStatus.PENDING);
      expect(payment.allocations).toHaveLength(1);
      expect(payment.allocations[0].invoiceId.equals(invId)).toBe(true);
      expect(payment.allocations[0].status).toBe(AllocationStatus.PENDING);
      expect(payment.domainEvents[0].eventName).toBe("PaymentCreated");
    });

    it("should reject allocations exceeding payment amount", () => {
      const payment = Payment.create(
        PaymentId.generate(),
        orgId,
        custId,
        payRef,
        payAmount,
        payMethod,
        invId,
        Money.create(60, "USDC").value // Allocates 60 of 100
      ).value;

      // Try adding another allocation of 50 (Total = 110)
      const res = payment.addAllocation(new UniqueEntityID(), InvoiceId.generate(), Money.create(50, "USDC").value);
      expect(res.isFailure).toBe(true);
      expect(res.error.message).toContain("cannot exceed payment amount");
    });

    it("should log gateway processing sequences and Attempts", () => {
      const payment = Payment.create(
        PaymentId.generate(),
        orgId,
        custId,
        payRef,
        payAmount,
        payMethod,
        invId,
        allocAmount
      ).value;

      // Submit
      payment.submit(new UniqueEntityID());
      expect(payment.status).toBe(PaymentStatus.SUBMITTED);
      expect(payment.attempts).toHaveLength(1);
      expect(payment.attempts[0].status).toBe(PaymentStatus.SUBMITTED);

      // Confirm success
      const txHash = TransactionHash.create("0x" + "b".repeat(64)).value;
      const confirmCount = ConfirmationCount.create(12).value;
      payment.confirm(new UniqueEntityID(), txHash, confirmCount);

      expect(payment.status).toBe(PaymentStatus.CONFIRMED);
      expect(payment.attempts).toHaveLength(2);
      expect(payment.attempts[1].status).toBe(PaymentStatus.CONFIRMED);
      expect(payment.allocations[0].status).toBe(AllocationStatus.ALLOCATED);
    });

    it("should enforce refund totals boundaries", () => {
      const payment = Payment.create(
        PaymentId.generate(),
        orgId,
        custId,
        payRef,
        payAmount,
        payMethod,
        invId,
        allocAmount
      ).value;

      // Cannot refund unconfirmed payments
      const badRefund = payment.requestRefund(new UniqueEntityID(), Money.create(50, "USDC").value, "Wrong item");
      expect(badRefund.isFailure).toBe(true);

      // Confirm
      payment.confirm(new UniqueEntityID(), TransactionHash.create("0x" + "c".repeat(64)).value, ConfirmationCount.create(1).value);

      // Request 60 refund
      expect(payment.requestRefund(new UniqueEntityID(), Money.create(60, "USDC").value, "Refund 1").isSuccess).toBe(true);

      // Request another 50 refund (Total = 110 > 100)
      const badRefund2 = payment.requestRefund(new UniqueEntityID(), Money.create(50, "USDC").value, "Refund 2");
      expect(badRefund2.isFailure).toBe(true);
    });

    it("should allow approving and rejecting refund requests through aggregate root", () => {
      const payment = Payment.create(
        PaymentId.generate(),
        orgId,
        custId,
        payRef,
        payAmount,
        payMethod,
        invId,
        allocAmount
      ).value;

      // Confirm
      payment.confirm(new UniqueEntityID(), TransactionHash.create("0x" + "c".repeat(64)).value, ConfirmationCount.create(1).value);

      const refundId = new UniqueEntityID();
      // Request refund
      payment.requestRefund(refundId, Money.create(40, "USDC").value, "Defective item");
      expect(payment.status).toBe(PaymentStatus.REFUND_REQUESTED);

      // Approve refund
      const appRes = payment.approveRefund(refundId);
      expect(appRes.isSuccess).toBe(true);
      expect(payment.refundRequests[0].status).toBe(RefundStatus.APPROVED);

      // Try to approve again or reject - should fail because status is not REQUESTED anymore
      const appRes2 = payment.approveRefund(refundId);
      expect(appRes2.isFailure).toBe(true);

      const rejectRes = payment.rejectRefund(refundId);
      expect(rejectRes.isFailure).toBe(true);

      // Create a second refund request to test rejection
      const refundId2 = new UniqueEntityID();
      payment.requestRefund(refundId2, Money.create(10, "USDC").value, "Late delivery");
      expect(payment.status).toBe(PaymentStatus.REFUND_REQUESTED);

      const rejRes = payment.rejectRefund(refundId2);
      expect(rejRes.isSuccess).toBe(true);
      expect(payment.refundRequests.find(r => r.id.equals(refundId2))?.status).toBe(RefundStatus.REJECTED);

      // Verify payment status went back to CONFIRMED because all remaining requests are approved/completed/rejected
      // In this case: refundId is APPROVED (active), refundId2 is REJECTED (inactive). So payment status remains REFUND_REQUESTED.
      expect(payment.status).toBe(PaymentStatus.REFUND_REQUESTED);
    });
  });

  describe("Policies and Domain Services", () => {
    it("PaymentReferenceGenerator should yield sequential reference codes", () => {
      const gen = new PaymentReferenceGenerator();
      const code = gen.generate(2027, 84).value;
      expect(code.value).toBe("PAY-2027-000084");
    });

    it("AllocationPolicy distributeFIFO should match older outstanding balances", () => {
      const policy = new AllocationPolicy();
      const invoices = [
        { id: "INV-B", balance: 50 },
        { id: "INV-A", balance: 50 }
      ];

      const distributions = policy.distributeFIFO(Money.create(80, "USDC").value, invoices);
      expect(distributions).toHaveLength(2);
      expect(distributions[0].invoiceId).toBe("INV-A"); // FIFO sorts INV-A first
      expect(distributions[0].amount.amount).toBe(50);
      expect(distributions[1].invoiceId).toBe("INV-B");
      expect(distributions[1].amount.amount).toBe(30);
    });

    it("GatewayValidationPolicy should check HTTP responses status codes", () => {
      const policy = new GatewayValidationPolicy();
      expect(policy.validateGatewayResponse(200, "Success").isSuccess).toBe(true);
      expect(policy.validateGatewayResponse(500, "Error").isFailure).toBe(true);
    });
  });

  describe("Specifications", () => {
    it("should correctly evaluate PaymentCanBeCancelled spec", () => {
      const spec = new PaymentCanBeCancelled();
      const payment = Payment.create(
        PaymentId.generate(),
        orgId,
        custId,
        payRef,
        payAmount,
        payMethod,
        invId,
        allocAmount
      ).value;

      expect(spec.isSatisfiedBy(payment)).toBe(true); // PENDING

      payment.submit(new UniqueEntityID());
      expect(spec.isSatisfiedBy(payment)).toBe(true); // SUBMITTED

      payment.confirm(new UniqueEntityID(), TransactionHash.create("0x" + "c".repeat(64)).value, ConfirmationCount.create(1).value);
      expect(spec.isSatisfiedBy(payment)).toBe(false); // CONFIRMED
    });

    it("should correctly evaluate PaymentCanBeConfirmed spec", () => {
      const spec = new PaymentCanBeConfirmed();
      const payment = Payment.create(
        PaymentId.generate(),
        orgId,
        custId,
        payRef,
        payAmount,
        payMethod,
        invId,
        allocAmount
      ).value;

      expect(spec.isSatisfiedBy(payment)).toBe(true); // PENDING

      payment.cancel();
      expect(spec.isSatisfiedBy(payment)).toBe(false); // CANCELLED
    });
  });
});
