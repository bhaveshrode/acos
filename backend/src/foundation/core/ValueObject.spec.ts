import { describe, it, expect } from "vitest";
import { ValueObject } from "./ValueObject.js";

// Mock Value Objects
interface SimpleProps {
  value: number;
  label: string;
}

class SimpleVO extends ValueObject<SimpleProps> {
  constructor(props: SimpleProps) {
    super(props);
  }
}

interface ComplexProps {
  amount: number;
  currency: string;
  tags: string[];
  created: Date;
  meta: {
    origin: string;
    nestedNull: null;
    nestedUndefined: undefined;
  };
}

class ComplexVO extends ValueObject<ComplexProps> {
  constructor(props: ComplexProps) {
    super(props);
  }
}

// Another class to test type-safety in equality checks
class SimilarVO extends ValueObject<SimpleProps> {
  constructor(props: SimpleProps) {
    super(props);
  }
}

interface NestedProps {
  id: string;
  simple: SimpleVO;
}

class NestedVO extends ValueObject<NestedProps> {
  constructor(props: NestedProps) {
    super(props);
  }
}

describe("ValueObject Base Class", () => {
  describe("Immutability (IU-005)", () => {
    it("should deep freeze properties on construction", () => {
      const vo = new ComplexVO({
        amount: 100,
        currency: "USD",
        tags: ["invoice", "payment"],
        created: new Date(),
        meta: {
          origin: "ACOS_API",
          nestedNull: null,
          nestedUndefined: undefined,
        },
      });

      // Attempting to mutate primitive properties should throw
      expect(() => {
        (vo.props as any).amount = 200;
      }).toThrow();

      // Attempting to mutate nested arrays should throw
      expect(() => {
        vo.props.tags.push("settlement");
      }).toThrow();

      // Attempting to mutate nested objects should throw
      expect(() => {
        vo.props.meta.origin = "PORTAL";
      }).toThrow();
    });
  });

  describe("Structural Equality (IU-003)", () => {
    it("should return true when comparing with identical instances", () => {
      const vo1 = new SimpleVO({ value: 10, label: "test" });
      const vo2 = new SimpleVO({ value: 10, label: "test" });
      expect(vo1.equals(vo2)).toBe(true);
    });

    it("should return false when comparing with different property values", () => {
      const vo1 = new SimpleVO({ value: 10, label: "test" });
      const vo2 = new SimpleVO({ value: 10, label: "different" });
      const vo3 = new SimpleVO({ value: 20, label: "test" });

      expect(vo1.equals(vo2)).toBe(false);
      expect(vo1.equals(vo3)).toBe(false);
    });

    it("should return false when comparing with null or undefined", () => {
      const vo = new SimpleVO({ value: 10, label: "test" });
      expect(vo.equals(null as any)).toBe(false);
      expect(vo.equals(undefined)).toBe(false);
    });

    it("should return false when comparing with different ValueObject types even if properties are identical", () => {
      const vo1 = new SimpleVO({ value: 10, label: "test" });
      const vo2 = new SimilarVO({ value: 10, label: "test" });
      expect(vo1.equals(vo2)).toBe(false);
    });

    it("should handle deep equality for nested arrays", () => {
      const date = new Date("2026-07-23T00:00:00Z");
      const vo1 = new ComplexVO({
        amount: 100,
        currency: "USD",
        tags: ["A", "B"],
        created: date,
        meta: { origin: "API", nestedNull: null, nestedUndefined: undefined },
      });

      const vo2 = new ComplexVO({
        amount: 100,
        currency: "USD",
        tags: ["A", "B"],
        created: date,
        meta: { origin: "API", nestedNull: null, nestedUndefined: undefined },
      });

      const vo3 = new ComplexVO({
        amount: 100,
        currency: "USD",
        tags: ["B", "A"], // Different order
        created: date,
        meta: { origin: "API", nestedNull: null, nestedUndefined: undefined },
      });

      expect(vo1.equals(vo2)).toBe(true);
      expect(vo1.equals(vo3)).toBe(false); // Order sensitive
    });

    it("should handle deep equality for custom nested Value Objects", () => {
      const simple1 = new SimpleVO({ value: 5, label: "A" });
      const simple2 = new SimpleVO({ value: 5, label: "A" });
      const simple3 = new SimpleVO({ value: 5, label: "B" });

      const nested1 = new NestedVO({ id: "123", simple: simple1 });
      const nested2 = new NestedVO({ id: "123", simple: simple2 });
      const nested3 = new NestedVO({ id: "123", simple: simple3 });

      expect(nested1.equals(nested2)).toBe(true);
      expect(nested1.equals(nested3)).toBe(false);
    });
  });

  describe("Hashing Consistency (IU-004)", () => {
    it("should generate the same hash code for structurally equal instances", () => {
      const date = new Date();
      const vo1 = new ComplexVO({
        amount: 100,
        currency: "USD",
        tags: ["tag1"],
        created: date,
        meta: { origin: "UI", nestedNull: null, nestedUndefined: undefined },
      });

      const vo2 = new ComplexVO({
        amount: 100,
        currency: "USD",
        tags: ["tag1"],
        created: date,
        meta: { origin: "UI", nestedNull: null, nestedUndefined: undefined },
      });

      expect(vo1.getHashCode()).toBe(vo2.getHashCode());
    });

    it("should generate different hash codes for different types with same values", () => {
      const vo1 = new SimpleVO({ value: 42, label: "test" });
      const vo2 = new SimilarVO({ value: 42, label: "test" });
      expect(vo1.getHashCode()).not.toBe(vo2.getHashCode());
    });

    it("should generate the same hash code regardless of object key initialization order", () => {
      // Create objects with key insertion orders swapped
      const objA = { x: 1, y: 2 };
      const objB = { y: 2, x: 1 };

      class DynamicKeysVO extends ValueObject<{ data: any }> {
        constructor(props: { data: any }) {
          super(props);
        }
      }

      const vo1 = new DynamicKeysVO({ data: objA });
      const vo2 = new DynamicKeysVO({ data: objB });

      expect(vo1.getHashCode()).toBe(vo2.getHashCode());
    });
  });

  describe("Serialization (IU-006)", () => {
    it("should serialize recursively to JSON", () => {
      const date = new Date("2026-07-23T06:00:00.000Z");
      const simple = new SimpleVO({ value: 5, label: "A" });
      const complex = new ComplexVO({
        amount: 100,
        currency: "USD",
        tags: ["foo"],
        created: date,
        meta: { origin: "TEST", nestedNull: null, nestedUndefined: undefined },
      });

      const nested = new NestedVO({ id: "nest-1", simple });

      expect(simple.toJSON()).toEqual({ value: 5, label: "A" });
      expect(complex.toJSON()).toEqual({
        amount: 100,
        currency: "USD",
        tags: ["foo"],
        created: "2026-07-23T06:00:00.000Z",
        meta: { origin: "TEST", nestedNull: null, nestedUndefined: undefined },
      });
      expect(nested.toJSON()).toEqual({
        id: "nest-1",
        simple: { value: 5, label: "A" },
      });
    });
  });
});
