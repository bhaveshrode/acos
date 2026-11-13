import { describe, it, expect, beforeEach, vi } from "vitest";
import { ValidationState } from "../ValidationState.js";
import { ValidationContext } from "../ValidationContext.js";
import { ValidationResult } from "../ValidationResult.js";
import { ValidationSchema } from "../ValidationSchema.js";
import { ValidationDescriptor } from "../ValidationDescriptor.js";
import { ValidationRegistry } from "../ValidationRegistry.js";
import { ValidationResolver } from "../ValidationResolver.js";
import { RequiredRule } from "../RequiredRule.js";
import { MinLengthRule } from "../MinLengthRule.js";
import { MaxLengthRule } from "../MaxLengthRule.js";
import { RangeRule } from "../RangeRule.js";
import { PatternRule } from "../PatternRule.js";
import { EmailRule } from "../EmailRule.js";
import { CustomRule } from "../CustomRule.js";
import { FieldValidator } from "../FieldValidator.js";
import { ObjectValidator } from "../ObjectValidator.js";
import { ValidationPipeline } from "../ValidationPipeline.js";
import { ValidationSummary } from "../ValidationSummary.js";
import { ValidationDecision } from "../ValidationDecision.js";
import { ValidationError } from "../ValidationError.js";
import { ValidationErrorCollection } from "../ValidationErrorCollection.js";
import { ValidationMessageFormatter } from "../ValidationMessageFormatter.js";
import { ValidationErrorMapper } from "../ValidationErrorMapper.js";
import { ValidationEvent } from "../ValidationEvent.js";
import { ValidationEventDispatcher } from "../ValidationEventDispatcher.js";
import { ValidationObserver } from "../ValidationObserver.js";
import { ValidationFactory } from "../ValidationFactory.js";

describe("Frontend Validation Component Unit Tests (Task 72.8)", () => {
  describe("Contexts & Models", () => {
    it("should instantiate ValidationContext and freeze properties", () => {
      const ctx = new ValidationContext({ name: "ACOS" }, { name: "Error" }, { name: "Warn" }, { tenantId: "123" });
      expect(ctx.viewport).toBeUndefined(); // Layout only
      expect(ctx.target.name).toBe("ACOS");
      expect(ctx.errors.name).toBe("Error");
      expect(ctx.warnings.name).toBe("Warn");
      expect(ctx.metadata.tenantId).toBe("123");
      expect(Object.isFrozen(ctx)).toBe(true);
      expect(Object.isFrozen(ctx.errors)).toBe(true);
      expect(Object.isFrozen(ctx.warnings)).toBe(true);
      expect(Object.isFrozen(ctx.metadata)).toBe(true);
    });

    it("should manage ValidationState enum states", () => {
      expect(ValidationState.Pending).toBe("Pending");
      expect(ValidationState.Validating).toBe("Validating");
      expect(ValidationState.Valid).toBe("Valid");
      expect(ValidationState.Invalid).toBe("Invalid");
    });
  });

  describe("Validation Rules & Schemas", () => {
    it("should evaluate RequiredRule", () => {
      const rule = new RequiredRule();
      expect(rule.validate("")).toBe("Value is required");
      expect(rule.validate(null)).toBe("Value is required");
      expect(rule.validate("valid")).toBeUndefined();
    });

    it("should evaluate MinLengthRule and MaxLengthRule", () => {
      const minRule = new MinLengthRule(3);
      expect(minRule.validate("ab")).toBe("Minimum length is {min}");
      expect(minRule.validate("abc")).toBeUndefined();

      const maxRule = new MaxLengthRule(5);
      expect(maxRule.validate("abcdef")).toBe("Maximum length is {max}");
      expect(maxRule.validate("abcde")).toBeUndefined();
    });

    it("should evaluate RangeRule", () => {
      const rule = new RangeRule(10, 20);
      expect(rule.validate(5)).toBe("Value must be between {min} and {max}");
      expect(rule.validate(25)).toBe("Value must be between {min} and {max}");
      expect(rule.validate(15)).toBeUndefined();
    });

    it("should evaluate PatternRule and EmailRule", () => {
      const patternRule = new PatternRule(/^[a-z]+$/);
      expect(patternRule.validate("123")).toBe("Format is invalid");
      expect(patternRule.validate("abc")).toBeUndefined();

      const emailRule = new EmailRule();
      expect(emailRule.validate("invalid")).toBe("Invalid email format");
      expect(emailRule.validate("test@acos.com")).toBeUndefined();
    });

    it("should evaluate CustomRule", async () => {
      const validateFn = (val: any) => (val === "secret" ? undefined : "Access denied");
      const rule = new CustomRule(validateFn);
      expect(await rule.validate("other")).toBe("Access denied");
      expect(await rule.validate("secret")).toBeUndefined();
    });

    it("should construct ValidationSchema and freeze registries", () => {
      const schema = new ValidationSchema();
      const rule = new RequiredRule();
      schema.addRule("name", rule);

      expect(schema.getRules("name")).toContain(rule);
      expect(schema.getProperties()).toContain("name");

      const registry = new ValidationRegistry();
      const descriptor = new ValidationDescriptor("schema-1", schema, { app: "ACOS" });
      registry.register(descriptor);
      expect(registry.get("schema-1")).toBe(descriptor);

      registry.freeze();
      expect(() => registry.register(descriptor)).toThrow(
        "ValidationRegistry is frozen and cannot accept further validation schemas"
      );
    });

    it("should resolve validation descriptors in ValidationResolver", () => {
      const registry = new ValidationRegistry();
      const schema = new ValidationSchema();
      const descriptor = new ValidationDescriptor("schema-1", schema);
      registry.register(descriptor);

      const resolver = new ValidationResolver(registry);
      expect(resolver.resolve("schema-1")).toBe(descriptor);
      expect(() => resolver.resolve("missing")).toThrow(
        "Validation schema with identifier missing is not registered"
      );
    });
  });

  describe("Validation Pipeline", () => {
    it("should run validation pipeline and object validation asynchronously", async () => {
      const schema = new ValidationSchema();
      schema.addRule("name", new RequiredRule("Name req"));
      schema.addRule("email", new EmailRule("Email invalid"));

      const objectValidator = new ObjectValidator();
      const pipeline = new ValidationPipeline(objectValidator);

      const target = { name: "", email: "invalid-email" };
      const res = await pipeline.execute(target, schema);

      expect(res.isValid).toBe(false);
      expect(res.errors.name).toBe("Name req");
      expect(res.errors.email).toBe("Email invalid");

      const summary = ValidationSummary.fromResult(res);
      expect(summary.errorsList).toContain("name: Name req");
      expect(summary.errorsList).toContain("email: Email invalid");

      const decision = await pipeline.executeDecision(target, schema);
      expect(decision.isValid).toBe(false);
      expect(decision.failedRules).toContain("name: Name req");
    });
  });

  describe("Error Management", () => {
    it("should interpolate message formats in ValidationMessageFormatter", () => {
      const formatted = ValidationMessageFormatter.format("Value {val} is not between {min} and {max}", {
        val: 5,
        min: 10,
        max: 20
      });
      expect(formatted).toBe("Value 5 is not between 10 and 20");
    });

    it("should map error collections in ValidationErrorMapper", () => {
      const collection = new ValidationErrorCollection();
      collection.add(new ValidationError("email", "Email required", "Required"));
      
      expect(collection.getForProperty("email")).toHaveLength(1);
      
      const uiMap = ValidationErrorMapper.mapToUi(collection);
      expect(uiMap.email).toBe("Email required");
    });
  });

  describe("Events & Observers", () => {
    it("should dispatch validation events to subscribers", () => {
      const dispatcher = new ValidationEventDispatcher();
      const observer = new ValidationObserver(dispatcher);

      let count = 0;
      const token = observer.observe((ev) => {
        count++;
        expect(ev.targetId).toBe("user-form");
        expect(ev.type).toBe("failed");
        expect(ev.errorsCount).toBe(2);
      });

      dispatcher.dispatch(new ValidationEvent("user-form", "failed", Date.now(), 2));
      expect(count).toBe(1);

      token.dispose();
      dispatcher.dispatch(new ValidationEvent("user-form", "failed", Date.now(), 2));
      expect(count).toBe(1);
    });
  });

  describe("Factory", () => {
    it("should compose factory components", () => {
      const factory = new ValidationFactory();
      const registry = factory.createRegistry();
      expect(registry).toBeInstanceOf(ValidationRegistry);
    });
  });
});
