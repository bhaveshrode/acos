import { ValidationFailure } from "./ValidationFailure.js";

/**
 * Interface representing a validation rule for a specific type of value T.
 */
export interface ValidationRule<T> {
  /**
   * Evaluates the value against the rule.
   * Returns a ValidationFailure if the rule is violated, or null if it passes.
   * @param value The value to validate.
   * @param property The property name representing the value.
   */
  validate(value: T, property: string): ValidationFailure | null;
}

/**
 * Rule asserting that a value must be provided (not null, undefined, or empty/whitespace string).
 */
export class RequiredRule implements ValidationRule<any> {
  constructor(private readonly customMessage?: string) {}

  public validate(value: any, property: string): ValidationFailure | null {
    const isInvalid =
      value === null ||
      value === undefined ||
      (typeof value === "string" && value.trim() === "");

    if (isInvalid) {
      const msg = this.customMessage || `${property} is required.`;
      return new ValidationFailure(property, msg);
    }
    return null;
  }
}

/**
 * Rule asserting that a string length falls within a specific range.
 */
export class StringLengthRule implements ValidationRule<string> {
  constructor(
    private readonly min: number,
    private readonly max: number,
    private readonly customMessage?: string
  ) {
    if (min < 0 || max < min) {
      throw new Error("Invalid min and max bounds for StringLengthRule.");
    }
  }

  public validate(value: string, property: string): ValidationFailure | null {
    // If value is null/undefined, let RequiredRule handle it; return success here
    if (value === null || value === undefined) {
      return null;
    }

    const length = value.length;
    if (length < this.min || length > this.max) {
      const msg =
        this.customMessage ||
        `${property} length must be between ${this.min} and ${this.max} characters.`;
      return new ValidationFailure(property, msg);
    }
    return null;
  }
}

/**
 * Rule asserting that a string matches a Regular Expression pattern.
 */
export class PatternRule implements ValidationRule<string> {
  constructor(
    private readonly pattern: RegExp,
    private readonly customMessage?: string
  ) {
    if (!pattern) {
      throw new Error("RegExp pattern must be provided for PatternRule.");
    }
  }

  public validate(value: string, property: string): ValidationFailure | null {
    if (value === null || value === undefined) {
      return null;
    }

    if (!this.pattern.test(value)) {
      const msg = this.customMessage || `${property} format is invalid.`;
      return new ValidationFailure(property, msg);
    }
    return null;
  }
}

/**
 * Rule asserting that a number falls within a specific numeric range.
 */
export class RangeRule implements ValidationRule<number> {
  constructor(
    private readonly min: number,
    private readonly max: number,
    private readonly customMessage?: string
  ) {
    if (max < min) {
      throw new Error("Invalid min and max bounds for RangeRule.");
    }
  }

  public validate(value: number, property: string): ValidationFailure | null {
    if (value === null || value === undefined) {
      return null;
    }

    if (value < this.min || value > this.max) {
      const msg =
        this.customMessage ||
        `${property} must be between ${this.min} and ${this.max}.`;
      return new ValidationFailure(property, msg);
    }
    return null;
  }
}
