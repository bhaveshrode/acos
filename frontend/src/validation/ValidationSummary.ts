import { ValidationResult } from "./ValidationResult.js";

/**
 * ValidationSummary formatting lists of errors and warnings.
 */
export class ValidationSummary {
  constructor(
    public readonly isValid: boolean,
    public readonly errorsList: ReadonlyArray<string> = [],
    public readonly warningsList: ReadonlyArray<string> = []
  ) {
    Object.freeze(this.errorsList);
    Object.freeze(this.warningsList);
    Object.freeze(this);
  }

  public static fromResult(result: ValidationResult): ValidationSummary {
    const errorsList = Object.entries(result.errors).map(([field, msg]) => `${field}: ${msg}`);
    const warningsList = Object.entries(result.warnings).map(([field, msg]) => `${field}: ${msg}`);
    return new ValidationSummary(result.isValid, errorsList, warningsList);
  }
}
