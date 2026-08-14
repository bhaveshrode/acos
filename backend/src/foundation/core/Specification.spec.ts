import { describe, it, expect } from "vitest";
import { Specification, AndSpecification, OrSpecification, NotSpecification } from "./Specification.js";

// Mock candidates
interface MockInvoice {
  amount: number;
  status: "DRAFT" | "ISSUED" | "PAID" | "CANCELLED";
  isOverdue: boolean;
}

// Mock specifications
class IsPaidInvoice extends Specification<MockInvoice> {
  public isSatisfiedBy(candidate: MockInvoice): boolean {
    return candidate.status === "PAID";
  }
}

class IsDraftInvoice extends Specification<MockInvoice> {
  public isSatisfiedBy(candidate: MockInvoice): boolean {
    return candidate.status === "DRAFT";
  }
}

class IsOverdueInvoice extends Specification<MockInvoice> {
  public isSatisfiedBy(candidate: MockInvoice): boolean {
    return candidate.isOverdue;
  }
}

class InvoiceAmountAboveLimit extends Specification<MockInvoice> {
  constructor(private readonly limit: number) {
    super();
  }

  public isSatisfiedBy(candidate: MockInvoice): boolean {
    return candidate.amount > this.limit;
  }
}

describe("Specification Pattern (IU-007)", () => {
  const isPaid = new IsPaidInvoice();
  const isDraft = new IsDraftInvoice();
  const isOverdue = new IsOverdueInvoice();
  const isLargeAmount = new InvoiceAmountAboveLimit(1000);

  describe("Simple Specifications", () => {
    it("should evaluate a simple predicate correctly", () => {
      const invoice: MockInvoice = { amount: 500, status: "PAID", isOverdue: false };
      expect(isPaid.isSatisfiedBy(invoice)).toBe(true);
      expect(isDraft.isSatisfiedBy(invoice)).toBe(false);
    });
  });

  describe("AND Composition", () => {
    it("should return true only when both specifications are satisfied", () => {
      const largeOverdueInvoice: MockInvoice = { amount: 1500, status: "ISSUED", isOverdue: true };
      const largeOnTimeInvoice: MockInvoice = { amount: 1500, status: "ISSUED", isOverdue: false };
      const smallOverdueInvoice: MockInvoice = { amount: 500, status: "ISSUED", isOverdue: true };

      const largeAndOverdue = isLargeAmount.and(isOverdue);

      expect(largeAndOverdue.isSatisfiedBy(largeOverdueInvoice)).toBe(true);
      expect(largeAndOverdue.isSatisfiedBy(largeOnTimeInvoice)).toBe(false);
      expect(largeAndOverdue.isSatisfiedBy(smallOverdueInvoice)).toBe(false);
    });

    it("should throw an error if instantiating AndSpecification with missing parameters", () => {
      expect(() => new AndSpecification(null as any, isPaid)).toThrow();
      expect(() => new AndSpecification(isPaid, undefined as any)).toThrow();
    });
  });

  describe("OR Composition", () => {
    it("should return true if either specification is satisfied", () => {
      const draftInvoice: MockInvoice = { amount: 500, status: "DRAFT", isOverdue: false };
      const paidInvoice: MockInvoice = { amount: 500, status: "PAID", isOverdue: false };
      const issuedInvoice: MockInvoice = { amount: 500, status: "ISSUED", isOverdue: false };

      const draftOrPaid = isDraft.or(isPaid);

      expect(draftOrPaid.isSatisfiedBy(draftInvoice)).toBe(true);
      expect(draftOrPaid.isSatisfiedBy(paidInvoice)).toBe(true);
      expect(draftOrPaid.isSatisfiedBy(issuedInvoice)).toBe(false);
    });

    it("should throw an error if instantiating OrSpecification with missing parameters", () => {
      expect(() => new OrSpecification(null as any, isPaid)).toThrow();
      expect(() => new OrSpecification(isPaid, undefined as any)).toThrow();
    });
  });

  describe("NOT Composition", () => {
    it("should negate the underlying specification evaluation", () => {
      const draftInvoice: MockInvoice = { amount: 500, status: "DRAFT", isOverdue: false };
      const paidInvoice: MockInvoice = { amount: 500, status: "PAID", isOverdue: false };

      const isNotPaid = isPaid.not();

      expect(isNotPaid.isSatisfiedBy(draftInvoice)).toBe(true);
      expect(isNotPaid.isSatisfiedBy(paidInvoice)).toBe(false);
    });

    it("should throw an error if instantiating NotSpecification with missing parameters", () => {
      expect(() => new NotSpecification(null as any)).toThrow();
    });
  });

  describe("Nested and Chained Logical Specifications", () => {
    it("should evaluate complex chained specifications correctly", () => {
      // Rule: An invoice can be processed if:
      // (It is DRAFT) OR (It is Overdue AND it is not Paid)
      const canProcessRule = isDraft.or(isOverdue.and(isPaid.not()));

      const draftInvoice: MockInvoice = { amount: 100, status: "DRAFT", isOverdue: false };
      const unpaidOverdue: MockInvoice = { amount: 100, status: "ISSUED", isOverdue: true };
      const paidOverdue: MockInvoice = { amount: 100, status: "PAID", isOverdue: true };
      const typicalIssued: MockInvoice = { amount: 100, status: "ISSUED", isOverdue: false };

      expect(canProcessRule.isSatisfiedBy(draftInvoice)).toBe(true);      // Satisfies Left branch (isDraft)
      expect(canProcessRule.isSatisfiedBy(unpaidOverdue)).toBe(true);     // Satisfies Right branch (isOverdue AND NOT paid)
      expect(canProcessRule.isSatisfiedBy(paidOverdue)).toBe(false);      // Fails Right branch (isPaid is true)
      expect(canProcessRule.isSatisfiedBy(typicalIssued)).toBe(false);    // Fails both branches
    });

    it("should evaluate complex specifications with multiple nesting levels", () => {
      // Rule: (Large Amount AND Overdue) AND (NOT (Draft OR Paid))
      const complexRule = isLargeAmount.and(isOverdue).and(isDraft.or(isPaid).not());

      const target1: MockInvoice = { amount: 2000, status: "ISSUED", isOverdue: true };  // true AND true AND NOT(false) -> true
      const target2: MockInvoice = { amount: 2000, status: "PAID", isOverdue: true };    // true AND true AND NOT(true) -> false
      const target3: MockInvoice = { amount: 500, status: "ISSUED", isOverdue: true };    // false AND true AND NOT(false) -> false

      expect(complexRule.isSatisfiedBy(target1)).toBe(true);
      expect(complexRule.isSatisfiedBy(target2)).toBe(false);
      expect(complexRule.isSatisfiedBy(target3)).toBe(false);
    });
  });
});
