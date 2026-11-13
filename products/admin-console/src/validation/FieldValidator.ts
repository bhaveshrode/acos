import { IValidationRule } from "./IValidationRule.js";

/**
 * FieldValidator evaluating rules lists sequentially on property values.
 */
export class FieldValidator {
  public static async validateField(
    value: any,
    rules: IValidationRule[],
    context?: any
  ): Promise<string | undefined> {
    for (const rule of rules) {
      const error = await rule.validate(value, context);
      if (error) return error;
    }
    return undefined;
  }
}
