import { ValidationRule } from "./ValidationRule.js";

/**
 * MaxLengthRule validating maximum string lengths.
 */
export class MaxLengthRule extends ValidationRule {
  constructor(public readonly max: number, message: string = "Maximum length is {max}") {
    super("MaxLength", message, { max });
  }

  public validate(value: any): string | undefined {
    if (typeof value === "string" && value.length > this.max) return this.errorMessageTemplate;
    return undefined;
  }
}
