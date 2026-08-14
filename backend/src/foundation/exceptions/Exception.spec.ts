import { describe, it, expect } from "vitest";
import { BaseException } from "./BaseException.js";
import { DomainException } from "./DomainException.js";
import { InfrastructureException } from "./InfrastructureException.js";
import { ValidationException } from "./ValidationException.js";
import { ConfigurationException } from "./ConfigurationException.js";

// Mock concrete implementation to test abstract base behavior
class MockException extends BaseException {
  constructor(message: string, context?: Record<string, any>, cause?: Error) {
    super(message, "MOCK_ERROR", context, cause);
  }
}

describe("Exception Hierarchy Unit Tests (Task 3.2)", () => {
  describe("BaseException Core Behaviors", () => {
    it("should correctly populate standard error attributes", () => {
      const context = { query: "SELECT * FROM users" };
      const innerError = new Error("Connection timed out");
      const ex = new MockException("Database query failed", context, innerError);

      expect(ex.message).toBe("Database query failed");
      expect(ex.code).toBe("MOCK_ERROR");
      expect(ex.name).toBe("MockException");
      expect(ex.context).toEqual(context);
      expect(ex.cause).toBe(innerError);
      expect(ex.stack).toBeDefined();
    });

    it("should allow instantiating with default code if code argument is blank", () => {
      class BlankCodeException extends BaseException {
        constructor() {
          super("Test", "");
        }
      }
      const ex = new BlankCodeException();
      expect(ex.code).toBe("BASE_EXCEPTION");
    });

    it("should freeze the debugging context object", () => {
      const context = { data: { id: 1 } };
      const ex = new MockException("Crash", context);
      
      expect(() => {
        (ex.context as any).data.id = 2; // Should throw due to Object.freeze
      }).toThrow();
    });

    it("should maintain prototype inheritance", () => {
      const ex = new MockException("Mock failed");
      
      expect(ex).toBeInstanceOf(MockException);
      expect(ex).toBeInstanceOf(BaseException);
      expect(ex).toBeInstanceOf(Error);
    });
  });

  describe("Specialized Exception Subclasses", () => {
    it("should instantiate DomainException with DOMAIN_ERROR code", () => {
      const ex = new DomainException("Invariant violated", { value: -1 });
      expect(ex).toBeInstanceOf(DomainException);
      expect(ex).toBeInstanceOf(BaseException);
      expect(ex.code).toBe("DOMAIN_ERROR");
      expect(ex.context).toEqual({ value: -1 });
    });

    it("should instantiate InfrastructureException with INFRASTRUCTURE_ERROR code", () => {
      const inner = new Error("TCP Socket error");
      const ex = new InfrastructureException("Network unavailable", { host: "localhost" }, inner);
      
      expect(ex).toBeInstanceOf(InfrastructureException);
      expect(ex.code).toBe("INFRASTRUCTURE_ERROR");
      expect(ex.cause).toBe(inner);
      expect(ex.context).toEqual({ host: "localhost" });
    });

    it("should instantiate ValidationException with VALIDATION_ERROR code", () => {
      const ex = new ValidationException("Structural check failed", { input: 123 });
      expect(ex).toBeInstanceOf(ValidationException);
      expect(ex.code).toBe("VALIDATION_ERROR");
      expect(ex.context).toEqual({ input: 123 });
    });

    it("should instantiate ConfigurationException with CONFIGURATION_ERROR code", () => {
      const ex = new ConfigurationException("Missing database URL key");
      expect(ex).toBeInstanceOf(ConfigurationException);
      expect(ex.code).toBe("CONFIGURATION_ERROR");
    });
  });
});
