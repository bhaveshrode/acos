import { ValidationRule } from "./ValidationRule.js";

/**
 * RangeRule validating numeric bounds ranges.
 */
export class RangeRule extends ValidationRule {
  constructor(
    public readonly min: number,
    public readonly max: number,
    message: string = "Value must be between {min} and {max}"
  ) {
    super("Range", message, { min, max });
  }

  public validate(value: any): string | undefined {
    const num = Number(value);
    if (isNaN(num) || num < this.min || num > this.max) return this.errorMessageTemplate;
    return undefined;
  }
}
