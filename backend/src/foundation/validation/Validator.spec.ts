import { describe, it, expect } from "vitest";
import { RequiredRule, StringLengthRule, PatternRule, RangeRule } from "./ValidationRule.js";
import { Validator } from "./Validator.js";

// Mock DTO type to test object validations
interface CreateUserDto {
  username: string;
  email: string;
  age: number;
}

describe("Validation Framework Unit Tests (Task 4.2)", () => {
  describe("Concrete Validation Rules", () => {
    describe("RequiredRule", () => {
      const rule = new RequiredRule();
      
      it("should pass for non-empty values", () => {
        expect(rule.validate("hello", "field")).toBeNull();
        expect(rule.validate(123, "field")).toBeNull();
        expect(rule.validate(false, "field")).toBeNull();
      });

      it("should fail for null, undefined, or empty/whitespace strings", () => {
        const failNull = rule.validate(null, "field");
        expect(failNull).not.toBeNull();
        expect(failNull!.property).toBe("field");
        expect(failNull!.message).toBe("field is required.");

        expect(rule.validate(undefined, "field")).not.toBeNull();
        expect(rule.validate("", "field")).not.toBeNull();
        expect(rule.validate("   ", "field")).not.toBeNull();
      });

      it("should support custom error messages", () => {
        const customRule = new RequiredRule("Username must be provided.");
        const failure = customRule.validate(null, "username");
        expect(failure!.message).toBe("Username must be provided.");
      });
    });

    describe("StringLengthRule", () => {
      it("should pass when string length is within range", () => {
        const rule = new StringLengthRule(3, 10);
        expect(rule.validate("abc", "prop")).toBeNull();
        expect(rule.validate("abcdefghij", "prop")).toBeNull();
      });

      it("should fail when string length is out of range", () => {
        const rule = new StringLengthRule(3, 5);
        expect(rule.validate("ab", "prop")).not.toBeNull();
        expect(rule.validate("abcdef", "prop")).not.toBeNull();
      });

      it("should pass if value is null or undefined (leaving requirement to RequiredRule)", () => {
        const rule = new StringLengthRule(3, 5);
        expect(rule.validate(null as any, "prop")).toBeNull();
        expect(rule.validate(undefined as any, "prop")).toBeNull();
      });

      it("should throw error if instantiated with invalid parameters", () => {
        expect(() => new StringLengthRule(-1, 5)).toThrow();
        expect(() => new StringLengthRule(5, 3)).toThrow();
      });
    });

    describe("PatternRule", () => {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const rule = new PatternRule(emailPattern, "Must be a valid email.");

      it("should pass if format is valid", () => {
        expect(rule.validate("test@example.com", "email")).toBeNull();
      });

      it("should fail if format is invalid", () => {
        const failure = rule.validate("invalid-email", "email");
        expect(failure).not.toBeNull();
        expect(failure!.message).toBe("Must be a valid email.");
      });

      it("should pass if value is null or undefined", () => {
        expect(rule.validate(null as any, "email")).toBeNull();
      });

      it("should throw error if pattern is missing", () => {
        expect(() => new PatternRule(null as any)).toThrow();
      });
    });

    describe("RangeRule", () => {
      const rule = new RangeRule(18, 100);

      it("should pass when numeric value is within bounds", () => {
        expect(rule.validate(18, "age")).toBeNull();
        expect(rule.validate(50, "age")).toBeNull();
        expect(rule.validate(100, "age")).toBeNull();
      });

      it("should fail when value is out of bounds", () => {
        expect(rule.validate(17, "age")).not.toBeNull();
        expect(rule.validate(101, "age")).not.toBeNull();
      });

      it("should pass if value is null or undefined", () => {
        expect(rule.validate(null as any, "age")).toBeNull();
      });

      it("should throw if min/max configuration is invalid", () => {
        expect(() => new RangeRule(100, 50)).toThrow();
      });
    });
  });

  describe("Validator Class Object Validation", () => {
    it("should validation succeed if all rules pass", () => {
      const validator = new Validator<CreateUserDto>()
        .rule("username", new RequiredRule())
        .rule("username", new StringLengthRule(3, 20))
        .rule("email", new RequiredRule())
        .rule("email", new PatternRule(/.+@.+\..+/))
        .rule("age", new RangeRule(18, 120));

      const input: CreateUserDto = {
        username: "alice",
        email: "alice@example.com",
        age: 25
      };

      const result = validator.validate(input);
      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(input);
    });

    it("should accumulate failures if multiple properties violate rules", () => {
      const validator = new Validator<CreateUserDto>()
        .rule("username", new RequiredRule())
        .rule("username", new StringLengthRule(5, 10))
        .rule("email", new RequiredRule())
        .rule("age", new RangeRule(18, 100));

      const input: CreateUserDto = {
        username: "bob", // Too short (min 5)
        email: "", // Required rule fail
        age: 15 // Too young (min 18)
      };

      const result = validator.validate(input);
      
      expect(result.isSuccess).toBe(false);
      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe("VALIDATION_ERROR");
      
      const failures = result.error.metadata?.failures;
      expect(failures).toBeDefined();
      expect(failures).toHaveLength(3);

      const props = failures.map((f: any) => f.property);
      expect(props).toContain("username");
      expect(props).toContain("email");
      expect(props).toContain("age");
    });
  });

  describe("Validator.validateValue (Single value checking)", () => {
    it("should pass when value satisfies all specified rules", () => {
      const result = Validator.validateValue("test-value", "field", [
        new RequiredRule(),
        new StringLengthRule(5, 20)
      ]);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe("test-value");
    });

    it("should fail and capture error when rules are violated", () => {
      const result = Validator.validateValue("abc", "username", [
        new RequiredRule(),
        new StringLengthRule(5, 20)
      ]);

      expect(result.isSuccess).toBe(false);
      expect(result.error.code).toBe("VALIDATION_ERROR");
      expect(result.error.metadata?.failures).toHaveLength(1);
      expect(result.error.metadata?.failures[0].property).toBe("username");
    });
  });
});
