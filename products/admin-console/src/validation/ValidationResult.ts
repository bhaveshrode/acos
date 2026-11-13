/**
 * ValidationResult modeling validation outcomes.
 */
export class ValidationResult {
  private constructor(
    public readonly isValid: boolean,
    public readonly errors: Readonly<Record<string, string>> = {},
    public readonly warnings: Readonly<Record<string, string>> = {}
  ) {
    Object.freeze(this.errors);
    Object.freeze(this.warnings);
    Object.freeze(this);
  }

  public static success(): ValidationResult {
    return new ValidationResult(true);
  }

  public static failure(
    errors: Record<string, string>,
    warnings: Record<string, string> = {}
  ): ValidationResult {
    return new ValidationResult(false, errors, warnings);
  }
}
