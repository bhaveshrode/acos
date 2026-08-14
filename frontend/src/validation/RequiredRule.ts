import { ValidationRule } from "./ValidationRule.js";

/**
 * RequiredRule enforcing mandatory values checks.
 */
export class RequiredRule extends ValidationRule {
  constructor(message: string = "Value is required") {
    super("Required", message);
  }

  public validate(value: any): string | undefined {
    if (value === undefined || value === null || value === "") return this.errorMessageTemplate;
    return undefined;
  }
}
