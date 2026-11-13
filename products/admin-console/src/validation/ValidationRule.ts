import { IValidationRule } from "./IValidationRule.js";

/**
 * ValidationRule implementing structural validation configurations.
 */
export abstract class ValidationRule implements IValidationRule {
  constructor(
    public readonly name: string,
    public readonly errorMessageTemplate: string,
    public readonly params: Readonly<Record<string, any>> = {}
  ) {
    Object.freeze(this.params);
  }

  public abstract validate(value: any, context?: any): Promise<string | undefined> | string | undefined;
}
