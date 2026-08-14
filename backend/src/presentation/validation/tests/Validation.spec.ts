import { describe, it, expect, beforeEach } from "vitest";
import { ValidationContext, ValidationError } from "../ValidationContext.js";
import { ValidationException } from "../ValidationException.js";
import { ValidationErrorFormatter } from "../ValidationErrorFormatter.js";
import { RequiredRule, MinLengthRule, PatternRule } from "../ValidationRule.js";
import { ValidationSchema } from "../ValidationSchema.js";
import { RequestValidator } from "../RequestValidator.js";
import { BodyValidator } from "../BodyValidator.js";
import { QueryValidator } from "../QueryValidator.js";
import { RouteParameterValidator } from "../RouteParameterValidator.js";
import { HeaderValidator } from "../HeaderValidator.js";
import { RequestBinder } from "../RequestBinder.js";
import { ValidationRegistry } from "../ValidationRegistry.js";
import { ValidationFactory } from "../ValidationFactory.js";

describe("Presentation Validation Component Tests (Task 44.8)", () => {
  beforeEach(() => {
    ValidationRegistry.clear();
  });

  describe("ValidationContext & Exception structures", () => {
    it("should accumulate errors and track validity correctly", () => {
      const ctx = new ValidationContext();
      expect(ctx.isValid()).toBe(true);

      ctx.addError("email", "Field is required");
      expect(ctx.isValid()).toBe(false);
      expect(ctx.getErrors()).toEqual([{ field: "email", message: "Field is required" }]);
    });

    it("should carry errors list inside ValidationException", () => {
      const errors: ValidationError[] = [{ field: "name", message: "Too short" }];
      const exc = new ValidationException(errors);
      expect(exc.errors).toEqual(errors);
      expect(exc.name).toBe("ValidationException");
    });
  });

  describe("ValidationErrorFormatter & ValidationRules", () => {
    it("should format errors into standard HTTP body payload", () => {
      const errors = [{ field: "age", message: "Must be positive" }];
      const formatted = ValidationErrorFormatter.format(errors);
      expect(formatted).toEqual({
        error: "Validation Failed",
        details: [{ field: "age", message: "Must be positive" }]
      });
    });

    it("should validate RequiredRule successfully", () => {
      const rule = new RequiredRule();
      expect(rule.validate("bob")).toBeNull();
      expect(rule.validate("")).toBe("Field is required");
      expect(rule.validate(null)).toBe("Field is required");
      expect(rule.validate(undefined)).toBe("Field is required");
    });

    it("should validate MinLengthRule successfully", () => {
      const rule = new MinLengthRule(4);
      expect(rule.validate("alex")).toBeNull();
      expect(rule.validate("bob")).toBe("Minimum length is 4");
      expect(rule.validate(123)).toBeNull(); // Ignore non-string
    });

    it("should validate PatternRule successfully", () => {
      const rule = new PatternRule(/^\d+$/, "digits only");
      expect(rule.validate("1234")).toBeNull();
      expect(rule.validate("12a4")).toBe("Must match format: digits only");
    });
  });

  describe("RequestValidator & Schemas", () => {
    it("should evaluate validation schemas against payload data", () => {
      const schema = new ValidationSchema({
        username: { rules: [new RequiredRule(), new MinLengthRule(5)] },
        code: { rules: [new PatternRule(/^\d+$/, "numbers")] }
      });

      const validator = new RequestValidator();

      // Valid case
      const ctx1 = validator.validate({ username: "alexsmith", code: "99" }, schema);
      expect(ctx1.isValid()).toBe(true);

      // Invalid case
      const ctx2 = validator.validate({ username: "bob", code: "abc" }, schema);
      expect(ctx2.isValid()).toBe(false);
      expect(ctx2.getErrors().length).toBe(2);
    });
  });

  describe("Parameter Validators & Binders", () => {
    let reqValidator: RequestValidator;
    let schema: ValidationSchema;

    beforeEach(() => {
      reqValidator = new RequestValidator();
      schema = new ValidationSchema({
        id: { rules: [new RequiredRule()] }
      });
    });

    it("should validate HTTP body parameters or throw ValidationException", () => {
      const validator = new BodyValidator(reqValidator);
      expect(() => validator.validate({}, schema)).toThrow(ValidationException);
      expect(() => validator.validate({ id: "1" }, schema)).not.toThrow();
    });

    it("should validate HTTP query parameters or throw ValidationException", () => {
      const validator = new QueryValidator(reqValidator);
      expect(() => validator.validate({}, schema)).toThrow(ValidationException);
      expect(() => validator.validate({ id: "1" }, schema)).not.toThrow();
    });

    it("should validate URI route variables or throw ValidationException", () => {
      const validator = new RouteParameterValidator(reqValidator);
      expect(() => validator.validate({}, schema)).toThrow(ValidationException);
      expect(() => validator.validate({ id: "1" }, schema)).not.toThrow();
    });

    it("should validate HTTP headers or throw ValidationException", () => {
      const validator = new HeaderValidator(reqValidator);
      expect(() => validator.validate({}, schema)).toThrow(ValidationException);
      expect(() => validator.validate({ id: "1" }, schema)).not.toThrow();
    });

    it("should bind request parameter sets into single DTO configurations", () => {
      const binder = new RequestBinder();
      const bound = binder.bind<any>({
        params: { id: "p1" },
        query: { search: "query" },
        body: { description: "text" }
      });
      expect(bound).toEqual({
        id: "p1",
        search: "query",
        description: "text"
      });
    });
  });

  describe("ValidationRegistry & Factories", () => {
    it("should register and fetch schemas through ValidationRegistry", () => {
      const schema = new ValidationSchema({});
      ValidationRegistry.registerSchema("UserSchema", schema);

      expect(ValidationRegistry.getSchema("UserSchema")).toBe(schema);
      expect(ValidationRegistry.getSchema("NonExistent")).toBeUndefined();
    });

    it("should build validators and binders using ValidationFactory", () => {
      const rv = ValidationFactory.createRequestValidator();
      expect(rv).toBeInstanceOf(RequestValidator);

      expect(ValidationFactory.createBodyValidator(rv)).toBeInstanceOf(BodyValidator);
      expect(ValidationFactory.createQueryValidator(rv)).toBeInstanceOf(QueryValidator);
      expect(ValidationFactory.createRouteValidator(rv)).toBeInstanceOf(RouteParameterValidator);
      expect(ValidationFactory.createHeaderValidator(rv)).toBeInstanceOf(HeaderValidator);
      expect(ValidationFactory.createRequestBinder()).toBeInstanceOf(RequestBinder);
    });
  });
});
