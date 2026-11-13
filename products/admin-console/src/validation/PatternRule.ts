import { ValidationRule } from "./ValidationRule.js";

/**
 * PatternRule validating regular expression patterns.
 */
export class PatternRule extends ValidationRule {
  constructor(public readonly pattern: RegExp, message: string = "Format is invalid") {
    super("Pattern", message, { pattern: pattern.source });
  }

  public validate(value: any): string | undefined {
    if (value && typeof value === "string" && !this.pattern.test(value)) return this.errorMessageTemplate;
    return undefined;
  }
}
