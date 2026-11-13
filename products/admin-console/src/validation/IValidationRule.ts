/**
 * IValidationRule defining the validation contract for rules.
 */
export interface IValidationRule {
  name: string;
  validate(value: any, context?: any): Promise<string | undefined> | string | undefined;
}
