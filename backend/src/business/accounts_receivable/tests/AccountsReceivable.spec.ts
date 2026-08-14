import { describe, it, expect } from "vitest";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
import { ReceivableAccountId } from "../value-objects/ReceivableAccountId.js";
import { OutstandingBalance } from "../value-objects/OutstandingBalance.js";
import { AgingBucket } from "../value-objects/AgingBucket.js";
import { CreditAmount } from "../value-objects/CreditAmount.js";
import { CollectionReference } from "../value-objects/CollectionReference.js";
import { WriteOffAmount } from "../value-objects/WriteOffAmount.js";
import { ReceivablePeriod } from "../value-objects/ReceivablePeriod.js";
import { AccountBalance } from "../value-objects/AccountBalance.js";
import { CollectionPriority } from "../value-objects/CollectionPriority.js";
import { CreditReason } from "../value-objects/CreditReason.js";

import { ReceivableEntry } from "../entities/ReceivableEntry.js";
import { PaymentApplication } from "../entities/PaymentApplication.js";
import { CustomerCredit } from "../entities/CustomerCredit.js";
import { CollectionAction } from "../entities/CollectionAction.js";

import { AccountsReceivable } from "../aggregates/AccountsReceivable.js";

import { ReceivableStatus } from "../enums/ReceivableStatus.js";
import { AgingCategory } from "../enums/AgingCategory.js";
import { CollectionStatus } from "../enums/CollectionStatus.js";
import { CreditSource } from "../enums/CreditSource.js";

import { OrganizationId } from "../../organization/value-objects/OrganizationId.js";
import { CustomerId } from "../../customer/value-objects/CustomerId.js";
import { SettlementId } from "../../settlement/value-objects/SettlementId.js";
import { InvoiceId } from "../../invoice/value-objects/InvoiceId.js";
import { UserId } from "../../identity/value-objects/UserId.js";
import { Money } from "../../invoice/value-objects/Money.js";

import { AgingPolicy } from "../services/AgingPolicy.js";
import { CollectionPolicy } from "../services/CollectionPolicy.js";
import { CreditAllocationPolicy } from "../services/CreditAllocationPolicy.js";
import { ReceivablePolicy } from "../services/ReceivablePolicy.js";

import { ReceivableCanBeClosed } from "../specifications/ReceivableCanBeClosed.js";
import { ReceivableCanBeWrittenOff } from "../specifications/ReceivableCanBeWrittenOff.js";

describe("Accounts Receivable Bounded Context Unit Tests", () => {
  const orgId = OrganizationId.generate();
  const custId = CustomerId.generate();
  const accId = ReceivableAccountId.generate();

  describe("Value Objects", () => {
    it("should validate OutstandingBalance non-negative rules", () => {
      expect(OutstandingBalance.create(Money.create(0, "USDC").value).isSuccess).toBe(true);
      expect(OutstandingBalance.create(Money.create(100, "USDC").value).isSuccess).toBe(true);
      expect(OutstandingBalance.create(Money.create(-5, "USDC").value).isFailure).toBe(true);
    });

    it("should validate AgingBucket rules", () => {
      const bucket = AgingBucket.create(AgingCategory.DAYS_1_TO_30, Money.create(50, "USDC").value);
      expect(bucket.isSuccess).toBe(true);
      expect(bucket.value.category).toBe(AgingCategory.DAYS_1_TO_30);
      expect(bucket.value.amount.amount).toBe(50);
    });

    it("should validate CreditAmount non-negative rules", () => {
      expect(CreditAmount.create(Money.create(0, "USDC").value).isSuccess).toBe(true);
      expect(CreditAmount.create(Money.create(-10, "USDC").value).isFailure).toBe(true);
    });

    it("should validate CollectionReference pattern", () => {
      expect(CollectionReference.create("COL-2027-001").isSuccess).toBe(true);
      expect(CollectionReference.create("BAD-01").isFailure).toBe(true);
    });

    it("should validate WriteOffAmount non-negative rules", () => {
      expect(WriteOffAmount.create(Money.create(0, "USDC").value).isSuccess).toBe(true);
      expect(WriteOffAmount.create(Money.create(-5, "USDC").value).isFailure).toBe(true);
    });

    it("should validate ReceivablePeriod rules", () => {
      expect(ReceivablePeriod.create("2027-Q1").isSuccess).toBe(true);
      expect(ReceivablePeriod.create("").isFailure).toBe(true);
    });

    it("should validate AccountBalance logic", () => {
      const out = OutstandingBalance.create(Money.create(100, "USDC").value).value;
      const cred = CreditAmount.create(Money.create(30, "USDC").value).value;
      const bal = AccountBalance.create(out, cred, "USDC").value;

      expect(bal.netBalanceAmount).toBe(70);
      expect(bal.currency).toBe("USDC");

      // Currency mismatch validation
      const badCred = CreditAmount.create(Money.create(30, "EUR").value).value;
      const err = AccountBalance.create(out, badCred, "USDC");
      expect(err.isFailure).toBe(true);
    });

    it("should validate CollectionPriority values", () => {
      expect(CollectionPriority.create("CRITICAL").isSuccess).toBe(true);
      expect(CollectionPriority.create("high").isSuccess).toBe(true);
      expect(CollectionPriority.create("ULTRA").isFailure).toBe(true);
    });

    it("should validate CreditReason non-empty rules", () => {
      expect(CreditReason.create("Overpayment").isSuccess).toBe(true);
      expect(CreditReason.create("   ").isFailure).toBe(true);
    });
  });

  describe("AccountsReceivable Aggregate & Invariants", () => {
    it("should initialize account with CURRENT status and empty balances", () => {
      const ar = AccountsReceivable.create(accId, orgId, custId).value;

      expect(ar.status).toBe(ReceivableStatus.CURRENT);
      expect(ar.collectionStatus).toBe(CollectionStatus.NONE);
      expect(ar.entries).toHaveLength(0);
      expect(ar.customerCredits).toHaveLength(0);
      expect(ar.domainEvents[0].eventName).toBe("ReceivableCreated");
    });

    it("should allow registering invoice debt entries", () => {
      const ar = AccountsReceivable.create(accId, orgId, custId).value;
      const invId = InvoiceId.generate();

      const res = ar.addInvoice(new UniqueEntityID(), invId, Money.create(100, "USDC").value, new Date());
      expect(res.isSuccess).toBe(true);
      expect(ar.entries).toHaveLength(1);
      expect(ar.getOutstandingBalance("USDC").amount).toBe(100);

      // Verify events
      const events = ar.domainEvents.map((e) => e.eventName);
      expect(events).toContain("OutstandingBalanceUpdated");
      expect(events).toContain("AccountBalanceUpdated");
    });

    it("should log payment applications, reduce balance, and create overpayment credits", () => {
      const ar = AccountsReceivable.create(accId, orgId, custId).value;
      const invId = InvoiceId.generate();
      const setId = SettlementId.generate();
      const policy = new CreditAllocationPolicy();

      ar.addInvoice(new UniqueEntityID(), invId, Money.create(100, "USDC").value, new Date());

      // Apply payment of 120 (100 paid off, 20 credit created)
      const res = ar.applyPayment(
        new UniqueEntityID(),
        setId,
        invId,
        Money.create(120, "USDC").value,
        policy
      );

      expect(res.isSuccess).toBe(true);
      expect(ar.entries[0].remainingBalance.amount).toBe(0);
      expect(ar.entries[0].isPaid).toBe(true);

      // Verify payment application
      expect(ar.paymentApplications).toHaveLength(1);
      expect(ar.paymentApplications[0].appliedAmount.amount).toBe(100);

      // Verify overpayment credit
      expect(ar.customerCredits).toHaveLength(1);
      expect(ar.customerCredits[0].remainingBalance.amount).toBe(20);
      expect(ar.customerCredits[0].source).toBe(CreditSource.OVERPAYMENT);

      // Net outstanding balance is 0
      expect(ar.getOutstandingBalance("USDC").amount).toBe(0);
      expect(ar.getCreditBalance("USDC").amount).toBe(20);
    });

    it("should allow applying unapplied credit to outstanding invoices", () => {
      const ar = AccountsReceivable.create(accId, orgId, custId).value;
      const invId = InvoiceId.generate();
      const policy = new CreditAllocationPolicy();

      // Setup: 100 debt, 40 unapplied manual credit
      ar.addInvoice(new UniqueEntityID(), invId, Money.create(100, "USDC").value, new Date());

      // Directly push manual credit (simplifying test setup)
      const creditId = new UniqueEntityID();
      ar.applyPayment(creditId, SettlementId.generate(), InvoiceId.generate(), Money.create(40, "USDC").value, policy); // unregistered invoice yields credit
      expect(ar.customerCredits).toHaveLength(1);
      expect(ar.customerCredits[0].remainingBalance.amount).toBe(40);

      // Apply credit of 30 against invoice debt
      const res = ar.applyCredit(ar.customerCredits[0].id, invId, Money.create(30, "USDC").value);
      expect(res.isSuccess).toBe(true);
      expect(ar.entries[0].remainingBalance.amount).toBe(70);
      expect(ar.customerCredits[0].remainingBalance.amount).toBe(10);
    });

    it("should support debt write-off operations", () => {
      const ar = AccountsReceivable.create(accId, orgId, custId).value;
      const invId = InvoiceId.generate();
      const policy = new ReceivablePolicy();

      ar.addInvoice(new UniqueEntityID(), invId, Money.create(100, "USDC").value, new Date());

      // Write-off 40 USDC
      const res = ar.writeOff(Money.create(40, "USDC").value, UserId.generate(), policy);
      expect(res.isSuccess).toBe(true);
      expect(ar.entries[0].remainingBalance.amount).toBe(60);
      expect(ar.status).toBe(ReceivableStatus.WRITTEN_OFF);
      expect(ar.domainEvents.map(e => e.eventName)).toContain("ReceivableWrittenOff");
    });

    it("should support overdue and collections escalation workflow states", () => {
      const ar = AccountsReceivable.create(accId, orgId, custId).value;
      const invId = InvoiceId.generate();
      ar.addInvoice(new UniqueEntityID(), invId, Money.create(100, "USDC").value, new Date());

      // Trigger overdue
      expect(ar.triggerOverdue(invId).isSuccess).toBe(true);
      expect(ar.status).toBe(ReceivableStatus.OVERDUE);
      expect(ar.domainEvents.map(e => e.eventName)).toContain("InvoiceOverdue");

      // Start collection
      const priority = CollectionPriority.create("HIGH").value;
      expect(ar.startCollection("Delinquent debt", priority).isSuccess).toBe(true);
      expect(ar.status).toBe(ReceivableStatus.IN_COLLECTIONS);
      expect(ar.collectionStatus).toBe(CollectionStatus.REMINDER_SENT);

      // Log collection action
      expect(ar.logCollectionAction(new UniqueEntityID(), "Call", "Customer promised payment", UserId.generate()).isSuccess).toBe(true);
      expect(ar.collectionActions).toHaveLength(1);
    });

    it("should block changes once account is CLOSED, and support reopen", () => {
      const ar = AccountsReceivable.create(accId, orgId, custId).value;
      const policy = new ReceivablePolicy();

      // Closed check
      expect(ar.close(policy).isSuccess).toBe(true);
      expect(ar.status).toBe(ReceivableStatus.CLOSED);

      // Add invoice should now fail
      const badInv = ar.addInvoice(new UniqueEntityID(), InvoiceId.generate(), Money.create(100, "USDC").value, new Date());
      expect(badInv.isFailure).toBe(true);

      // Reopen
      expect(ar.reopen(policy).isSuccess).toBe(true);
      expect(ar.status).toBe(ReceivableStatus.CURRENT);

      // Now add invoice succeeds
      expect(ar.addInvoice(new UniqueEntityID(), InvoiceId.generate(), Money.create(100, "USDC").value, new Date()).isSuccess).toBe(true);
    });
  });

  describe("Domain Services & Specifications", () => {
    it("AgingPolicy should sort entries correctly based on references date", () => {
      const ar = AccountsReceivable.create(accId, orgId, custId).value;
      const policy = new AgingPolicy();
      
      const referenceDate = new Date("2026-07-23T12:00:00Z");

      // Entry 1: Current (due in future)
      ar.addInvoice(new UniqueEntityID(), InvoiceId.generate(), Money.create(10, "USDC").value, new Date("2026-07-25T12:00:00Z"));
      // Entry 2: Overdue 15 days
      ar.addInvoice(new UniqueEntityID(), InvoiceId.generate(), Money.create(20, "USDC").value, new Date("2026-07-08T12:00:00Z"));
      // Entry 3: Overdue 45 days
      ar.addInvoice(new UniqueEntityID(), InvoiceId.generate(), Money.create(30, "USDC").value, new Date("2026-06-08T12:00:00Z"));
      // Entry 4: Overdue 100 days
      ar.addInvoice(new UniqueEntityID(), InvoiceId.generate(), Money.create(40, "USDC").value, new Date("2026-04-14T12:00:00Z"));

      const buckets = policy.calculateAgingBuckets(ar, referenceDate, "USDC");

      expect(buckets).toHaveLength(5);
      expect(buckets.find(b => b.category === AgingCategory.CURRENT)?.amount.amount).toBe(10);
      expect(buckets.find(b => b.category === AgingCategory.DAYS_1_TO_30)?.amount.amount).toBe(20);
      expect(buckets.find(b => b.category === AgingCategory.DAYS_31_TO_60)?.amount.amount).toBe(30);
      expect(buckets.find(b => b.category === AgingCategory.DAYS_61_TO_90)?.amount.amount).toBe(0);
      expect(buckets.find(b => b.category === AgingCategory.OVER_90_DAYS)?.amount.amount).toBe(40);
    });

    it("CollectionPolicy should identify reminders and escalations", () => {
      const ar = AccountsReceivable.create(accId, orgId, custId).value;
      const policy = new CollectionPolicy();
      
      const referenceDate = new Date("2026-07-23T12:00:00Z");

      ar.addInvoice(new UniqueEntityID(), InvoiceId.generate(), Money.create(10, "USDC").value, new Date("2026-07-22T12:00:00Z")); // Overdue by 1 day
      expect(policy.isEligibleForReminder(ar, referenceDate)).toBe(true);
      expect(policy.isEligibleForEscalation(ar, referenceDate)).toBe(false);

      ar.addInvoice(new UniqueEntityID(), InvoiceId.generate(), Money.create(20, "USDC").value, new Date("2026-06-20T12:00:00Z")); // Overdue by 33 days
      expect(policy.isEligibleForEscalation(ar, referenceDate)).toBe(true);
      expect(policy.isEligibleForLegalReview(ar, referenceDate)).toBe(false);
    });

    it("CreditAllocationPolicy distributeCreditsFIFO should yield oldest applications", () => {
      const ar = AccountsReceivable.create(accId, orgId, custId).value;
      const allocationPolicy = new CreditAllocationPolicy();
      const paymentPolicy = new CreditAllocationPolicy();

      // Invoice A (Due 2026-07-10) - 50 USDC
      ar.addInvoice(new UniqueEntityID(), InvoiceId.generate(), Money.create(50, "USDC").value, new Date("2026-07-10T12:00:00Z"));
      // Invoice B (Due 2026-07-20) - 50 USDC
      ar.addInvoice(new UniqueEntityID(), InvoiceId.generate(), Money.create(50, "USDC").value, new Date("2026-07-20T12:00:00Z"));

      // Setup 60 USDC credit
      ar.applyPayment(new UniqueEntityID(), SettlementId.generate(), InvoiceId.generate(), Money.create(60, "USDC").value, paymentPolicy);

      const allocations = allocationPolicy.distributeCreditsFIFO(ar, "USDC");
      expect(allocations).toHaveLength(2);
      expect(allocations[0].amount.amount).toBe(50); // Matches entire Invoice A
      expect(allocations[1].amount.amount).toBe(10); // Matches remainder on Invoice B
    });

    it("specifications should check closed and write-off states", () => {
      const closedSpec = new ReceivableCanBeClosed();
      const writeOffSpec = new ReceivableCanBeWrittenOff();

      const ar = AccountsReceivable.create(accId, orgId, custId).value;

      expect(closedSpec.isSatisfiedBy(ar)).toBe(true); // No unpaid debt
      expect(writeOffSpec.isSatisfiedBy(ar)).toBe(true);

      // Add unpaid invoice
      ar.addInvoice(new UniqueEntityID(), InvoiceId.generate(), Money.create(10, "USDC").value, new Date());
      expect(closedSpec.isSatisfiedBy(ar)).toBe(false);
      expect(writeOffSpec.isSatisfiedBy(ar)).toBe(true);

      // Perform write-off
      ar.writeOff(Money.create(10, "USDC").value, UserId.generate(), new ReceivablePolicy());
      expect(closedSpec.isSatisfiedBy(ar)).toBe(true);
      expect(writeOffSpec.isSatisfiedBy(ar)).toBe(false);
    });
  });
});
