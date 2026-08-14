export interface ValidationError {
  field: string;
  message: string;
}

/**
 * ValidationContext collecting and tracking validation error list.
 */
export class ValidationContext {
  private errors: ValidationError[] = [];

  /**
   * Appends an error associated with a target field name.
   */
  public addError(field: string, message: string): void {
    this.errors.push({ field, message });
  }

  /**
   * Returns validation errors list.
   */
  public getErrors(): ValidationError[] {
    return this.errors;
  }

  /**
   * Asserts whether validation has accumulated any errors.
   */
  public isValid(): boolean {
    return this.errors.length === 0;
  }
}
