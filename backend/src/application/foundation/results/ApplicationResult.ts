/**
 * Envelope representing standard CQRS response outcomes.
 */
export class ApplicationResult<T> {
  public readonly isSuccess: boolean;
  public readonly value: T | null;
  public readonly errors: string[];

  private constructor(isSuccess: boolean, value: T | null, errors: string[]) {
    this.isSuccess = isSuccess;
    this.value = value;
    this.errors = errors;
  }

  /**
   * Generates a successful ApplicationResult wrapper.
   */
  public static success<T>(value: T): ApplicationResult<T> {
    return new ApplicationResult<T>(true, value, []);
  }

  /**
   * Generates a failed ApplicationResult wrapper.
   */
  public static failure<T>(errors: string[] | string): ApplicationResult<T> {
    const errorList = Array.isArray(errors) ? errors : [errors];
    return new ApplicationResult<T>(false, null, errorList);
  }
}
