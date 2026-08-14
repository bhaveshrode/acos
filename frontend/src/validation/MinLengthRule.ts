import { ValidationRule } from "./ValidationRule.js";

/**
 * MinLengthRule validating minimum string lengths.
 */
export class MinLengthRule extends ValidationRule {
  constructor(public readonly min: number, message: string = "Minimum length is {min}") {
    super("MinLength", message, { min });
  }

  public validate(value: any): string | undefined {
    if (typeof value === "string" && value.length < this.min) return this.errorMessageTemplate;
    return undefined;
  }
}
