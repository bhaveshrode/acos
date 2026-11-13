import { describe, expect, it } from "vitest";
import { Money } from "./Money.js";

const usd = (amount: number): Money => Money.create(amount, "USD").value;

describe("Money", () => {
  describe("creation", () => {
    it("normalizes the currency code", () => {
      expect(Money.create(10, " usd ").value.currency).toBe("USD");
    });

    it("rounds to the currency exponent", () => {
      expect(Money.create(10.5, "USD").value.minorUnits).toBe(1050);
      expect(Money.create(10.004, "USD").value.minorUnits).toBe(1000);
      expect(Money.create(10.006, "USD").value.minorUnits).toBe(1001);
    });

    it("rejects non-finite amounts", () => {
      expect(Money.create(Number.NaN, "USD").isFailure).toBe(true);
      expect(Money.create(Number.POSITIVE_INFINITY, "USD").isFailure).toBe(true);
    });

    it("rejects malformed currency codes", () => {
      expect(Money.create(10, "").isFailure).toBe(true);
      expect(Money.create(10, "US").isFailure).toBe(true);
      expect(Money.create(10, "US1").isFailure).toBe(true);
    });

    it("rejects amounts that cannot be represented exactly", () => {
      expect(Money.create(1e15, "USD").isFailure).toBe(true);
    });

    it("creates a zero amount", () => {
      expect(Money.zero("usd").amount).toBe(0);
      expect(Money.zero("usd").currency).toBe("USD");
    });
  });

  describe("currency exponents", () => {
    it("uses zero decimals for JPY", () => {
      expect(Money.create(1500, "JPY").value.minorUnits).toBe(1500);
      expect(usd(1500).minorUnits).toBe(150000);
    });

    it("uses three decimals for KWD", () => {
      expect(Money.create(1.234, "KWD").value.minorUnits).toBe(1234);
      expect(Money.create(1.234, "KWD").value.amount).toBe(1.234);
    });

    it("defaults to two decimals for currencies without an exception", () => {
      expect(Money.create(1.234, "CHF").value.minorUnits).toBe(123);
    });
  });

  describe("arithmetic", () => {
    it("adds without floating point drift", () => {
      const sum = usd(0.1).add(usd(0.2)).value;
      expect(sum.amount).toBe(0.3);
      expect(sum.minorUnits).toBe(30);
      expect(sum.equals(usd(0.3))).toBe(true);
    });

    it("subtracts without floating point drift", () => {
      const difference = usd(1.1).subtract(usd(0.9)).value;
      expect(difference.amount).toBe(0.2);
      expect(difference.minorUnits).toBe(20);
    });

    it("refuses to add different currencies", () => {
      const result = usd(10).add(Money.create(10, "EUR").value);
      expect(result.isFailure).toBe(true);
      expect(result.error.message).toContain("Currency mismatch");
    });

    it("refuses to subtract different currencies", () => {
      const result = usd(10).subtract(Money.create(10, "EUR").value);
      expect(result.isFailure).toBe(true);
    });
  });

  describe("multiplication", () => {
    it("returns a Result and rounds half away from zero", () => {
      expect(usd(10).multiply(0.15).value.amount).toBe(1.5);
      expect(usd(1).multiply(0.005).value.minorUnits).toBe(1);
      expect(usd(-1).multiply(0.005).value.minorUnits).toBe(-1);
    });

    it("rejects non-finite multipliers", () => {
      expect(usd(10).multiply(Number.NaN).isFailure).toBe(true);
      expect(usd(10).multiply(Number.POSITIVE_INFINITY).isFailure).toBe(true);
    });

    it("rejects products that overflow", () => {
      expect(usd(1e12).multiply(1e6).isFailure).toBe(true);
    });
  });

  describe("minor units", () => {
    it("round-trips through fromMinorUnits", () => {
      const money = Money.fromMinorUnits(12345, "USD").value;
      expect(money.amount).toBe(123.45);
      expect(money.minorUnits).toBe(12345);
    });

    it("rejects non-integer minor units", () => {
      expect(Money.fromMinorUnits(12.5, "USD").isFailure).toBe(true);
    });

    it("treats equal amounts as equal regardless of input scale", () => {
      expect(usd(10).equals(usd(10.0))).toBe(true);
      expect(usd(10).equals(usd(10.01))).toBe(false);
    });
  });
});
