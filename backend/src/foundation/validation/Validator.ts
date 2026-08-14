import { Result } from "../result/Result.js";
import { ResultError } from "../result/ResultError.js";
import { ValidationFailure } from "./ValidationFailure.js";
import { ValidationRule } from "./ValidationRule.js";

/**
 * Orchestrator class for checking validation rules against object properties or individual values.
 * Returns outcomes wrapped inside Result containers.
 */
export class Validator<T> {
  private readonly rules: { property: keyof T | string; rule: ValidationRule<any> }[] = [];

  /**
   * Registers a validation rule for a specific property.
   * Enforces type-safety: the rule type must match the property's type.
   * @param property The key of the property to validate.
   * @param rule The validation rule.
   */
  public rule<K extends keyof T>(property: K, rule: ValidationRule<T[K]>): this {
    this.rules.push({ property: property as string, rule });
    return this;
  }

  /**
   * Evaluates the target object against all registered rules.
   * Accumulates all validation violations and returns a failed Result, or ok(target) if all pass.
   * @param target The object instance to validate.
   */
  public validate(target: T): Result<T> {
    if (target === null || target === undefined) {
      return Result.fail(ResultError.validation("Validation target cannot be null or undefined."));
    }

    const failures: ValidationFailure[] = [];

    for (const entry of this.rules) {
      const value = target[entry.property as keyof T];
      const failure = entry.rule.validate(value, entry.property as string);
      if (failure) {
        failures.push(failure);
      }
    }

    if (failures.length > 0) {
      return Result.fail(
        ResultError.validation("Validation failed.", {
          failures: failures.map((f) => f.toJSON())
        })
      );
    }

    return Result.ok(target);
  }

  /**
   * Static utility to validate a single primitive or value directly against a list of rules.
   * Useful inside value object factories or lightweight parameter validations.
   * @param value The raw value to validate.
   * @param property The property name representing the value in errors.
   * @param rules Array of rules to validate against.
   */
  public static validateValue<V>(
    value: V,
    property: string,
    rules: ValidationRule<V>[]
  ): Result<V> {
    const failures: ValidationFailure[] = [];

    for (const rule of rules) {
      const failure = rule.validate(value, property);
      if (failure) {
        failures.push(failure);
      }
    }

    if (failures.length > 0) {
      return Result.fail(
        ResultError.validation(`Validation failed for property: ${property}`, {
          failures: failures.map((f) => f.toJSON())
        })
      );
    }

    return Result.ok(value);
  }
}
