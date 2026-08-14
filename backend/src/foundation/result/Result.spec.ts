import { describe, it, expect } from "vitest";
import { Result } from "./Result.js";
import { ResultError } from "./ResultError.js";

describe("Result Unit Tests", () => {
  const mockError = new ResultError("ERROR_CODE", "Something went wrong.");

  describe("Success Results", () => {
    it("should instantiate a success result carrying a value", () => {
      const result = Result.ok<string>("Success value");
      
      expect(result.isSuccess).toBe(true);
      expect(result.isFailure).toBe(false);
      expect(result.value).toBe("Success value");
    });

    it("should allow success result carrying no value (void representation)", () => {
      const result = Result.ok<void>();
      
      expect(result.isSuccess).toBe(true);
      expect(result.isFailure).toBe(false);
      expect(result.value).toBeUndefined();
    });

    it("should throw an error when attempting to access error on a success result", () => {
      const result = Result.ok("Happy path");
      
      expect(() => result.error).toThrow(
        "Cannot access the error of a success result. Check isFailure first."
      );
    });
  });

  describe("Failure Results", () => {
    it("should instantiate a failure result carrying an error", () => {
      const result = Result.fail<string>(mockError);
      
      expect(result.isSuccess).toBe(false);
      expect(result.isFailure).toBe(true);
      expect(result.error).toBe(mockError);
    });

    it("should throw an error when attempting to instantiate a failure with null or undefined", () => {
      expect(() => Result.fail(null as any)).toThrow("Failure result must be provided with an error.");
      expect(() => Result.fail(undefined as any)).toThrow("Failure result must be provided with an error.");
    });

    it("should throw an error when attempting to access value on a failure result", () => {
      const result = Result.fail(mockError);
      
      expect(() => result.value).toThrow(
        "Cannot access the value of a failure result. Check isSuccess first."
      );
    });
  });

  describe("Immutability", () => {
    it("should freeze properties of the result instance", () => {
      const result = Result.ok("data");
      expect(() => {
        (result as any).isSuccess = false;
      }).toThrow();
      expect(() => {
        (result as any).value = "new data";
      }).toThrow();
    });
  });

  describe("Result.combine Utility", () => {
    it("should return a success Result when all input results are successful", () => {
      const r1 = Result.ok<number>(10);
      const r2 = Result.ok<string>("hello");
      const r3 = Result.ok<void>();

      const combined = Result.combine([r1, r2, r3]);
      
      expect(combined.isSuccess).toBe(true);
      expect(combined.isFailure).toBe(false);
    });

    it("should return the first failure result encountered in the input array", () => {
      const err1 = new ResultError("ERR_1", "First error");
      const err2 = new ResultError("ERR_2", "Second error");

      const r1 = Result.ok<number>(10);
      const r2 = Result.fail<string>(err1);
      const r3 = Result.fail<void>(err2);

      const combined = Result.combine([r1, r2, r3]);

      expect(combined.isSuccess).toBe(false);
      expect(combined.isFailure).toBe(true);
      expect(combined.error).toBe(err1); // Returns the first failure
    });

    it("should return success when input array is empty", () => {
      const combined = Result.combine([]);
      expect(combined.isSuccess).toBe(true);
    });
  });
});
