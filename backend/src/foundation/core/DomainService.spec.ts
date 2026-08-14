import { describe, it, expect } from "vitest";
import { DomainService } from "./DomainService.js";

// Mock Domain Service simulating stateless business logic
class MockTaxCalculator extends DomainService {
  constructor() {
    super();
  }

  // Pure stateless calculation function
  public calculateTax(amount: number, taxRatePercentage: number): number {
    if (amount < 0 || taxRatePercentage < 0) {
      throw new Error("Values must be non-negative.");
    }
    return (amount * taxRatePercentage) / 100;
  }
}

describe("DomainService Base Marker (IU-002)", () => {
  it("should allow a subclass to be instantiated and recognized as a DomainService", () => {
    const service = new MockTaxCalculator();
    expect(service).toBeInstanceOf(DomainService);
  });

  it("should perform stateless business operations correctly", () => {
    const service = new MockTaxCalculator();
    const tax = service.calculateTax(100, 15);
    expect(tax).toBe(15);
  });

  it("should fail calculation on invalid negative values", () => {
    const service = new MockTaxCalculator();
    expect(() => service.calculateTax(-100, 15)).toThrow("Values must be non-negative.");
    expect(() => service.calculateTax(100, -15)).toThrow("Values must be non-negative.");
  });
});
