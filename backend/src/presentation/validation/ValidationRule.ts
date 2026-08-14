/**
 * ValidationRule contract interface representing a field check constraint.
 */
export interface ValidationRule {
  validate(value: any, context?: any): string | null;
}

/**
 * RequiredRule asserting that a field value is not undefined, null, or empty string.
 */
export class RequiredRule implements ValidationRule {
  public validate(value: any): string | null {
    if (value === undefined || value === null || value === "") {
      return "Field is required";
    }
    return null;
  }
}

/**
 * MinLengthRule asserting a minimum string size threshold.
 */
export class MinLengthRule implements ValidationRule {
  constructor(private readonly min: number) {}
  public validate(value: any): string | null {
    if (typeof value === "string" && value.length < this.min) {
      return `Minimum length is ${this.min}`;
    }
    return null;
  }
}

/**
 * PatternRule asserting that a string matches a regular expression format pattern.
 */
export class PatternRule implements ValidationRule {
  constructor(private readonly pattern: RegExp, private readonly description: string) {}
  public validate(value: any): string | null {
    if (typeof value === "string" && !this.pattern.test(value)) {
      return `Must match format: ${this.description}`;
    }
    return null;
  }
}
