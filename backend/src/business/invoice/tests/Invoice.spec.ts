import { describe, it, expect } from "vitest";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
import { InvoiceId } from "../value-objects/InvoiceId.js";
import { InvoiceNumber } from "../value-objects/InvoiceNumber.js";
import { Money } from "../value-objects/Money.js";
import { Quantity } from "../value-objects/Quantity.js";
import { UnitPrice } from "../value-objects/UnitPrice.js";
import { TaxRate } from "../value-objects/TaxRate.js";
import { Discount } from "../value-objects/Discount.js";
import { DueDate } from "../value-objects/DueDate.js";
import { InvoicePeriod } from "../value-objects/InvoicePeriod.js";
import { PaymentTerms } from "../value-objects/PaymentTerms.js";
import { InvoiceLine } from "../entities/InvoiceLine.js";
import { InvoiceNote } from "../entities/InvoiceNote.js";
import { Invoice } from "../aggregates/Invoice.js";
import { InvoiceStatus } from "../enums/InvoiceStatus.js";
import { DiscountType } from "../enums/DiscountType.js";
import { OrganizationId } from "../../organization/value-objects/OrganizationId.js";
import { CustomerId } from "../../customer/value-objects/CustomerId.js";

import { InvoiceNumberGenerator } from "../services/InvoiceNumberGenerator.js";
import { TaxCalculator } from "../services/TaxCalculator.js";
import { PricingPolicy } from "../services/PricingPolicy.js";
import { InvoicePolicy } from "../services/InvoicePolicy.js";

describe("Invoice Bounded Context Unit Tests (Tasks 14.2 - 14.5)", () => {
  const orgId = OrganizationId.generate();
  const custId = CustomerId.generate();
  const invNumber = InvoiceNumber.create("INV-2027-000001").value;
  const payTerms = PaymentTerms.create("NET_30").value;
  const issueDate = new Date();
  const dueDate = DueDate.create(payTerms.calculateDueDate(issueDate)).value;

  describe("Value Objects", () => {
    it("should enforce currency mismatch checks on Money math operations", () => {
      const usdMoney = Money.create(100, "USD").value;
      const eurMoney = Money.create(100, "EUR").value;

      const addRes = usdMoney.add(eurMoney);
      expect(addRes.isFailure).toBe(true);
      expect(addRes.error.message).toContain("Currency mismatch");
    });

    it("should validate TaxRate bounds", () => {
      expect(TaxRate.create(20).isSuccess).toBe(true);
      expect(TaxRate.create(-5).isFailure).toBe(true);
      expect(TaxRate.create(105).isFailure).toBe(true);
    });

    it("should calculate payment terms offsets", () => {
      const terms = PaymentTerms.create("NET_15").value;
      const start = new Date("2026-01-01T00:00:00.000Z");
      const offset = terms.calculateDueDate(start);
      expect(offset.getDate()).toBe(16); // 1 + 15
    });
  });

  describe("Invoice Aggregate & Pricing Invariants", () => {
    it("should create invoice in DRAFT status with zero totals", () => {
      const invoice = Invoice.create(
        InvoiceId.generate(),
        orgId,
        custId,
        invNumber,
        "USD",
        payTerms,
        issueDate,
        dueDate
      ).value;

      expect(invoice.status).toBe(InvoiceStatus.DRAFT);
      expect(invoice.grandTotal.amount).toBe(0);
      expect(invoice.lines).toHaveLength(0);
    });

    it("should recalculate subtotal, taxes, and grand totals upon adding line items", () => {
      const invoice = Invoice.create(
        InvoiceId.generate(),
        orgId,
        custId,
        invNumber,
        "USD",
        payTerms,
        issueDate,
        dueDate
      ).value;

      const unitPrice = UnitPrice.create(Money.create(50, "USD").value).value;
      const addRes = invoice.addLineItem(
        new UniqueEntityID(),
        "Development Services",
        Quantity.create(2).value, // Total 100
        unitPrice,
        TaxRate.create(10).value // Tax 10
      );

      expect(addRes.isSuccess).toBe(true);
      expect(invoice.subtotal.amount).toBe(100);
      expect(invoice.taxTotal.amount).toBe(10);
      expect(invoice.grandTotal.amount).toBe(110);
    });

    it("should apply percentage and fixed discounts correctly", () => {
      const invoice = Invoice.create(
        InvoiceId.generate(),
        orgId,
        custId,
        invNumber,
        "USD",
        payTerms,
        issueDate,
        dueDate
      ).value;

      invoice.addLineItem(
        new UniqueEntityID(),
        "Item A",
        Quantity.create(1).value,
        UnitPrice.create(Money.create(100, "USD").value).value,
        TaxRate.create(10).value // Tax 10, Subtotal 100
      );

      // Apply 10% discount
      invoice.updateDiscount(Discount.create(DiscountType.PERCENTAGE, 10).value);
      expect(invoice.discountTotal.amount).toBe(10); // 10% of 100
      expect(invoice.grandTotal.amount).toBe(100); // 100 + 10 - 10
    });

    it("should lock issued invoices from any financial mutations", () => {
      const invoice = Invoice.create(
        InvoiceId.generate(),
        orgId,
        custId,
        invNumber,
        "USD",
        payTerms,
        issueDate,
        dueDate
      ).value;

      invoice.addLineItem(
        new UniqueEntityID(),
        "Consulting",
        Quantity.create(1).value,
        UnitPrice.create(Money.create(100, "USD").value).value,
        TaxRate.create(0).value
      );

      expect(invoice.issue().isSuccess).toBe(true);
      expect(invoice.status).toBe(InvoiceStatus.ISSUED);

      // Attempt to modify lines
      const badAdd = invoice.addLineItem(
        new UniqueEntityID(),
        "Extra line",
        Quantity.create(1).value,
        UnitPrice.create(Money.create(100, "USD").value).value,
        TaxRate.create(0).value
      );
      expect(badAdd.isFailure).toBe(true);
      expect(badAdd.error.message).toContain("Issued invoices are immutable");
    });

    it("should transition status based on confirmed payments", () => {
      const invoice = Invoice.create(
        InvoiceId.generate(),
        orgId,
        custId,
        invNumber,
        "USD",
        payTerms,
        issueDate,
        dueDate
      ).value;

      invoice.addLineItem(
        new UniqueEntityID(),
        "Services",
        Quantity.create(1).value,
        UnitPrice.create(Money.create(100, "USD").value).value,
        TaxRate.create(0).value // Grand total = 100
      );
      invoice.issue();

      // Record partial payment
      invoice.recordPayment(Money.create(40, "USD").value);
      expect(invoice.status).toBe(InvoiceStatus.PARTIALLY_PAID);

      // Record full payment
      invoice.recordPayment(Money.create(100, "USD").value);
      expect(invoice.status).toBe(InvoiceStatus.PAID);
    });
  });

  describe("Domain Services and Policies", () => {
    it("InvoiceNumberGenerator should build properly padded serial codes", () => {
      const gen = new InvoiceNumberGenerator();
      const code = gen.generate(2027, 42).value;
      expect(code.value).toBe("INV-2027-000042");
    });

    it("PricingPolicy should aggregate totals correctly", () => {
      const policy = new PricingPolicy();
      const res = policy.calculateGrandTotal(
        Money.create(100, "USD").value,
        Money.create(15, "USD").value,
        Discount.create(DiscountType.FIXED, 10).value
      );
      expect(res.isSuccess).toBe(true);
      expect(res.value.amount).toBe(105);
    });
  });
});
