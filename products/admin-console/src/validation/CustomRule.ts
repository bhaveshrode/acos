import { ValidationRule } from "./ValidationRule.js";

/**
 * CustomRule wrapping app-specific async/sync validation routines.
 */
export class CustomRule extends ValidationRule {
  constructor(
    private readonly validateFn: (
      value: any,
      context?: any
    ) => Promise<string | undefined> | string | undefined,
    message: string = "Custom validation failed"
  ) {
    super("Custom", message);
  }

  public validate(value: any, context?: any): Promise<string | undefined> | string | undefined {
    return this.validateFn(value, context);
  }
}
