import { describe, it, expect } from "vitest";
import { ResultError } from "./ResultError.js";

describe("ResultError Unit Tests", () => {
  describe("Instantiation & Core Properties", () => {
    it("should instantiate correctly with valid code, message, and metadata", () => {
      const error = new ResultError("INVALID_AMOUNT", "The invoice amount must be positive.", { amount: -50 });
      
      expect(error.code).toBe("INVALID_AMOUNT");
      expect(error.message).toBe("The invoice amount must be positive.");
      expect(error.metadata).toEqual({ amount: -50 });
    });

    it("should convert code to uppercase and trim spaces", () => {
      const error = new ResultError("  bad_code  ", "  some error message  ");
      expect(error.code).toBe("BAD_CODE");
      expect(error.message).toBe("some error message");
    });
  });

  describe("Validation Invariants", () => {
    it("should throw if code is null or empty", () => {
      expect(() => new ResultError("", "Message")).toThrow("ResultError code cannot be null or empty.");
      expect(() => new ResultError("   ", "Message")).toThrow("ResultError code cannot be null or empty.");
      expect(() => new ResultError(null as any, "Message")).toThrow();
      expect(() => new ResultError(undefined as any, "Message")).toThrow();
    });

    it("should throw if message is null or empty", () => {
      expect(() => new ResultError("CODE", "")).toThrow("ResultError message cannot be null or empty.");
      expect(() => new ResultError("CODE", "   ")).toThrow("ResultError message cannot be null or empty.");
      expect(() => new ResultError("CODE", null as any)).toThrow();
      expect(() => new ResultError("CODE", undefined as any)).toThrow();
    });
  });

  describe("Immutability", () => {
    it("should freeze properties of the error instance", () => {
      const error = new ResultError("CODE", "Message");
      expect(() => {
        (error as any).code = "NEW_CODE";
      }).toThrow();
      expect(() => {
        (error as any).message = "New Message";
      }).toThrow();
    });

    it("should deep freeze metadata", () => {
      const error = new ResultError("CODE", "Message", { detail: { value: 10 } });
      
      expect(() => {
        (error.metadata as any).detail.value = 20;
      }).toThrow();
    });
  });

  describe("Static Factories", () => {
    it("should create validation errors with VALIDATION_ERROR code", () => {
      const error = ResultError.validation("Input is invalid", { field: "email" });
      expect(error.code).toBe("VALIDATION_ERROR");
      expect(error.message).toBe("Input is invalid");
      expect(error.metadata).toEqual({ field: "email" });
    });

    it("should create not found errors with NOT_FOUND code", () => {
      const error = ResultError.notFound("Invoice not found", { id: "123" });
      expect(error.code).toBe("NOT_FOUND");
      expect(error.message).toBe("Invoice not found");
      expect(error.metadata).toEqual({ id: "123" });
    });

    it("should create unauthorized errors with UNAUTHORIZED code", () => {
      const error = ResultError.unauthorized("Access denied");
      expect(error.code).toBe("UNAUTHORIZED");
      expect(error.message).toBe("Access denied");
    });

    it("should create conflict errors with CONFLICT code", () => {
      const error = ResultError.conflict("Invoice state conflict", { status: "PAID" });
      expect(error.code).toBe("CONFLICT");
      expect(error.message).toBe("Invoice state conflict");
      expect(error.metadata).toEqual({ status: "PAID" });
    });
  });
});
