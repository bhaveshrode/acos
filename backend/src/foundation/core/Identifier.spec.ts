import { describe, it, expect } from "vitest";
import { Identifier, UniqueEntityID } from "./Identifier.js";

// Custom Mock Identifiers
class UserId extends Identifier<string> {
  constructor(value: string) {
    super(value);
  }
}

class InvoiceId extends Identifier<string> {
  constructor(value: string) {
    super(value);
  }
}

class NumericId extends Identifier<number> {
  constructor(value: number) {
    super(value);
  }
}

describe("Identifier Primitive (IU-007)", () => {
  describe("Validation & Creation (IU-005)", () => {
    it("should allow creating custom string and numeric identifiers", () => {
      const userId = new UserId("user_999");
      const numId = new NumericId(12345);
      
      expect(userId.value).toBe("user_999");
      expect(numId.value).toBe(12345);
    });

    it("should throw an error on null or undefined value", () => {
      expect(() => new (UserId as any)(null)).toThrow("Identifier value cannot be null or undefined.");
      expect(() => new (UserId as any)(undefined)).toThrow("Identifier value cannot be null or undefined.");
    });

    it("should throw an error on empty string value", () => {
      expect(() => new UserId("")).toThrow("Identifier value cannot be empty.");
      expect(() => new UserId("   ")).toThrow("Identifier value cannot be empty.");
    });
  });

  describe("Immutability (IU-002)", () => {
    it("should freeze properties and prevent value modifications", () => {
      const id = new UserId("user-1");
      expect(() => {
        (id as any).value = "user-2";
      }).toThrow();
      expect(() => {
        (id.props as any).value = "user-2";
      }).toThrow();
    });
  });

  describe("Equality Semantics (IU-003)", () => {
    it("should return true when comparing equal identifiers of same class", () => {
      const id1 = new UserId("abc");
      const id2 = new UserId("abc");
      expect(id1.equals(id2)).toBe(true);
    });

    it("should return false when comparing different values of same class", () => {
      const id1 = new UserId("abc");
      const id2 = new UserId("def");
      expect(id1.equals(id2)).toBe(false);
    });

    it("should return false when comparing different identifier types even if values are identical", () => {
      const userId = new UserId("common_id");
      const invoiceId = new InvoiceId("common_id");
      expect(userId.equals(invoiceId as any)).toBe(false);
    });

    it("should return false when comparing against null, undefined or plain object", () => {
      const id = new UserId("abc");
      expect(id.equals(null as any)).toBe(false);
      expect(id.equals(undefined)).toBe(false);
      expect(id.equals({ value: "abc" } as any)).toBe(false);
    });
  });

  describe("Serialization (IU-006)", () => {
    it("should convert to string with toString()", () => {
      const strId = new UserId("user-123");
      const numId = new NumericId(456);
      expect(strId.toString()).toBe("user-123");
      expect(numId.toString()).toBe("456");
    });

    it("should serialize to raw primitive value during JSON stringify", () => {
      const strId = new UserId("user-123");
      const numId = new NumericId(456);
      
      const payload = {
        userId: strId,
        numId: numId,
        meta: "data",
      };

      expect(JSON.stringify(payload)).toBe('{"userId":"user-123","numId":456,"meta":"data"}');
    });
  });

  describe("UniqueEntityID (UUID Implementation)", () => {
    describe("Factory Methods (IU-004)", () => {
      it("should generate a valid random UUID v4 if instantiated without args", () => {
        const id = new UniqueEntityID();
        expect(id.value).toBeDefined();
        expect(id.value).toHaveLength(36);
        
        // Standard UUID regex check
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        expect(uuidRegex.test(id.value)).toBe(true);
      });

      it("should generate unique values on sequential calls", () => {
        const id1 = new UniqueEntityID();
        const id2 = new UniqueEntityID();
        expect(id1.equals(id2)).toBe(false);
      });

      it("should instantiate with specific valid UUID v4 via static constructor", () => {
        const raw = "550e8400-e29b-41d4-a716-446655440000";
        const id = UniqueEntityID.from(raw);
        expect(id.value).toBe(raw);
      });
    });

    describe("UUID Format Validation (IU-005)", () => {
      it("should reject invalid UUID formats", () => {
        expect(() => new UniqueEntityID("not-a-uuid")).toThrow("Invalid UUID format.");
        expect(() => UniqueEntityID.from("12345")).toThrow("Invalid UUID format.");
      });
    });
  });
});
